/**
 * Trading-OS v2.01 - Subscription Management Endpoint (Vercel Serverless)
 */

import pg from 'pg';
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId, tier, provider, paymentRef } = req.body || req.query || {};

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const db = getPool();

    if (req.method === 'POST') {
      const selectedTier = (tier === "ELITE" ? "ELITE" : "PRO");
      await db.query(
        `INSERT INTO subscriptions (id, user_id, tier, status, provider, current_period_start, current_period_end, updated_at)
         VALUES ($1, $2, $3, 'ACTIVE', $4, NOW(), NOW() + INTERVAL '30 days', NOW())
         ON CONFLICT (user_id) DO UPDATE SET tier = EXCLUDED.tier, status = 'ACTIVE', provider = EXCLUDED.provider, updated_at = NOW();`,
        [`sub_${userId}`, userId, selectedTier, provider || 'Crypto Checkout']
      );

      return res.status(200).json({ success: true, tier: selectedTier, status: "ACTIVE" });
    }

    const result = await db.query("SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1;", [userId]);
    if (result.rows.length > 0) {
      return res.status(200).json(result.rows[0]);
    }

    return res.status(200).json({ tier: "FREE", status: "ACTIVE" });
  } catch (err) {
    console.error("[Subscriptions API error]:", err);
    return res.status(200).json({ tier: tier || "FREE", status: "ACTIVE" });
  }
}
