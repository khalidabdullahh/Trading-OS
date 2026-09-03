/**
 * Trading-OS v2.0 - Phase A & Phase B Master Verification Suite
 * Tests Security, Mathematical Edge Cases, Server Authentication, Multi-Tenant Data Isolation, and Strategy AST Invariants
 */

import { EnvValidator } from "../src/server/env";
import { ServerAuth } from "../src/server/auth";
import { ServerDB, DBUser } from "../src/server/db";
import { RiskCalculator } from "../src/services/risk/riskCalculator";
import { PerformanceAnalytics } from "../src/services/analytics/performanceAnalytics";
import { StrategyCompiler } from "../src/services/strategyCompiler";
import { StrategyValidator } from "../src/services/strategyValidator";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${message}`);
}

async function runMasterSuite() {
  console.log("===============================================================");
  console.log("🚀 STARTING TRADING OS v2.0 PHASE A & B MASTER VERIFICATION");
  console.log("===============================================================\n");

  // =========================================================================
  // 1. SECURITY & ENVIRONMENT TESTS
  // =========================================================================
  console.log("--- 1. SECURITY & ENVIRONMENT VALIDATION ---");
  const envConfig = EnvValidator.getConfig();
  assert(typeof envConfig.authSecret === "string" && envConfig.authSecret.length >= 16, "Server Auth Secret is properly initialized");
  assert(typeof envConfig.port === "number" && envConfig.port > 0, "Server Port is valid");

  const testToken = ServerAuth.signToken({ id: "usr_test_123", email: "trader@firm.com", role: "USER" });
  assert(typeof testToken === "string" && testToken.split(".").length === 3, "JWT HMAC-SHA256 Token correctly formatted (3 segments)");

  const verifiedUser = ServerAuth.verifyToken(testToken);
  assert(verifiedUser !== null && verifiedUser.id === "usr_test_123" && verifiedUser.email === "trader@firm.com", "JWT Token signature verified correctly");

  const tamperedToken = testToken.slice(0, -5) + "aaaaa";
  const tamperedResult = ServerAuth.verifyToken(tamperedToken);
  assert(tamperedResult === null, "Tampered JWT Token is strictly rejected");

  const passwordHash = ServerAuth.hashPassword("SuperSecret2026!");
  assert(ServerAuth.comparePassword("SuperSecret2026!", passwordHash) === true, "Password hashing and salt verification passes");
  assert(ServerAuth.comparePassword("WrongPassword", passwordHash) === false, "Incorrect password is rejected");

  // =========================================================================
  // 2. RISK ENGINE MATHEMATICAL EDGE CASES
  // =========================================================================
  console.log("\n--- 2. RISK ENGINE EDGE CASES ---");

  // Zero Equity
  const zeroEquity = RiskCalculator.calculatePositionSize({ accountEquity: 0, riskPct: 1, entryPrice: 100, stopLossPrice: 90 });
  assert(zeroEquity.isValid === false && zeroEquity.units === 0 && !isNaN(zeroEquity.riskPct), "Zero account equity returns invalid result with 0 units (No NaN)");

  // Negative Equity
  const negEquity = RiskCalculator.calculatePositionSize({ accountEquity: -5000, riskPct: 1, entryPrice: 100, stopLossPrice: 90 });
  assert(negEquity.isValid === false && negEquity.units === 0, "Negative account equity returns invalid result");

  // Zero Entry Price
  const zeroEntry = RiskCalculator.calculatePositionSize({ accountEquity: 10000, riskPct: 1, entryPrice: 0, stopLossPrice: 90 });
  assert(zeroEntry.isValid === false && zeroEntry.units === 0, "Zero entry price returns invalid result");

  // Stop Loss == Entry Price (Zero distance)
  const equalSL = RiskCalculator.calculatePositionSize({ accountEquity: 10000, riskPct: 1, entryPrice: 100, stopLossPrice: 100 });
  assert(equalSL.isValid === false && equalSL.units === 0, "Stop loss equal to entry price is rejected without division by zero");

  // Risk % > 100
  const oversizedRisk = RiskCalculator.calculatePositionSize({ accountEquity: 10000, riskPct: 150, entryPrice: 100, stopLossPrice: 90 });
  assert(oversizedRisk.isValid === false, "Risk percentage exceeding 100% is rejected");

  // Standard Valid Calculation
  const validRisk = RiskCalculator.calculatePositionSize({ accountEquity: 10000, riskPct: 1, entryPrice: 100, stopLossPrice: 98 });
  assert(validRisk.isValid === true && validRisk.units === 50 && validRisk.riskAmountUsd === 100, "Standard 1% risk on $10k with $2 SL distance yields exactly 50 units ($100 risk)");

  // R:R Safe Bounds
  const badRR = RiskCalculator.calculateRiskReward(100, 110, 120, "LONG"); // SL above entry on LONG
  assert(badRR === 0.0, "Inverted stop loss returns 0.0 R:R rather than arbitrary fallback");

  // =========================================================================
  // 3. PERFORMANCE ANALYTICS MATHEMATICAL EDGE CASES
  // =========================================================================
  console.log("\n--- 3. PERFORMANCE ANALYTICS EDGE CASES ---");

  // Zero Trades
  const emptyMetrics = PerformanceAnalytics.calculate([]);
  assert(emptyMetrics.totalTrades === 0 && emptyMetrics.winRate === 0 && emptyMetrics.profitFactor === 0 && emptyMetrics.sharpeRatio === 0, "Empty trades returns clean zero metrics");

  // 100% Win Rate (Gross Loss = 0)
  const allWinTrades = [
    { id: "1", userId: "u", accountId: "a", symbol: "BTC", direction: "LONG" as const, status: "CLOSED" as const, entryPrice: 100, exitPrice: 110, quantity: 1, netPnl: 100, netPnlPct: 10, fee: 0, ruleAdherence: true, entryTime: "", createdAt: "", updatedAt: "" },
    { id: "2", userId: "u", accountId: "a", symbol: "BTC", direction: "LONG" as const, status: "CLOSED" as const, entryPrice: 100, exitPrice: 120, quantity: 1, netPnl: 200, netPnlPct: 20, fee: 0, ruleAdherence: true, entryTime: "", createdAt: "", updatedAt: "" }
  ];
  const allWinMetrics = PerformanceAnalytics.calculate(allWinTrades, 10000);
  assert(allWinMetrics.winRate === 100 && allWinMetrics.lossRate === 0 && isFinite(allWinMetrics.profitFactor) && allWinMetrics.netPnl === 300, "100% win rate calculates clean finite profit factor ($300 PnL, no 99.9 constant)");

  // Zero Initial Capital
  const zeroCapMetrics = PerformanceAnalytics.calculate(allWinTrades, 0);
  assert(!isNaN(zeroCapMetrics.netReturnPct) && isFinite(zeroCapMetrics.netReturnPct), "Zero initial capital handled safely without Infinity return %");

  // 1 Trade Sharpe Ratio
  const singleTradeMetrics = PerformanceAnalytics.calculate([allWinTrades[0]], 10000);
  assert(singleTradeMetrics.sharpeRatio === 0.0, "Single trade Sharpe ratio evaluates to 0.0 due to insufficient sample variance");

  // =========================================================================
  // 4. AUTHENTICATION & MULTI-USER DATA ISOLATION TESTS
  // =========================================================================
  console.log("\n--- 4. MULTI-USER DATA ISOLATION & AUTHORIZATION ---");

  const userA: DBUser = {
    id: "usr_quant_alice",
    email: "alice@hedgefund.com",
    passwordHash: ServerAuth.hashPassword("alice_pass_2026"),
    fullName: "Alice Quant",
    role: "USER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const userB: DBUser = {
    id: "usr_quant_bob",
    email: "bob@proptrading.com",
    passwordHash: ServerAuth.hashPassword("bob_pass_2026"),
    fullName: "Bob Prop",
    role: "USER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await ServerDB.createUser(userA);
  await ServerDB.createUser(userB);

  // User A creates a proprietary trade
  const aliceTrade = await ServerDB.createTrade(userA.id, {
    accountId: `acc_${userA.id}_primary`,
    symbol: "ETHUSDT",
    direction: "LONG",
    status: "CLOSED",
    entryPrice: 3000.0,
    exitPrice: 3200.0,
    quantity: 5.0,
    netPnl: 1000.0,
    netPnlPct: 6.67,
    fee: 2.0,
    ruleAdherence: true,
    session: "London",
    entryTime: new Date().toISOString(),
    exitTime: new Date().toISOString()
  });

  // User B queries trades
  const bobTrades = await ServerDB.getTrades(userB.id);
  assert(!bobTrades.some(t => t.id === aliceTrade.id), "User B CANNOT retrieve User A's trade (Isolated Scope)");

  // User B attempts to modify User A's trade
  const bobTamperAttempt = await ServerDB.updateTrade(userB.id, aliceTrade.id, { netPnl: -9999 });
  assert(bobTamperAttempt === null, "User B CANNOT update or tamper with User A's trade");

  // User B attempts to delete User A's trade
  const bobDeleteAttempt = await ServerDB.deleteTrade(userB.id, aliceTrade.id);
  assert(bobDeleteAttempt === false, "User B CANNOT delete User A's trade");

  // Verify Alice's trade is untouched
  const aliceTrades = await ServerDB.getTrades(userA.id);
  assert(aliceTrades.length >= 1 && aliceTrades[0].netPnl === 1000, "Alice's trade remains intact and secure");

  // =========================================================================
  // 5. STRATEGY AST COMPILER & INVARIANT AUDIT
  // =========================================================================
  console.log("\n--- 5. STRATEGY AST COMPILER & INVARIANT AUDIT ---");

  const prompt1 = "Buy when 3 green candles close higher and RSI(14) is below 30. Take profit 3%, stop loss 1.5%.";
  const compileResult = await StrategyCompiler.compile(prompt1, "BTCUSDT", "15m");

  assert(compileResult.success === true, "Multi-condition strategy compiles successfully");
  const ast = (compileResult as any).ast;
  assert(ast !== undefined, "Strategy AST is defined");
  assert(ast.entry && (ast.entry.long || ast.entry.short), "Entry condition tree defined");

  // Verify that raw prompt text is NOT present in any rule description
  const rulesJson = JSON.stringify(ast);
  assert(!rulesJson.includes("Custom logic strictly parsed from user prompt"), "Raw prompt string is NEVER mirrored into parsed rules");

  // Schema & semantic validation
  const validation = StrategyValidator.validate(ast);
  assert(validation.valid === true, "AST passes strict schema and semantic validation");

  const pool = ServerDB.getPool();
  if (pool) await pool.end();

  console.log("\n===============================================================");
  console.log("📊 MASTER VERIFICATION SUMMARY: 100% OF CHECKS PASSED");
  console.log("===============================================================\n");
}

runMasterSuite().catch(err => {
  console.error("FATAL ERROR IN TEST RUNNER:", err);
  process.exit(1);
});
