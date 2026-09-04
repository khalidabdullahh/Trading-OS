/**
 * Trading-OS v2.0 Production Google OAuth Callback Endpoint
 * Validates CSRF state, exchanges code with Google, verifies identity, resolves user in Neon PostgreSQL, and issues JWT session
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code, state, error } = req.query || {};

  if (error) {
    console.warn("[Google OAuth Callback] Google returned error:", error);
    return res.redirect(302, `/?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    console.error("[Google OAuth Callback] Missing code or state parameters");
    return res.redirect(302, `/?error=missing_oauth_parameters`);
  }

  const authSecret = process.env.AUTH_SECRET || "trading_os_production_auth_secret_2026";
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("[Google OAuth Callback] Server missing Google OAuth credentials");
    return res.redirect(302, `/?error=google_not_configured`);
  }

  // 1. Validate State HMAC signature and expiration
  const stateParts = String(state).split('.');
  if (stateParts.length !== 2) {
    console.error("[Google OAuth Callback] Malformed state structure");
    return res.redirect(302, `/?error=invalid_oauth_state`);
  }

  const [stateData, stateSig] = stateParts;
  const expectedSig = crypto.createHmac('sha256', authSecret).update(stateData).digest('base64url');
  if (stateSig !== expectedSig) {
    console.error("[Google OAuth Callback] State signature mismatch (CSRF protection triggered)");
    return res.redirect(302, `/?error=csrf_state_mismatch`);
  }

  let returnUrl = '/';
  try {
    const payload = JSON.parse(Buffer.from(stateData, 'base64url').toString('utf8'));
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    if (!payload.ts || now - payload.ts > tenMinutes || payload.ts > now + 60000) {
      console.error("[Google OAuth Callback] State parameter expired");
      return res.redirect(302, `/?error=oauth_state_expired`);
    }
    returnUrl = payload.returnUrl && payload.returnUrl.startsWith('/') ? payload.returnUrl : '/';
  } catch (parseErr) {
    console.error("[Google OAuth Callback] Failed to parse state payload:", parseErr);
    return res.redirect(302, `/?error=invalid_oauth_state_payload`);
  }

  // Determine redirect URI
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const defaultCallback = `${proto}://${host}/api/auth/google/callback`;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || defaultCallback;

  // 2. Exchange authorization code with Google
  let tokenData;
  try {
    const tokenParams = new URLSearchParams({
      code: String(code),
      client_id: clientId.trim(),
      client_secret: clientSecret.trim(),
      redirect_uri: callbackUrl.trim(),
      grant_type: 'authorization_code'
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.json().catch(() => ({}));
      console.error("[Google OAuth Callback] Token exchange failed:", errBody);
      return res.redirect(302, `/?error=token_exchange_failed`);
    }

    tokenData = await tokenRes.json();
  } catch (exchangeErr) {
    console.error("[Google OAuth Callback] Exception during token exchange:", exchangeErr);
    return res.redirect(302, `/?error=token_exchange_exception`);
  }

  if (!tokenData || !tokenData.access_token) {
    console.error("[Google OAuth Callback] No access token received from Google");
    return res.redirect(302, `/?error=no_access_token`);
  }

  // 3. Fetch verified user identity from Google UserInfo endpoint
  let googleUser;
  try {
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    if (!userRes.ok) {
      console.error("[Google OAuth Callback] Google userinfo fetch failed with status:", userRes.status);
      return res.redirect(302, `/?error=userinfo_fetch_failed`);
    }

    googleUser = await userRes.json();
  } catch (userErr) {
    console.error("[Google OAuth Callback] Exception fetching Google userinfo:", userErr);
    return res.redirect(302, `/?error=userinfo_exception`);
  }

  const sub = googleUser?.sub ? String(googleUser.sub).trim() : null;
  const rawEmail = googleUser?.email ? String(googleUser.email).trim().toLowerCase() : null;
  const emailVerified = Boolean(googleUser?.email_verified);
  const fullName = googleUser?.name || rawEmail?.split('@')[0] || "Trader";
  const avatarUrl = googleUser?.picture || null;

  if (!sub || !rawEmail || !emailVerified) {
    console.error("[Google OAuth Callback] Incomplete or unverified Google profile:", googleUser);
    return res.redirect(302, `/?error=unverified_google_account`);
  }

  const isSuperAdmin = ADMIN_EMAILS.some(admin => admin.toLowerCase() === rawEmail);
  const role = isSuperAdmin ? "SUPER_ADMIN" : "USER";
  const tier = isSuperAdmin ? "ELITE" : "FREE";

  // 4. Resolve or create user in Neon PostgreSQL
  let finalUserId;
  let finalFullName = isSuperAdmin ? "Seam Afridi (Super Admin)" : fullName;

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

        // Update profile picture and timestamp
        await client.query(
          `UPDATE profiles SET avatar_url = COALESCE($1, avatar_url), updated_at = NOW() WHERE user_id = $2;`,
          [avatarUrl, finalUserId]
        );
        await client.query(`UPDATE users SET updated_at = NOW() WHERE id = $1;`, [finalUserId]);
      } else {
        // Lookup 2: Query by verified Email
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

          // Link Google provider to existing account
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
            [`prof_${finalUserId}`, finalUserId, isSuperAdmin ? "Seam Afridi (Super Admin)" : fullName, avatarUrl]
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
    console.error("[Google OAuth Callback] Database error:", err);
    return res.redirect(302, `/?error=database_error`);
  }

  // 5. Issue secure JWT token
  const token = signToken({ id: finalUserId, email: rawEmail, role }, authSecret);

  // Clear state cookie
  res.setHeader('Set-Cookie', 'trading_os_oauth_state=; Path=/; HttpOnly; Max-Age=0');

  // Redirect to application with token
  const redirectTarget = `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}auth_token=${encodeURIComponent(token)}`;
  return res.redirect(302, redirectTarget);
}
