const fs = require("fs");
const { Pool } = require("pg");

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync(".env.local")) {
  const lines = fs.readFileSync(".env.local", "utf8").split("\n");
  for (const line of lines) {
    if (line.trim().startsWith("DATABASE_URL=")) {
      dbUrl = line.trim().split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
      break;
    }
  }
}

if (!dbUrl) {
  console.error("❌ DATABASE_URL not found");
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("===============================================================");
    console.log("🚀 STARTING NEON POSTGRESQL PRODUCTION SCHEMA MIGRATION");
    console.log("===============================================================\n");

    await client.query("BEGIN;");

    // 1. Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // 2. Profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(255),
        avatar_url TEXT,
        bio TEXT,
        country VARCHAR(100),
        experience VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tier VARCHAR(32) DEFAULT 'PRO',
        status VARCHAR(32) DEFAULT 'ACTIVE',
        current_period_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        current_period_end TIMESTAMPTZ,
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        provider VARCHAR(50) DEFAULT 'Direct',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Trading Accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trading_accounts (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        broker VARCHAR(100) NOT NULL,
        account_type VARCHAR(32) DEFAULT 'LIVE',
        currency VARCHAR(10) DEFAULT 'USD',
        balance NUMERIC(15, 2) DEFAULT 10000.00,
        equity NUMERIC(15, 2) DEFAULT 10000.00,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON trading_accounts(user_id);
    `);

    // 5. Trading Plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trading_plans (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        max_daily_loss_pct NUMERIC(5, 2) DEFAULT 3.00,
        max_risk_per_trade_pct NUMERIC(5, 2) DEFAULT 1.00,
        max_trades_per_day INT DEFAULT 4,
        allowed_sessions JSONB DEFAULT '["London", "New York"]'::jsonb,
        allowed_markets JSONB DEFAULT '["Crypto", "Forex", "Indices", "Commodities"]'::jsonb,
        entry_criteria JSONB DEFAULT '[]'::jsonb,
        exit_criteria JSONB DEFAULT '[]'::jsonb,
        forbidden_rules JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_plans_user_id ON trading_plans(user_id);
    `);

    // 6. Risk Settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS risk_settings (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        max_account_risk_pct NUMERIC(5, 2) DEFAULT 6.00,
        daily_loss_limit_pct NUMERIC(5, 2) DEFAULT 3.00,
        max_open_positions INT DEFAULT 3,
        trailing_stop_default NUMERIC(5, 2) DEFAULT 1.00,
        break_even_threshold NUMERIC(5, 2) DEFAULT 1.50,
        enforce_strict_risk BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Trades table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_id VARCHAR(64) REFERENCES trading_accounts(id) ON DELETE SET NULL,
        symbol VARCHAR(32) NOT NULL,
        direction VARCHAR(10) NOT NULL,
        status VARCHAR(16) NOT NULL,
        entry_price NUMERIC(15, 6) NOT NULL,
        exit_price NUMERIC(15, 6),
        quantity NUMERIC(15, 6) NOT NULL,
        stop_loss NUMERIC(15, 6),
        take_profit NUMERIC(15, 6),
        net_pnl NUMERIC(15, 2) DEFAULT 0.00,
        net_pnl_pct NUMERIC(8, 4) DEFAULT 0.00,
        fee NUMERIC(10, 2) DEFAULT 0.00,
        r_multiple NUMERIC(6, 2),
        session VARCHAR(32),
        setup VARCHAR(64),
        rule_adherence BOOLEAN DEFAULT TRUE,
        notes TEXT,
        entry_time TIMESTAMPTZ,
        exit_time TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
      CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
      CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
    `);

    // 8. Journal Entries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        trade_id VARCHAR(64) REFERENCES trades(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        tags JSONB DEFAULT '[]'::jsonb,
        emotions JSONB DEFAULT '[]'::jsonb,
        lessons TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id);
    `);

    // 9. Strategies table (Storing Validated AST)
    await client.query(`
      CREATE TABLE IF NOT EXISTS strategies (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        direction VARCHAR(16) DEFAULT 'LONG',
        symbol VARCHAR(32) DEFAULT 'BTCUSDT',
        timeframe VARCHAR(16) DEFAULT '15m',
        category VARCHAR(64),
        ast JSONB NOT NULL,
        structured_rules JSONB,
        default_params JSONB DEFAULT '{}'::jsonb,
        metadata JSONB DEFAULT '{}'::jsonb,
        pine_script_v5 TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
    `);

    // 10. Audit Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(64) NOT NULL,
        entity VARCHAR(64) NOT NULL,
        entity_id VARCHAR(64),
        details JSONB DEFAULT '{}'::jsonb,
        ip_address VARCHAR(45),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
    `);

    await client.query("COMMIT;");
    console.log("✅ [SUCCESS] Neon PostgreSQL Schema Migration Applied Successfully!");

    // Verify created tables
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("\n📊 Verified Neon PostgreSQL Tables in 'public' Schema:");
    tableRes.rows.forEach(r => console.log(`  • ${r.table_name}`));

  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
