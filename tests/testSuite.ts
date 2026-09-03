import { StrategyCompiler } from "../src/services/strategyCompiler.ts";
import { StrategyValidator } from "../src/services/strategyValidator.ts";
import { ASTEvaluator } from "../src/services/astEvaluator.ts";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runAllTests() {
  console.log("==================================================");
  console.log("🧪 TRADING-OS COMPILER & AST VERIFICATION TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ [FAIL] ${name}:`, e.message);
    }
  }

  // Test 0: Candle Strategy Verification
  await test("Test 0: 3-Candle Sequence Strategy (Section 22 Verification)", async () => {
    const prompt = "Make a strategy based on 3 candles. Entry will be long if 2 candles is green and next is red then others will be green and our long entry, also short entry will be 2 candles are red and next is green than trade will short.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation must succeed");
    if (result.success) {
      const ast = result.ast;
      assert(ast.direction === "BOTH", "Direction must be BOTH");
      assert(ast.entry.long !== undefined, "Long entry must be structured");
      assert(ast.entry.short !== undefined, "Short entry must be structured");

      // Check Long condition structure
      assert(ast.entry.long?.type === "AND", "Long condition must be an AND logical group");
      const longConds = (ast.entry.long as any).conditions;
      assert(longConds.length === 3, "Long condition must have 3 candle conditions");
      assert(longConds[0].candleOffset === -2 && longConds[0].property === "bullish", "t-2 must be bullish");
      assert(longConds[1].candleOffset === -1 && longConds[1].property === "bullish", "t-1 must be bullish");
      assert(longConds[2].candleOffset === 0 && longConds[2].property === "bearish", "t-0 must be bearish");

      // Check Short condition structure
      assert(ast.entry.short?.type === "AND", "Short condition must be an AND logical group");
      const shortConds = (ast.entry.short as any).conditions;
      assert(shortConds.length === 3, "Short condition must have 3 candle conditions");
      assert(shortConds[0].candleOffset === -2 && shortConds[0].property === "bearish", "t-2 must be bearish");
      assert(shortConds[1].candleOffset === -1 && shortConds[1].property === "bearish", "t-1 must be bearish");
      assert(shortConds[2].candleOffset === 0 && shortConds[2].property === "bullish", "t-0 must be bullish");

      // Invariant Check: Structured rule summary must NEVER contain the raw prompt or legacy fallback
      assert(!ast.structuredRules?.entryTrigger.includes("Custom logic strictly parsed"), "Must not contain legacy fallback string");
      assert(!ast.structuredRules?.entryTrigger.includes("Make a strategy based on 3 candles"), "Must not leak raw user prompt");
      assert(ast.structuredRules?.entryTrigger.includes("t-2") && ast.structuredRules?.entryTrigger.includes("bullish"), "Must derive clean summary from AST");
    }
  });

  // Test A: Indicator Confluence
  await test("Test A: Indicator Confluence (RSI 14 > 50 AND Price > EMA 200)", async () => {
    const prompt = "Enter long when RSI 14 is above 50 and price is above EMA 200.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation must succeed");
    if (result.success) {
      const ast = result.ast;
      assert(ast.direction === "LONG", "Direction should be LONG");
      assert(ast.entry.long !== undefined, "Long entry must be present");
      const summary = StrategyValidator.formatCondition(ast.entry.long);
      assert(summary.includes("RSI") && summary.includes(">") && summary.includes("50"), "Must have RSI > 50");
      assert(summary.includes("Price") && summary.includes("EMA"), "Must have Price > EMA");
    }
  });

  // Test B: MACD Cross
  await test("Test B: MACD Cross (Short when MACD crosses below signal)", async () => {
    const prompt = "Go short when MACD crosses below the signal line.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation must succeed");
    if (result.success) {
      const ast = result.ast;
      assert(ast.direction === "SHORT", "Direction should be SHORT");
      assert(ast.entry.short !== undefined, "Short entry must be present");
      const summary = StrategyValidator.formatCondition(ast.entry.short);
      assert(summary.includes("MACD") && summary.includes("crosses_below"), "Must have MACD crosses_below");
    }
  });

  // Test C: Price Breakout
  await test("Test C: Price Breakout (Breakout above swing high)", async () => {
    const prompt = "Enter long when price breaks swing high with 10 bars lookback.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation must succeed");
    if (result.success) {
      const ast = result.ast;
      assert(ast.direction === "LONG", "Direction should be LONG");
      const summary = StrategyValidator.formatCondition(ast.entry.long);
      assert(summary.toLowerCase().includes("breakout") || summary.toLowerCase().includes("swing_high"), "Must have breakout condition");
    }
  });

  // Test D: Combined Conditions + Session
  await test("Test D: Multi-Condition + Session (RSI > 50 during London session)", async () => {
    const prompt = "Enter long when RSI is above 50 AND price is above EMA 200, but only during London session.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation must succeed");
    if (result.success) {
      const ast = result.ast;
      const summary = StrategyValidator.formatCondition(ast.entry.long);
      assert(summary.includes("RSI") && summary.includes("London"), "Must include RSI and London session");
    }
  });

  // Test E: Logical OR
  await test("Test E: Logical OR (RSI < 30 OR Bullish Engulfing)", async () => {
    const prompt = "Enter long if RSI is below 30 or bullish engulfing pattern appears.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation must succeed");
    if (result.success) {
      const ast = result.ast;
      assert(ast.entry.long?.type === "OR", "Entry condition must be logical OR");
      assert((ast.entry.long as any).conditions.length === 2, "Must contain 2 branch conditions");
    }
  });

  // Test F: Structured Risk Management
  await test("Test F: Risk Management (Risk 1% per trade, 1:3 R:R)", async () => {
    const prompt = "Risk 1% per trade with 1:3 risk reward. Enter long when RSI is above 50.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation must succeed");
    if (result.success) {
      const ast = result.ast;
      assert(ast.riskManagement?.riskPerTrade === 1.0, "Risk per trade must be 1.0%");
      assert(ast.exit?.bracket?.riskRewardRatio === 3.0, "R:R ratio must be 3.0");
    }
  });

  // Test G: Ambiguous Rule Rejection (Zero Semantic Invention)
  await test("Test G: Ambiguous Rule Rejection ('market looks strong')", async () => {
    const prompt = "Enter when the market looks strong.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === false, "Ambiguous rule must fail compilation");
    assert(result.isAmbiguous === true, "Must be flagged as ambiguous");
    assert(result.error.includes("Ambiguous rule"), "Error message must describe ambiguity");
  });

  // Test H: Empty / Nonsense Input Rejection
  await test("Test H: Rejection of Empty Input", async () => {
    const prompt = "   ";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === false, "Empty prompt must fail");
  });

  // Test I: AST Evaluator Bar-by-Bar Simulation
  await test("Test I: AST Evaluator Execution on Historical Bars", async () => {
    const mockCandles = [
      { time: 1000, open: 100, high: 105, low: 99, close: 104, volume: 1000 },
      { time: 2000, open: 104, high: 108, low: 103, close: 107, volume: 1200 },
      { time: 3000, open: 107, high: 109, low: 101, close: 102, volume: 1500 }, // Bullish, Bullish, Bearish -> Triggers Long!
      { time: 4000, open: 102, high: 106, low: 101, close: 105, volume: 1100 },
      { time: 5000, open: 105, high: 110, low: 104, close: 109, volume: 1300 },
      { time: 6000, open: 109, high: 111, low: 103, close: 104, volume: 1400 },
      { time: 7000, open: 104, high: 108, low: 103, close: 107, volume: 1100 },
      { time: 8000, open: 107, high: 110, low: 106, close: 109, volume: 1200 },
      { time: 9000, open: 109, high: 112, low: 105, close: 106, volume: 1300 },
      { time: 10000, open: 106, high: 108, low: 100, close: 102, volume: 1500 },
      { time: 11000, open: 102, high: 104, low: 98, close: 99, volume: 1600 },
      { time: 12000, open: 99, high: 105, low: 98, close: 104, volume: 1700 } // Bearish, Bearish, Bullish -> Triggers Short!
    ];

    const ast: any = {
      version: "1.0",
      id: "test_ast",
      name: "3-Candle Strategy",
      direction: "BOTH",
      entry: {
        long: {
          type: "AND",
          conditions: [
            { type: "candle", candleOffset: -2, property: "bullish" },
            { type: "candle", candleOffset: -1, property: "bullish" },
            { type: "candle", candleOffset: 0, property: "bearish" }
          ]
        },
        short: {
          type: "AND",
          conditions: [
            { type: "candle", candleOffset: -2, property: "bearish" },
            { type: "candle", candleOffset: -1, property: "bearish" },
            { type: "candle", candleOffset: 0, property: "bullish" }
          ]
        }
      },
      exit: { bracket: { takeProfit: { type: "percent", value: 3, unit: "%" }, stopLoss: { type: "percent", value: 1.5, unit: "%" } } },
      defaultParams: { takeProfitPct: 3, stopLossPct: 1.5 },
      metadata: { summary: "3-Candle Test" }
    };

    const evaluator = new ASTEvaluator(mockCandles);
    const signals = evaluator.evaluateStrategy(ast, "BOTH");
    assert(signals.length > 0, "Evaluator must produce execution signals");
    assert(signals.some(s => s.type === "BUY"), "Must have BUY signal");
    assert(signals.some(s => s.type === "SELL"), "Must have SELL signal");
  });

  console.log("==================================================");
  console.log(`📊 TEST RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests().catch(e => {
  console.error("Test Suite Execution Error:", e);
  process.exit(1);
});
