/**
 * Trading-OS v2.01 - Health Check Endpoint
 */

import pg from 'pg';
const { Pool } = pg;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let dbStatus = "DISCONNECTED";
  if (process.env.DATABASE_URL) {
    try {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      await pool.query("SELECT 1;");
      dbStatus = "CONNECTED_NEON_POSTGRESQL";
    } catch (e) {
      dbStatus = "ERROR_CONNECTING";
    }
  }

  return res.status(200).json({
    status: "HEALTHY",
    version: "2.01.0",
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
}
