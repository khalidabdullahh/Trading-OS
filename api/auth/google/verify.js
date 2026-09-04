/**
 * Trading-OS v2.0 Production Google ID Token Verification Endpoint (for Google One-Tap / GIS)
 * Cryptographically verifies Google ID Token server-side and authenticates Neon PostgreSQL user
 */

import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;
let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
      query_timeout: 15000
    });
  }
  return pool;
}

const ADMIN_EMAILS = [
  "seamafridi123456789@gmail.com",
  "khalid@tradingos.io"
];

function signToken(payload, secret = process.env.AUTH_SECRET || "trading_os_production_auth_secret_2026") {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 72 * 3600;
  const claims = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${claims}`).digest("base64url");
  return `${header}.${claims}.${signature}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { credential } = req.body || {};
  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ error: 'Google credential ID token is required' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const authSecret = process.env.AUTH_SECRET || "trading_os_production_auth_secret_2026";

  // 1. Verify token with Google's official TokenInfo endpoint server-side
  let googlePayload;
  try {
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!verifyRes.ok) {
      console.error("[Google Token Verification] Google tokeninfo rejected token with status:", verifyRes.status);
      return res.status(401).json({ error: 'Invalid Google credential token' });
    }
    googlePayload = await verifyRes.json();
  } catch (err) {
    console.error("[Google Token Verification] Exception communicating with Google:", err);
    return res.status(500).json({ error: 'Failed to verify Google token with Google servers' });
  }

  const sub = googlePayload?.sub ? String(googlePayload.sub).trim() : null;
  const rawEmail = googlePayload?.email ? String(googlePayload.email).trim().toLowerCase() : null;
  const emailVerified = googlePayload?.email_verified === 'true' || googlePayload?.email_verified === true;
  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];

  if (!validIssuers.includes(googlePayload?.iss)) {
    console.error("[Google Token Verification] Invalid token issuer:", googlePayload?.iss);
    return res.status(401).json({ error: 'Invalid Google token issuer' });
  }

  if (clientId && clientId.trim().length > 5 && googlePayload?.aud !== clientId.trim()) {
    console.error("[Google Token Verification] Token audience mismatch:", googlePayload?.aud, "expected:", clientId);
    return res.status(401).json({ error: 'Google token audience mismatch' });
  }

  if (!sub || !rawEmail || !emailVerified) {
    console.error("[Google Token Verification] Token missing sub or verified email:", googlePayload);
    return res.status(401).json({ error: 'Unverified Google account' });
  }

  const isSuperAdmin = ADMIN_EMAILS.some(admin => admin.toLowerCase() === rawEmail);
  const role = isSuperAdmin ? "SUPER_ADMIN" : "USER";
  const tier = isSuperAdmin ? "ELITE" : "FREE";
  const fullName = isSuperAdmin ? "Seam Afridi (Super Admin)" : (googlePayload.name || rawEmail.split('@')[0]);
  const avatarUrl = googlePayload.picture || null;

  // 2. Resolve or create user in Neon PostgreSQL
  let finalUserId;
  let finalFullName = fullName;

  try {
    const db = getPool();
    const client = await db.connect();

    try {
      await client.query("BEGIN;");

      // Lookup 1: Query by Google Provider Account ID (sub)
      const byGoogleId = await client.query(
        `SELECT u.id, u.email, p.full_name, COALESCE(s.tier, 'FREE') as tier
         FROM users u
         LEFT JOIN profiles p ON u.id = p.user_id
         LEFT JOIN subscriptions s ON u.id = s.user_id
         WHERE u.auth_provider = 'google' AND u.provider_account_id = $1 LIMIT 1;`,
        [sub]
      );

      if (byGoogleId.rows.length > 0) {
        finalUserId = byGoogleId.rows[0].id;
        finalFullName = byGoogleId.rows[0].full_name || finalFullName;

        await client.query(
          `UPDATE profiles SET avatar_url = COALESCE($1, avatar_url), updated_at = NOW() WHERE user_id = $2;`,
          [avatarUrl, finalUserId]
        );
        await client.query(`UPDATE users SET updated_at = NOW() WHERE id = $1;`, [finalUserId]);
      } else {
        // Lookup 2: Query by verified email
        const byEmail = await client.query(
          `SELECT u.id, u.email, p.full_name, COALESCE(s.tier, 'FREE') as tier
           FROM users u
           LEFT JOIN profiles p ON u.id = p.user_id
           LEFT JOIN subscriptions s ON u.id = s.user_id
           WHERE LOWER(u.email) = $1 LIMIT 1;`,
          [rawEmail]
        );

        if (byEmail.rows.length > 0) {
          finalUserId = byEmail.rows[0].id;
          finalFullName = byEmail.rows[0].full_name || finalFullName;

          await client.query(
            `UPDATE users SET auth_provider = 'google', provider_account_id = $1, email_verified = TRUE, updated_at = NOW() WHERE id = $2;`,
            [sub, finalUserId]
          );
          await client.query(
            `UPDATE profiles SET avatar_url = COALESCE($1, avatar_url), updated_at = NOW() WHERE user_id = $2;`,
            [avatarUrl, finalUserId]
          );
        } else {
          // Lookup 3: Create new verified user
          finalUserId = isSuperAdmin ? "usr_admin_seamafridi" : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

          await client.query(
            `INSERT INTO users (id, email, password_hash, auth_provider, provider_account_id, email_verified, created_at, updated_at)
             VALUES ($1, $2, NULL, 'google', $3, TRUE, NOW(), NOW())
             ON CONFLICT (id) DO UPDATE SET auth_provider = 'google', provider_account_id = EXCLUDED.provider_account_id, email_verified = TRUE, updated_at = NOW();`,
            [finalUserId, rawEmail, sub]
          );

          await client.query(
            `INSERT INTO profiles (id, user_id, full_name, avatar_url, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url), updated_at = NOW();`,
            [`prof_${finalUserId}`, finalUserId, finalFullName, avatarUrl]
          );

          await client.query(
            `INSERT INTO subscriptions (id, user_id, tier, status, provider, current_period_start, current_period_end, updated_at)
             VALUES ($1, $2, $3, 'ACTIVE', $4, NOW(), NOW() + INTERVAL '100 years', NOW())
             ON CONFLICT (user_id) DO NOTHING;`,
            [`sub_${finalUserId}`, finalUserId, tier, isSuperAdmin ? "System Owner (Lifetime)" : "Direct"]
          );

          await client.query(
            `INSERT INTO trading_accounts (id, user_id, name, broker, account_type, currency, balance, equity, is_default, created_at, updated_at)
             VALUES ($1, $2, 'Primary Quant Account', 'Binance Futures Feed', 'LIVE', 'USD', $3, $3, TRUE, NOW(), NOW())
             ON CONFLICT (id) DO NOTHING;`,
            [`acc_${finalUserId}_primary`, finalUserId, isSuperAdmin ? 100000.0 : 10000.0]
          );

          await client.query(
            `INSERT INTO trading_plans (id, user_id, title, max_daily_loss_pct, max_risk_per_trade_pct, max_trades_per_day, allowed_sessions, allowed_markets)
             VALUES ($1, $2, 'Trading-OS Master Trading Constitution', 3.0, 1.0, 4, '["London", "New York"]'::jsonb, '["Crypto", "Forex", "Indices", "Commodities"]'::jsonb)
             ON CONFLICT (id) DO NOTHING;`,
            [`plan_${finalUserId}`, finalUserId]
          );

          await client.query(
            `INSERT INTO risk_settings (id, user_id, max_account_risk_pct, daily_loss_limit_pct, max_open_positions, enforce_strict_risk)
             VALUES ($1, $2, 6.0, 3.0, 3, TRUE)
             ON CONFLICT (user_id) DO NOTHING;`,
            [`risk_${finalUserId}`, finalUserId]
          );
        }
      }

      await client.query("COMMIT;");
    } catch (dbErr) {
      await client.query("ROLLBACK;");
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[Google Token Verification] Database error:", err);
    return res.status(500).json({ error: 'Database error resolving user' });
  }

  const token = signToken({ id: finalUserId, email: rawEmail, role }, authSecret);

  return res.status(200).json({
    token,
    user: {
      id: finalUserId,
      email: rawEmail,
      fullName: finalFullName,
      role,
      tier,
      avatarUrl
    }
  });
}
