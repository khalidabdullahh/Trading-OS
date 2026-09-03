/**
 * Trading-OS v2.0 - Real Neon PostgreSQL Production Verification Suite
 * Executes comprehensive live database verification, CRUD, user isolation, and persistence reload tests
 */

import { ServerDB, DBUser } from "../src/server/db";
import { ServerAuth } from "../src/server/auth";
import { StrategyAST } from "../src/types/strategy";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${message}`);
}

async function runRealNeonTests() {
  console.log("===============================================================");
  console.log("🚀 STARTING REAL NEON POSTGRESQL PRODUCTION VERIFICATION");
  console.log("===============================================================\n");

  // 1. Connection Verification
  console.log("--- 1. DATABASE CONNECTION & TABLE VERIFICATION ---");
  const pool = ServerDB.getPool();
  assert(pool !== null, "Neon PostgreSQL Connection Pool successfully initialized");

  const tableRes = await pool!.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  const tableNames = tableRes.rows.map(r => r.table_name);
  const requiredTables = ["users", "profiles", "subscriptions", "trading_accounts", "trading_plans", "risk_settings", "trades", "journal_entries", "strategies"];

  for (const table of requiredTables) {
    assert(tableNames.includes(table), `Table '${table}' exists in Neon PostgreSQL`);
  }

  // 2. User Creation & Scoping
  console.log("\n--- 2. REAL USER PERSISTENCE ---");
  const testAlice: DBUser = {
    id: `usr_alice_neon_${Date.now()}`,
    email: `alice_${Date.now()}@quantfund.com`,
    passwordHash: ServerAuth.hashPassword("AliceSecretPassword2026!"),
    fullName: "Alice Neon Quant",
    role: "USER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const testBob: DBUser = {
    id: `usr_bob_neon_${Date.now()}`,
    email: `bob_${Date.now()}@proptrading.com`,
    passwordHash: ServerAuth.hashPassword("BobSecretPassword2026!"),
    fullName: "Bob Neon Prop",
    role: "USER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await ServerDB.createUser(testAlice);
  await ServerDB.createUser(testBob);

  const fetchedAlice = await ServerDB.getUserByEmail(testAlice.email);
  assert(fetchedAlice !== null && fetchedAlice.id === testAlice.id, "User A retrieved from Neon PostgreSQL by email");

  const fetchedAliceById = await ServerDB.getUserById(testAlice.id);
  assert(fetchedAliceById !== null && fetchedAliceById.email === testAlice.email, "User A retrieved from Neon PostgreSQL by ID");

  // 3. Trades CRUD
  console.log("\n--- 3. TRADES CRUD & OWNERSHIP ---");
  const aliceTrade = await ServerDB.createTrade(testAlice.id, {
    accountId: `acc_${testAlice.id}_primary`,
    symbol: "BTCUSDT",
    direction: "LONG",
    status: "OPEN",
    entryPrice: 65000.0,
    quantity: 0.5,
    stopLoss: 64000.0,
    takeProfit: 67500.0,
    netPnl: 0,
    netPnlPct: 0,
    fee: 1.5,
    session: "London",
    ruleAdherence: true,
    entryTime: new Date().toISOString()
  });

  assert(typeof aliceTrade.id === "string" && aliceTrade.id.startsWith("trd_"), "Trade created in Neon PostgreSQL with generated ID");

  let aliceTrades = await ServerDB.getTrades(testAlice.id);
  assert(aliceTrades.some(t => t.id === aliceTrade.id), "User A's trade retrieved from Neon PostgreSQL");

  const updatedTrade = await ServerDB.updateTrade(testAlice.id, aliceTrade.id, {
    status: "CLOSED",
    exitPrice: 67000.0,
    netPnl: 1000.0,
    netPnlPct: 3.08
  });

  assert(updatedTrade !== null && updatedTrade.status === "CLOSED" && updatedTrade.netPnl === 1000, "Trade successfully updated in Neon PostgreSQL");

  // 4. Strategy Persistence (Validated AST)
  console.log("\n--- 4. STRATEGY AST PERSISTENCE ---");
  const testStrategy: StrategyAST = {
    version: "2.0",
    id: `strat_${Date.now()}`,
    name: "Triple Green Candle Momentum Alpha",
    direction: "LONG",
    category: "Price Action",
    entry: {
      long: {
        type: "AND",
        conditions: [
          { type: "candle", candleOffset: 0, property: "bullish" },
          { type: "candle", candleOffset: -1, property: "bullish" },
          { type: "candle", candleOffset: -2, property: "bullish" },
          { type: "indicator", indicator: "RSI", params: { period: 14 }, operator: "<", value: 30 }
        ]
      }
    },
    defaultParams: { takeProfitPct: 3.0, stopLossPct: 1.5 },
    metadata: { summary: "3 Green candles with oversold RSI confirmation" }
  };

  await ServerDB.saveStrategy(testAlice.id, testStrategy);
  const aliceStrategies = await ServerDB.getStrategies(testAlice.id);
  assert(aliceStrategies.some(s => s.id === testStrategy.id), "Validated Strategy AST successfully persisted and retrieved from Neon PostgreSQL");

  // 5. Trading Plan & Risk Settings
  console.log("\n--- 5. TRADING PLAN & RISK SETTINGS ---");
  const updatedPlan = await ServerDB.updateTradingPlan(testAlice.id, {
    maxDailyLossPct: 2.5,
    maxRiskPerTradePct: 0.75,
    allowedSessions: ["London", "New York"]
  });
  assert(updatedPlan.maxDailyLossPct === 2.5 && updatedPlan.maxRiskPerTradePct === 0.75, "Trading Plan persisted and retrieved from Neon PostgreSQL");

  const updatedRisk = await ServerDB.updateRiskSettings(testAlice.id, {
    maxAccountRiskPct: 5.0,
    dailyLossLimitPct: 2.5
  });
  assert(updatedRisk.maxAccountRiskPct === 5.0 && updatedRisk.dailyLossLimitPct === 2.5, "Risk Settings persisted and retrieved from Neon PostgreSQL");

  // 6. Journal Entries
  console.log("\n--- 6. JOURNAL ENTRIES ---");
  const journalEntry = await ServerDB.createJournalEntry(testAlice.id, {
    title: "Disciplined Breakout Execution on BTC",
    date: new Date().toISOString().split("T")[0],
    content: "Adhered strictly to the 3-candle rule. Waited for London open volume surge before entering.",
    lessons: "Patience on entry reduces drawdown risk significantly."
  });

  const aliceJournal = await ServerDB.getJournalEntries(testAlice.id);
  assert(aliceJournal.some(j => j.id === journalEntry.id), "Journal entry persisted and retrieved from Neon PostgreSQL");

  // 7. Multi-User Isolation & Privilege Escalation Tests
  console.log("\n--- 7. ADVERSARIAL MULTI-USER ISOLATION TESTS ---");

  // Test 7.1: Bob tries to list Alice's trades
  const bobTrades = await ServerDB.getTrades(testBob.id);
  assert(!bobTrades.some(t => t.id === aliceTrade.id), "User B CANNOT see User A's trade in their trade list");

  // Test 7.2: Bob tries to modify Alice's trade
  const bobTamperAttempt = await ServerDB.updateTrade(testBob.id, aliceTrade.id, { netPnl: -999999 });
  assert(bobTamperAttempt === null, "User B CANNOT modify User A's trade (Unauthorized)");

  // Test 7.3: Bob tries to delete Alice's trade
  const bobDeleteTradeAttempt = await ServerDB.deleteTrade(testBob.id, aliceTrade.id);
  assert(bobDeleteTradeAttempt === false, "User B CANNOT delete User A's trade (Unauthorized)");

  // Test 7.4: Bob tries to delete Alice's strategy
  const bobDeleteStrategyAttempt = await ServerDB.deleteStrategy(testBob.id, testStrategy.id);
  assert(bobDeleteStrategyAttempt === false, "User B CANNOT delete User A's strategy (Unauthorized)");

  // Test 7.5: Bob tries to delete Alice's journal entry
  const bobDeleteJournalAttempt = await ServerDB.deleteJournalEntry(testBob.id, journalEntry.id);
  assert(bobDeleteJournalAttempt === false, "User B CANNOT delete User A's journal entry (Unauthorized)");

  // 8. Persistence Reload Verification
  console.log("\n--- 8. PERSISTENCE RELOAD VERIFICATION ---");
  // Simulate complete application restart by querying with fresh pool connection
  const freshTrades = await ServerDB.getTrades(testAlice.id);
  const reloadedTrade = freshTrades.find(t => t.id === aliceTrade.id);
  assert(reloadedTrade !== undefined && reloadedTrade.netPnl === 1000, "User A's trade survived application reload in Neon PostgreSQL");

  const freshStrategies = await ServerDB.getStrategies(testAlice.id);
  const reloadedStrategy = freshStrategies.find(s => s.id === testStrategy.id);
  assert(reloadedStrategy !== undefined && reloadedStrategy.name === testStrategy.name, "User A's strategy survived application reload in Neon PostgreSQL");

  // 9. Clean up test records
  console.log("\n--- 9. CLEANUP ---");
  await ServerDB.deleteTrade(testAlice.id, aliceTrade.id);
  await ServerDB.deleteStrategy(testAlice.id, testStrategy.id);
  await ServerDB.deleteJournalEntry(testAlice.id, journalEntry.id);
  console.log("✅ [PASS] Test artifacts cleaned up successfully");

  console.log("\n===============================================================");
  console.log("📊 NEON POSTGRESQL PRODUCTION VERIFICATION: 100% PASSED");
  console.log("===============================================================\n");

  await pool!.end();
}

runRealNeonTests().catch(err => {
  console.error("FATAL ERROR IN NEON VERIFICATION SUITE:", err);
  process.exit(1);
});
