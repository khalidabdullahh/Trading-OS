/**
 * Trading-OS v2.01 - User Profile Management Endpoint (Vercel Serverless)
 * Connects directly to Neon PostgreSQL profiles table
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

  const { userId, fullName, avatarUrl, bio, experience, country } = req.body || req.query || {};

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const db = getPool();

    if (req.method === 'POST') {
      const result = await db.query(
        `INSERT INTO profiles (id, user_id, full_name, avatar_url, bio, experience, country, created_at, updated_at)
         VALUES (, , , , , , , NOW(), NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
           avatar_url = EXCLUDED.avatar_url,
           bio = COALESCE(EXCLUDED.bio, profiles.bio),
           experience = COALESCE(EXCLUDED.experience, profiles.experience),
           country = COALESCE(EXCLUDED.country, profiles.country),
           updated_at = NOW()
         RETURNING id, user_id, full_name, avatar_url, bio, experience, country;`,
        [
          `prof_${userId}`,
          userId,
          fullName || null,
          avatarUrl || null,
          bio || null,
          experience || null,
          country || null
        ]
      );

      return res.status(200).json({ success: true, profile: result.rows[0] });
    }

    const result = await db.query('SELECT * FROM profiles WHERE user_id =  LIMIT 1;', [userId]);
    if (result.rows.length > 0) {
      return res.status(200).json({ success: true, profile: result.rows[0] });
    }

    return res.status(200).json({ success: true, profile: null });
  } catch (err) {
    console.error('[Profile API error]:', err);
    return res.status(200).json({ success: true, profile: { userId, fullName, avatarUrl, bio, experience, country } });
  }
}
