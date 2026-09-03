"use strict";
/**
 * Trading-OS v2.0 - Production Database Access Layer & Neon PostgreSQL Persistence Engine
 * Direct PostgreSQL pooling with parameterized queries, transactions, and strict user scoping
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerDB = void 0;
const pg_1 = require("pg");
const fs = require("fs");
class ServerDB {
    static pool = null;
    static isPostgres = false;
    static getDbUrl() {
        if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 10) {
            return process.env.DATABASE_URL.trim();
        }
        if (fs.existsSync(".env.local")) {
            const lines = fs.readFileSync(".env.local", "utf8").split("\n");
            for (const line of lines) {
                if (line.trim().startsWith("DATABASE_URL=")) {
                    return line.trim().split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
                }
            }
        }
        return null;
    }
    static getPool() {
        if (this.pool)
            return this.pool;
        const dbUrl = this.getDbUrl();
        if (dbUrl) {
            this.pool = new pg_1.Pool({
                connectionString: dbUrl,
                ssl: { rejectUnauthorized: false },
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 30000,
                statement_timeout: 30000,
                query_timeout: 30000
            });
            this.isPostgres = true;
        }
        return this.pool;
    }
    static isPostgresActive() {
        this.getPool();
        return this.isPostgres;
    }
    // =========================================================================
    // 1. USERS & PROFILES
    // =========================================================================
    static async getUserByEmail(email) {
        const pool = this.getPool();
        const clean = email.trim().toLowerCase();
        if (pool) {
            const res = await pool.query(`SELECT u.id, u.email, u.password_hash, p.full_name, 'USER' as role, u.created_at, u.updated_at
         FROM users u
         LEFT JOIN profiles p ON u.id = p.user_id
         WHERE LOWER(u.email) = $1 LIMIT 1;`, [clean]);
            if (res.rows.length === 0)
                return null;
            const row = res.rows[0];
            return {
                id: row.id,
                email: row.email,
                passwordHash: row.password_hash,
                fullName: row.full_name || row.email.split("@")[0],
                role: "USER",
                createdAt: row.created_at?.toISOString() || new Date().toISOString(),
                updatedAt: row.updated_at?.toISOString() || new Date().toISOString()
            };
        }
        return null;
    }
    static async getUserById(id) {
        const pool = this.getPool();
        if (pool) {
            const res = await pool.query(`SELECT u.id, u.email, u.password_hash, p.full_name, 'USER' as role, u.created_at, u.updated_at
         FROM users u
         LEFT JOIN profiles p ON u.id = p.user_id
         WHERE u.id = $1 LIMIT 1;`, [id]);
            if (res.rows.length === 0)
                return null;
            const row = res.rows[0];
            return {
                id: row.id,
                email: row.email,
                passwordHash: row.password_hash,
                fullName: row.full_name || row.email.split("@")[0],
                role: "USER",
                createdAt: row.created_at?.toISOString() || new Date().toISOString(),
                updatedAt: row.updated_at?.toISOString() || new Date().toISOString()
            };
        }
        return null;
    }
    static async createUser(user) {
        const pool = this.getPool();
        if (pool) {
            const client = await pool.connect();
            try {
                await client.query("BEGIN;");
                await client.query(`INSERT INTO users (id, email, password_hash, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW();`, [user.id, user.email.toLowerCase(), user.passwordHash]);
                await client.query(`INSERT INTO profiles (id, user_id, full_name, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, updated_at = NOW();`, [`prof_${user.id}`, user.id, user.fullName]);
                // Seed default trading plan and risk settings if not exists
                await client.query(`INSERT INTO trading_plans (id, user_id, title, max_daily_loss_pct, max_risk_per_trade_pct, max_trades_per_day, allowed_sessions, allowed_markets)
           VALUES ($1, $2, $3, 3.0, 1.0, 4, '["London", "New York"]'::jsonb, '["Crypto", "Forex", "Indices", "Commodities"]'::jsonb)
           ON CONFLICT (id) DO NOTHING;`, [`plan_${user.id}`, user.id, "Trading-OS Master Trading Constitution"]);
                await client.query(`INSERT INTO risk_settings (id, user_id, max_account_risk_pct, daily_loss_limit_pct, max_open_positions, enforce_strict_risk)
           VALUES ($1, $2, 6.0, 3.0, 3, TRUE)
           ON CONFLICT (user_id) DO NOTHING;`, [`risk_${user.id}`, user.id]);
                await client.query(`INSERT INTO trading_accounts (id, user_id, name, broker, account_type, currency, balance, equity, is_default)
           VALUES ($1, $2, 'Main Quant Execution Account', 'Institutional Interbank Feed', 'LIVE', 'USD', 10000.00, 10000.00, TRUE)
           ON CONFLICT (id) DO NOTHING;`, [`acc_${user.id}_primary`, user.id]);
                await client.query(`INSERT INTO subscriptions (id, user_id, tier, status, provider, current_period_start)
           VALUES ($1, $2, 'FREE', 'ACTIVE', 'Direct', NOW())
           ON CONFLICT (user_id) DO NOTHING;`, [`sub_${user.id}`, user.id]);
                await client.query("COMMIT;");
            }
            catch (err) {
                await client.query("ROLLBACK;");
                throw err;
            }
            finally {
                client.release();
            }
        }
        return user;
    }
    // =========================================================================
    // 2. TRADES (Strictly Scoped to Authenticated userId)
    // =========================================================================
    static async getTrades(userId) {
        const pool = this.getPool();
        if (!userId || !pool)
            return [];
        const res = await pool.query(`SELECT id, user_id, account_id, symbol, direction, status, 
              entry_price, exit_price, quantity, stop_loss, take_profit,
              net_pnl, net_pnl_pct, fee, r_multiple, session, setup, 
              rule_adherence, notes, entry_time, exit_time, created_at, updated_at
       FROM trades
       WHERE user_id = $1
       ORDER BY created_at DESC;`, [userId]);
        return res.rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            accountId: r.account_id || `acc_${userId}_primary`,
            symbol: r.symbol,
            direction: r.direction,
            status: r.status,
            entryPrice: parseFloat(r.entry_price),
            exitPrice: r.exit_price ? parseFloat(r.exit_price) : undefined,
            quantity: parseFloat(r.quantity),
            stopLoss: r.stop_loss ? parseFloat(r.stop_loss) : undefined,
            takeProfit: r.take_profit ? parseFloat(r.take_profit) : undefined,
            netPnl: parseFloat(r.net_pnl || "0"),
            netPnlPct: parseFloat(r.net_pnl_pct || "0"),
            fee: parseFloat(r.fee || "0"),
            rMultiple: r.r_multiple ? parseFloat(r.r_multiple) : undefined,
            session: r.session,
            setup: r.setup,
            ruleAdherence: Boolean(r.rule_adherence),
            notes: r.notes,
            entryTime: r.entry_time?.toISOString() || new Date().toISOString(),
            exitTime: r.exit_time?.toISOString(),
            createdAt: r.created_at?.toISOString() || new Date().toISOString(),
            updatedAt: r.updated_at?.toISOString() || new Date().toISOString()
        }));
    }
    static async createTrade(userId, trade) {
        const pool = this.getPool();
        const tradeId = `trd_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const now = new Date();
        if (pool) {
            await pool.query(`INSERT INTO trades (
          id, user_id, account_id, symbol, direction, status,
          entry_price, exit_price, quantity, stop_loss, take_profit,
          net_pnl, net_pnl_pct, fee, r_multiple, session, setup,
          rule_adherence, notes, entry_time, exit_time, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23);`, [
                tradeId,
                userId,
                trade.accountId || null,
                trade.symbol,
                trade.direction,
                trade.status,
                trade.entryPrice,
                trade.exitPrice || null,
                trade.quantity,
                trade.stopLoss || null,
                trade.takeProfit || null,
                trade.netPnl || 0,
                trade.netPnlPct || 0,
                trade.fee || 0,
                trade.rMultiple || null,
                trade.session || null,
                trade.setup || null,
                trade.ruleAdherence !== false,
                trade.notes || null,
                trade.entryTime ? new Date(trade.entryTime) : now,
                trade.exitTime ? new Date(trade.exitTime) : null,
                now,
                now
            ]);
        }
        return {
            ...trade,
            id: tradeId,
            userId,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        };
    }
    static async updateTrade(userId, tradeId, updates) {
        const pool = this.getPool();
        if (!pool)
            return null;
        // Check ownership
        const check = await pool.query(`SELECT id FROM trades WHERE id = $1 AND user_id = $2;`, [tradeId, userId]);
        if (check.rows.length === 0)
            return null; // Unauthorized or not found
        const setClauses = [];
        const values = [];
        let idx = 1;
        if (updates.status !== undefined) {
            setClauses.push(`status = $${idx++}`);
            values.push(updates.status);
        }
        if (updates.exitPrice !== undefined) {
            setClauses.push(`exit_price = $${idx++}`);
            values.push(updates.exitPrice);
        }
        if (updates.netPnl !== undefined) {
            setClauses.push(`net_pnl = $${idx++}`);
            values.push(updates.netPnl);
        }
        if (updates.netPnlPct !== undefined) {
            setClauses.push(`net_pnl_pct = $${idx++}`);
            values.push(updates.netPnlPct);
        }
        if (updates.ruleAdherence !== undefined) {
            setClauses.push(`rule_adherence = $${idx++}`);
            values.push(updates.ruleAdherence);
        }
        setClauses.push(`updated_at = NOW()`);
        values.push(tradeId, userId);
        await pool.query(`UPDATE trades SET ${setClauses.join(", ")} WHERE id = $${idx++} AND user_id = $${idx++};`, values);
        const updated = await this.getTrades(userId);
        return updated.find(t => t.id === tradeId) || null;
    }
    static async deleteTrade(userId, tradeId) {
        const pool = this.getPool();
        if (!pool)
            return false;
        const res = await pool.query(`DELETE FROM trades WHERE id = $1 AND user_id = $2;`, [tradeId, userId]);
        return (res.rowCount || 0) > 0;
    }
    // =========================================================================
    // 3. STRATEGIES (Strictly Scoped to Authenticated userId)
    // =========================================================================
    static async getStrategies(userId) {
        const pool = this.getPool();
        if (!userId || !pool)
            return [];
        const res = await pool.query(`SELECT id, user_id, name, direction, symbol, timeframe, category, 
              ast, structured_rules, default_params, metadata, pine_script_v5, is_active
       FROM strategies
       WHERE user_id = $1
       ORDER BY created_at DESC;`, [userId]);
        return res.rows.map(r => ({
            ...r.ast,
            id: r.id,
            name: r.name,
            direction: r.direction,
            pineScriptV5: r.pine_script_v5,
            defaultParams: r.default_params || {},
            metadata: r.metadata || {},
            structuredRules: r.structured_rules
        }));
    }
    static async saveStrategy(userId, strategy) {
        const pool = this.getPool();
        if (pool) {
            await pool.query(`INSERT INTO strategies (
          id, user_id, name, direction, symbol, timeframe, category,
          ast, structured_rules, default_params, metadata, pine_script_v5, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          direction = EXCLUDED.direction,
          ast = EXCLUDED.ast,
          structured_rules = EXCLUDED.structured_rules,
          default_params = EXCLUDED.default_params,
          metadata = EXCLUDED.metadata,
          pine_script_v5 = EXCLUDED.pine_script_v5,
          updated_at = NOW();`, [
                strategy.id,
                userId,
                strategy.name,
                strategy.direction || "LONG",
                strategy.metadata?.rawPrompt ? "BTCUSDT" : "BTCUSDT",
                "15m",
                strategy.category || "Momentum",
                JSON.stringify(strategy),
                strategy.structuredRules ? JSON.stringify(strategy.structuredRules) : null,
                JSON.stringify(strategy.defaultParams || {}),
                JSON.stringify(strategy.metadata || {}),
                strategy.pineScriptV5 || null
            ]);
        }
        return strategy;
    }
    static async deleteStrategy(userId, strategyId) {
        const pool = this.getPool();
        if (!pool)
            return false;
        const res = await pool.query(`DELETE FROM strategies WHERE id = $1 AND user_id = $2;`, [strategyId, userId]);
        return (res.rowCount || 0) > 0;
    }
    // =========================================================================
    // 4. TRADING PLAN (Strictly Scoped to Authenticated userId)
    // =========================================================================
    static async getTradingPlan(userId) {
        const pool = this.getPool();
        if (pool && userId) {
            const res = await pool.query(`SELECT id, user_id, title, is_active, max_daily_loss_pct, max_risk_per_trade_pct, 
                max_trades_per_day, allowed_sessions, allowed_markets, entry_criteria, 
                exit_criteria, forbidden_rules, created_at, updated_at
         FROM trading_plans
         WHERE user_id = $1 LIMIT 1;`, [userId]);
            if (res.rows.length > 0) {
                const r = res.rows[0];
                return {
                    id: r.id,
                    userId: r.user_id,
                    title: r.title,
                    isActive: Boolean(r.is_active),
                    maxDailyLossPct: parseFloat(r.max_daily_loss_pct),
                    maxRiskPerTradePct: parseFloat(r.max_risk_per_trade_pct),
                    maxTradesPerDay: r.max_trades_per_day,
                    allowedSessions: r.allowed_sessions || ["London", "New York"],
                    allowedMarkets: r.allowed_markets || ["Crypto", "Forex", "Indices", "Commodities"],
                    entryCriteria: r.entry_criteria || [],
                    exitCriteria: r.exit_criteria || [],
                    forbiddenRules: r.forbidden_rules || [],
                    createdAt: r.created_at?.toISOString() || new Date().toISOString(),
                    updatedAt: r.updated_at?.toISOString() || new Date().toISOString()
                };
            }
        }
        const defaultPlan = {
            id: `plan_${userId}`,
            userId,
            title: "Trading-OS Master Trading Constitution",
            isActive: true,
            maxDailyLossPct: 3.0,
            maxRiskPerTradePct: 1.0,
            maxTradesPerDay: 4,
            allowedSessions: ["London", "New York"],
            allowedMarkets: ["Crypto", "Forex", "Indices", "Commodities"],
            entryCriteria: ["Higher Timeframe Confluence", "AST Rule Confirmation", "Minimum 1:2.0 Risk-to-Reward Ratio"],
            exitCriteria: ["Take Profit Target Hit", "Stop Loss Executed"],
            forbiddenRules: ["No revenge trading", "Never move stop loss in losing direction"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        if (pool && userId) {
            await pool.query(`INSERT INTO trading_plans (id, user_id, title, max_daily_loss_pct, max_risk_per_trade_pct, max_trades_per_day, allowed_sessions, allowed_markets, entry_criteria, exit_criteria, forbidden_rules)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING;`, [
                defaultPlan.id,
                userId,
                defaultPlan.title,
                defaultPlan.maxDailyLossPct,
                defaultPlan.maxRiskPerTradePct,
                defaultPlan.maxTradesPerDay,
                JSON.stringify(defaultPlan.allowedSessions),
                JSON.stringify(defaultPlan.allowedMarkets),
                JSON.stringify(defaultPlan.entryCriteria),
                JSON.stringify(defaultPlan.exitCriteria),
                JSON.stringify(defaultPlan.forbiddenRules)
            ]);
        }
        return defaultPlan;
    }
    static async updateTradingPlan(userId, updates) {
        const current = await this.getTradingPlan(userId);
        const updated = {
            ...current,
            ...updates,
            userId,
            updatedAt: new Date().toISOString()
        };
        const pool = this.getPool();
        if (pool) {
            await pool.query(`INSERT INTO trading_plans (id, user_id, title, is_active, max_daily_loss_pct, max_risk_per_trade_pct, max_trades_per_day, allowed_sessions, allowed_markets, entry_criteria, exit_criteria, forbidden_rules, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           is_active = EXCLUDED.is_active,
           max_daily_loss_pct = EXCLUDED.max_daily_loss_pct,
           max_risk_per_trade_pct = EXCLUDED.max_risk_per_trade_pct,
           max_trades_per_day = EXCLUDED.max_trades_per_day,
           allowed_sessions = EXCLUDED.allowed_sessions,
           allowed_markets = EXCLUDED.allowed_markets,
           entry_criteria = EXCLUDED.entry_criteria,
           exit_criteria = EXCLUDED.exit_criteria,
           forbidden_rules = EXCLUDED.forbidden_rules,
           updated_at = NOW();`, [
                updated.id,
                userId,
                updated.title,
                updated.isActive,
                updated.maxDailyLossPct,
                updated.maxRiskPerTradePct,
                updated.maxTradesPerDay,
                JSON.stringify(updated.allowedSessions),
                JSON.stringify(updated.allowedMarkets),
                JSON.stringify(updated.entryCriteria),
                JSON.stringify(updated.exitCriteria),
                JSON.stringify(updated.forbiddenRules)
            ]);
        }
        return updated;
    }
    // =========================================================================
    // 5. RISK SETTINGS (Strictly Scoped to Authenticated userId)
    // =========================================================================
    static async getRiskSettings(userId) {
        const pool = this.getPool();
        if (pool && userId) {
            const res = await pool.query(`SELECT id, user_id, max_account_risk_pct, daily_loss_limit_pct, max_open_positions, 
                trailing_stop_default, break_even_threshold, enforce_strict_risk
         FROM risk_settings
         WHERE user_id = $1 LIMIT 1;`, [userId]);
            if (res.rows.length > 0) {
                const r = res.rows[0];
                return {
                    id: r.id,
                    userId: r.user_id,
                    maxAccountRiskPct: parseFloat(r.max_account_risk_pct),
                    dailyLossLimitPct: parseFloat(r.daily_loss_limit_pct),
                    maxOpenPositions: r.max_open_positions,
                    trailingStopDefault: parseFloat(r.trailing_stop_default),
                    breakEvenThreshold: parseFloat(r.break_even_threshold),
                    enforceStrictRisk: Boolean(r.enforce_strict_risk)
                };
            }
        }
        const defaultRisk = {
            id: `risk_${userId}`,
            userId,
            maxAccountRiskPct: 6.0,
            dailyLossLimitPct: 3.0,
            maxOpenPositions: 3,
            trailingStopDefault: 1.0,
            breakEvenThreshold: 1.5,
            enforceStrictRisk: true
        };
        if (pool && userId) {
            await pool.query(`INSERT INTO risk_settings (id, user_id, max_account_risk_pct, daily_loss_limit_pct, max_open_positions, trailing_stop_default, break_even_threshold, enforce_strict_risk)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (user_id) DO NOTHING;`, [
                defaultRisk.id,
                userId,
                defaultRisk.maxAccountRiskPct,
                defaultRisk.dailyLossLimitPct,
                defaultRisk.maxOpenPositions,
                defaultRisk.trailingStopDefault,
                defaultRisk.breakEvenThreshold,
                defaultRisk.enforceStrictRisk
            ]);
        }
        return defaultRisk;
    }
    static async updateRiskSettings(userId, updates) {
        const current = await this.getRiskSettings(userId);
        const updated = {
            ...current,
            ...updates,
            userId
        };
        const pool = this.getPool();
        if (pool) {
            await pool.query(`INSERT INTO risk_settings (id, user_id, max_account_risk_pct, daily_loss_limit_pct, max_open_positions, trailing_stop_default, break_even_threshold, enforce_strict_risk, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           max_account_risk_pct = EXCLUDED.max_account_risk_pct,
           daily_loss_limit_pct = EXCLUDED.daily_loss_limit_pct,
           max_open_positions = EXCLUDED.max_open_positions,
           trailing_stop_default = EXCLUDED.trailing_stop_default,
           break_even_threshold = EXCLUDED.break_even_threshold,
           enforce_strict_risk = EXCLUDED.enforce_strict_risk,
           updated_at = NOW();`, [
                updated.id,
                userId,
                updated.maxAccountRiskPct,
                updated.dailyLossLimitPct,
                updated.maxOpenPositions,
                updated.trailingStopDefault,
                updated.breakEvenThreshold,
                updated.enforceStrictRisk
            ]);
        }
        return updated;
    }
    // =========================================================================
    // 6. JOURNAL ENTRIES (Strictly Scoped to Authenticated userId)
    // =========================================================================
    static async getJournalEntries(userId) {
        const pool = this.getPool();
        if (!userId || !pool)
            return [];
        const res = await pool.query(`SELECT id, user_id, trade_id, title, content, lessons, created_at, updated_at
       FROM journal_entries
       WHERE user_id = $1
       ORDER BY created_at DESC;`, [userId]);
        return res.rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            tradeId: r.trade_id,
            title: r.title,
            date: r.created_at?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
            content: r.content,
            lessons: r.lessons,
            createdAt: r.created_at?.toISOString() || new Date().toISOString(),
            updatedAt: r.updated_at?.toISOString() || new Date().toISOString()
        }));
    }
    static async createJournalEntry(userId, entry) {
        const pool = this.getPool();
        const entryId = `jnl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const now = new Date();
        if (pool) {
            await pool.query(`INSERT INTO journal_entries (id, user_id, trade_id, title, content, lessons, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`, [
                entryId,
                userId,
                entry.tradeId || null,
                entry.title,
                entry.content,
                entry.lessons || null,
                now,
                now
            ]);
        }
        return {
            ...entry,
            id: entryId,
            userId,
            date: entry.date || now.toISOString().split("T")[0],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        };
    }
    static async deleteJournalEntry(userId, entryId) {
        const pool = this.getPool();
        if (!pool)
            return false;
        const res = await pool.query(`DELETE FROM journal_entries WHERE id = $1 AND user_id = $2;`, [entryId, userId]);
        return (res.rowCount || 0) > 0;
    }
    // =========================================================================
    // 7. TRADING ACCOUNTS (Strictly Scoped to Authenticated userId)
    // =========================================================================
    static async getTradingAccounts(userId) {
        const pool = this.getPool();
        if (!userId || !pool)
            return [];
        const res = await pool.query(`SELECT id, user_id, name, broker, account_type, currency, balance, equity, is_default, created_at, updated_at
       FROM trading_accounts
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at ASC;`, [userId]);
        if (res.rows.length > 0) {
            return res.rows.map(r => ({
                id: r.id,
                userId: r.user_id,
                name: r.name,
                broker: r.broker,
                accountType: r.account_type,
                currency: r.currency,
                balance: parseFloat(r.balance),
                equity: parseFloat(r.equity),
                isDefault: Boolean(r.is_default),
                createdAt: r.created_at?.toISOString() || new Date().toISOString(),
                updatedAt: r.updated_at?.toISOString() || new Date().toISOString()
            }));
        }
        const defaultAcc = {
            id: `acc_${userId}_primary`,
            userId,
            name: "Main Quant Execution Account",
            broker: "Institutional Interbank Feed",
            accountType: "LIVE",
            currency: "USD",
            balance: 10000.0,
            equity: 10000.0,
            isDefault: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await pool.query(`INSERT INTO trading_accounts (id, user_id, name, broker, account_type, currency, balance, equity, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING;`, [
            defaultAcc.id,
            userId,
            defaultAcc.name,
            defaultAcc.broker,
            defaultAcc.accountType,
            defaultAcc.currency,
            defaultAcc.balance,
            defaultAcc.equity,
            defaultAcc.isDefault
        ]);
        return [defaultAcc];
    }
    static async createTradingAccount(userId, account) {
        const pool = this.getPool();
        const accId = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const now = new Date();
        if (pool) {
            await pool.query(`INSERT INTO trading_accounts (id, user_id, name, broker, account_type, currency, balance, equity, is_default, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`, [
                accId,
                userId,
                account.name,
                account.broker,
                account.accountType,
                account.currency || "USD",
                account.balance,
                account.equity,
                account.isDefault || false,
                now,
                now
            ]);
        }
        return {
            ...account,
            id: accId,
            userId,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        };
    }
    // =========================================================================
    // 8. SUBSCRIPTIONS & PAYMENT SETTLEMENT (Neon PostgreSQL)
    // =========================================================================
    static async getSubscription(userId) {
        const pool = this.getPool();
        if (!userId || !pool)
            return { tier: "FREE", status: "ACTIVE" };
        const res = await pool.query(`SELECT id, user_id, tier, status, current_period_start, current_period_end, cancel_at_period_end, provider, created_at, updated_at
       FROM subscriptions
       WHERE user_id = $1 LIMIT 1;`, [userId]);
        if (res.rows.length > 0) {
            const r = res.rows[0];
            return {
                id: r.id,
                userId: r.user_id,
                tier: r.tier || "FREE",
                status: r.status || "ACTIVE",
                currentPeriodStart: r.current_period_start?.toISOString() || new Date().toISOString(),
                currentPeriodEnd: r.current_period_end?.toISOString() || null,
                cancelAtPeriodEnd: Boolean(r.cancel_at_period_end),
                provider: r.provider || "Direct"
            };
        }
        return { tier: "FREE", status: "ACTIVE" };
    }
    static async upgradeSubscription(userId, tier, provider, paymentRef) {
        const pool = this.getPool();
        if (!userId || !pool)
            return false;
        const client = await pool.connect();
        try {
            await client.query("BEGIN;");
            const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await client.query(`INSERT INTO subscriptions (id, user_id, tier, status, provider, current_period_start, current_period_end, updated_at)
         VALUES ($1, $2, $3, 'ACTIVE', $4, NOW(), $5, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           tier = EXCLUDED.tier,
           status = 'ACTIVE',
           provider = EXCLUDED.provider,
           current_period_start = NOW(),
           current_period_end = EXCLUDED.current_period_end,
           updated_at = NOW();`, [`sub_${userId}`, userId, tier, provider, thirtyDaysFromNow]);
            await client.query(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
         VALUES ($1, $2, 'SUBSCRIPTION_UPGRADED', 'Subscription', $3, $4);`, [
                `aud_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                userId,
                `sub_${userId}`,
                JSON.stringify({ tier, provider, paymentRef, timestamp: new Date().toISOString() })
            ]);
            await client.query("COMMIT;");
            return true;
        }
        catch (e) {
            await client.query("ROLLBACK;");
            throw e;
        }
        finally {
            client.release();
        }
    }
}
exports.ServerDB = ServerDB;
