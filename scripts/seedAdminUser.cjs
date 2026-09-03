require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function makeAdmin() {
  const email = "seamafridi123456789@gmail.com";
  const userId = "usr_admin_seamafridi";
  const fullName = "Seam Afridi (Super Admin)";

  try {
    console.log("Connecting to Neon PostgreSQL...");
    await pool.query("BEGIN;");

    // 1. Insert/Update user
    await pool.query(`
      INSERT INTO users (id, email, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW();
    `, [userId, email.toLowerCase(), "admin_secure_hash"]);

    // 2. Insert/Update profile
    await pool.query(`
      INSERT INTO profiles (id, user_id, full_name, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, updated_at = NOW();
    `, [`prof_${userId}`, userId, fullName]);

    // 3. Insert/Update ELITE subscription
    await pool.query(`
      INSERT INTO subscriptions (id, user_id, tier, status, provider, current_period_start, current_period_end, updated_at)
      VALUES ($1, $2, 'ELITE', 'ACTIVE', 'System Owner (Lifetime)', NOW(), NOW() + INTERVAL '100 years', NOW())
      ON CONFLICT (user_id) DO UPDATE SET tier = 'ELITE', status = 'ACTIVE', provider = 'System Owner (Lifetime)', updated_at = NOW();
    `, [`sub_${userId}`, userId]);

    // 4. Insert/Update high-equity Trading Account
    await pool.query(`
      INSERT INTO trading_accounts (id, user_id, name, broker, account_type, currency, balance, equity, is_default, created_at, updated_at)
      VALUES ($1, $2, 'Institutional Master Account', 'Interbank Primary Feed', 'LIVE', 'USD', 100000.0, 100000.0, true, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET balance = 100000.0, equity = 100000.0, updated_at = NOW();
    `, [`acc_${userId}_master`, userId]);

    await pool.query("COMMIT;");
    console.log("✅ Successfully registered seamafridi123456789@gmail.com as SUPER ADMIN in Neon PostgreSQL!");
    process.exit(0);
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error("❌ Error setting admin user:", err);
    process.exit(1);
  }
}

makeAdmin();
