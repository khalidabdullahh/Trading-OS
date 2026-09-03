import { StrategyCompiler } from "../src/services/strategyCompiler";
import { StrategyValidator } from "../src/services/strategyValidator";
import { ASTEvaluator } from "../src/services/astEvaluator";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runAllTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING TRADING-OS COMPILER & AST TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ [FAIL] ${name}:`, e.message);
    }
  }

  async function asyncTest(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ [FAIL] ${name}:`, e.message);
    }
  }

  // 1. Core 3-Candle Strategy Verification Test
  await asyncTest("Test 0: 3-Candle Sequence Strategy", async () => {
    const prompt = "Make a strategy based on 3 candles. Entry will be long if 2 candles is green and next is red then others will be green and our long entry, also short entry will be 2 candles are red and next is green than trade will short.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation should succeed");
    if (result.success) {
      const ast = result.ast;
      assert(ast.direction === "BOTH", "Direction should be BOTH");
      assert(!!ast.entry.long, "Long entry must be defined");
      assert(!!ast.entry.short, "Short entry must be defined");
      assert(ast.entry.long?.type === "AND", "Long entry should be AND composite");
      assert(ast.entry.short?.type === "AND", "Short entry should be AND composite");

      // Verify no raw prompt was put into structured rules
      assert(!ast.structuredRules?.entryTrigger.includes("Custom logic strictly parsed from user prompt"), "Must NOT contain legacy fallback string");
      assert(ast.structuredRules?.entryTrigger.includes("t-2") || ast.structuredRules?.entryTrigger.includes("t-1"), "Should format candle offsets");
    }
  });

  // 2. Test A: Indicator Confluence
  await asyncTest("Test A: RSI 14 above 50 and Price above EMA 200", async () => {
    const prompt = "Enter long when RSI 14 is above 50 and price is above EMA 200.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation should succeed");
    if (result.success) {
      const ast = result.ast;
      assert(ast.direction === "LONG", "Direction should be LONG");
      assert(!!ast.entry.long, "Long condition must exist");
      const summary = StrategyValidator.formatCondition(ast.entry.long);
      assert(summary.includes("RSI") && summary.includes("50"), "Should contain RSI condition");
      assert(summary.includes("Price") || summary.includes("EMA"), "Should contain EMA price condition");
    }
  });

  // 3. Test B: MACD Cross
  await asyncTest("Test B: MACD Cross Below Signal", async () => {
    const prompt = "Go short when MACD crosses below the signal line.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation should succeed");
    if (result.success) {
      const ast = result.ast;
      assert(ast.direction === "SHORT", "Direction should be SHORT");
      assert(!!ast.entry.short, "Short entry condition must exist");
      const summary = StrategyValidator.formatCondition(ast.entry.short);
      assert(summary.includes("MACD") && summary.includes("crosses_below"), "Should have MACD cross below");
    }
  });

  // 4. Test C: Price Breakout
  await asyncTest("Test C: Breakout above swing high", async () => {
    const prompt = "Enter long on breakout above swing high with 10 bars lookback.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation should succeed");
    if (result.success) {
      const ast = result.ast;
      assert(ast.direction === "LONG", "Direction should be LONG");
      const summary = StrategyValidator.formatCondition(ast.entry.long);
      assert(summary.toLowerCase().includes("breakout") || summary.toLowerCase().includes("swing_high"), "Should contain breakout");
    }
  });

  // 5. Test D: Combined Conditions + Session
  await asyncTest("Test D: RSI above 50 during London session", async () => {
    const prompt = "Enter long when RSI is above 50 during London session.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation should succeed");
    if (result.success) {
      const ast = result.ast;
      const summary = StrategyValidator.formatCondition(ast.entry.long);
      assert(summary.includes("RSI") && summary.includes("London"), "Should include both RSI and London session");
    }
  });

  // 6. Test E: Logical OR
  await asyncTest("Test E: Logical OR (RSI < 30 OR Bullish Engulfing)", async () => {
    const prompt = "Enter long if RSI is below 30 or bullish engulfing pattern appears.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation should succeed");
    if (result.success) {
      const ast = result.ast;
      assert(ast.entry.long?.type === "OR", "Entry condition should be OR");
    }
  });

  // 7. Test F: Structured Risk Management
  await asyncTest("Test F: Risk 1% per trade with 1:3 risk reward", async () => {
    const prompt = "Risk 1% per trade with 1:3 risk reward. Enter long when RSI is above 50.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === true, "Compilation should succeed");
    if (result.success) {
      const ast = result.ast;
      assert(ast.riskManagement?.riskPerTrade === 1.0, "Risk per trade should be 1.0%");
      assert(ast.exit?.bracket?.riskRewardRatio === 3.0, "Risk reward ratio should be 3.0");
    }
  });

  // 8. Test G: Ambiguous Rule Rejection (Zero Semantic Invention)
  await asyncTest("Test G: Rejection of Ambiguous Rule ('market looks strong')", async () => {
    const prompt = "Enter when the market looks strong.";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === false, "Ambiguous prompt must fail compilation");
    assert(result.isAmbiguous === true, "Should be flagged as ambiguous");
    assert(result.error.includes("Ambiguous rule"), "Error must explain why it's ambiguous");
  });

  // 9. Test H: Empty / Non-Quantitative Input Rejection
  await asyncTest("Test H: Rejection of Empty/Nonsense Input", async () => {
    const prompt = "";
    const result = await StrategyCompiler.compile(prompt);
    assert(result.success === false, "Empty prompt must fail");
  });

  // 10. Test I: AST Evaluator Bar-by-Bar Simulation
  test("Test I: AST Evaluator Execution on Synthetic Candles", () => {
    const mockCandles = [
      { time: 1000, open: 100, high: 105, low: 99, close: 104, volume: 1000 },
      { time: 2000, open: 104, high: 108, low: 103, close: 107, volume: 1200 },
      { time: 3000, open: 107, high: 109, low: 101, close: 102, volume: 1500 }, // Green, Green, Red
      { time: 4000, open: 102, high: 106, low: 101, close: 105, volume: 1100 },
      { time: 5000, open: 105, high: 110, low: 104, close: 109, volume: 1300 },
      { time: 6000, open: 109, high: 111, low: 103, close: 104, volume: 1400 },
      { time: 7000, open: 104, high: 108, low: 103, close: 107, volume: 1100 },
      { time: 8000, open: 107, high: 110, low: 106, close: 109, volume: 1200 },
      { time: 9000, open: 109, high: 112, low: 105, close: 106, volume: 1300 },
      { time: 10000, open: 106, high: 108, low: 100, close: 102, volume: 1500 },
      { time: 11000, open: 102, high: 104, low: 98, close: 99, volume: 1600 },
      { time: 12000, open: 99, high: 105, low: 98, close: 104, volume: 1700 } // Red, Red, Green
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
    assert(signals.length > 0, "Evaluator should produce signals for valid candle sequence");
  });

  console.log("==================================================");
  console.log(`📊 SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
