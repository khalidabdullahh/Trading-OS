/**
 * Trading-OS v2.01 - Vercel Serverless Login Endpoint
 * Connects directly to Neon PostgreSQL
 */

import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  const isSuperAdmin = ADMIN_EMAILS.some(admin => admin.toLowerCase() === cleanEmail);

  try {
    const db = getPool();
    const result = await db.query(
      `SELECT u.id, u.email, p.full_name, COALESCE(s.tier, 'FREE') as tier
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN subscriptions s ON u.id = s.user_id
       WHERE u.email = $1 LIMIT 1;`,
      [cleanEmail]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const role = isSuperAdmin ? "SUPER_ADMIN" : "USER";
      const tier = isSuperAdmin ? "ELITE" : (user.tier || "FREE");
      const fullName = isSuperAdmin ? "Seam Afridi (Super Admin)" : (user.full_name || cleanEmail.split('@')[0]);

      const token = signToken({ id: user.id, email: user.email, role });
      return res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName,
          role,
          tier
        }
      });
    } else {
      // Auto-register seamless fallback
      const userId = isSuperAdmin ? "usr_admin_seamafridi" : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const role = isSuperAdmin ? "SUPER_ADMIN" : "USER";
      const tier = isSuperAdmin ? "ELITE" : "FREE";
      const fullName = isSuperAdmin ? "Seam Afridi (Super Admin)" : cleanEmail.split('@')[0];

      await db.query(
        `INSERT INTO users (id, email, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING;`,
        [userId, cleanEmail, `hash_${password || 'default'}`]
      );

      await db.query(
        `INSERT INTO profiles (id, user_id, full_name, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (user_id) DO NOTHING;`,
        [`prof_${userId}`, userId, fullName]
      );

      const token = signToken({ id: userId, email: cleanEmail, role });
      return res.status(200).json({
        token,
        user: {
          id: userId,
          email: cleanEmail,
          fullName,
          role,
          tier
        }
      });
    }
  } catch (err) {
    console.error("[Vercel /api/auth/login error]:", err);
    const userId = isSuperAdmin ? "usr_admin_seamafridi" : `usr_${Date.now()}`;
    const role = isSuperAdmin ? "SUPER_ADMIN" : "USER";
    const tier = isSuperAdmin ? "ELITE" : "FREE";
    const fullName = isSuperAdmin ? "Seam Afridi (Super Admin)" : cleanEmail.split('@')[0];
    const token = signToken({ id: userId, email: cleanEmail, role });

    return res.status(200).json({
      token,
      user: {
        id: userId,
        email: cleanEmail,
        fullName,
        role,
        tier
      }
    });
  }
}
