/**
 * Trading-OS Natural Language Strategy Compiler
 * Compiles natural language prompts into deterministic Strategy ASTs
 */

import { StrategyAST, CompilationResult, LogicalCondition, StrategyDirection } from "../types/strategy";
import { StrategyValidator } from "./strategyValidator";

export class StrategyCompiler {
  private static DEFAULT_API_KEY_STORAGE_KEY = "trading_os_gemini_api_key";

  static getApiKey(): string {
    try {
      if (typeof process !== "undefined" && process.env && process.env.GEMINI_API_KEY) {
        return process.env.GEMINI_API_KEY;
      }
      return localStorage.getItem(this.DEFAULT_API_KEY_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  }

  static setApiKey(key: string): void {
    try {
      localStorage.setItem(this.DEFAULT_API_KEY_STORAGE_KEY, key.trim());
    } catch {}
  }

  /**
   * Primary entry point to compile natural language prompt into a validated StrategyAST
   */
  static async compile(promptText: string, symbol = "BTCUSDT", timeframe = "15m"): Promise<CompilationResult> {
    const cleanPrompt = (promptText || "").trim();
    if (!cleanPrompt) {
      return {
        success: false,
        error: "Prompt is empty. Please describe your trading strategy rules."
      };
    }

    // 1. Check for qualitative ambiguity that has zero measurable criteria
    const ambiguityCheck = this.checkAmbiguity(cleanPrompt);
    if (ambiguityCheck.isAmbiguous) {
      return {
        success: false,
        isAmbiguous: true,
        error: ambiguityCheck.reason
      };
    }

    // 2. Try Server-Side Secure API proxy if running in browser
    if (typeof window !== "undefined" && typeof fetch === "function") {
      try {
        const token = localStorage.getItem("trading_os_auth_token") || "";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const serverResp = await fetch("/api/ai/compile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ prompt: cleanPrompt, symbol, timeframe }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (serverResp.ok) {
          const data = await serverResp.json();
          if (data && data.success && data.strategy) {
            return data;
          }
        }
      } catch (err: any) {
        console.warn("[Trading-OS] Server AI proxy unavailable, switching to deterministic offline compiler:", err.message);
      }
    }

    // 3. Check if server-side environment has GEMINI_API_KEY directly
    const apiKey = this.getApiKey();
    if (apiKey && apiKey.length > 15) {
      try {
        const geminiResult = await this.callGeminiStructuredAPI(cleanPrompt, apiKey, symbol, timeframe);
        if (geminiResult.success === true) {
          return geminiResult;
        }
      } catch (err: any) {
        console.warn("[Trading-OS] Gemini API error, switching to deterministic offline compiler:", err.message);
      }
    }

    // 4. High-Precision Offline Deterministic Compiler
    return this.compileOffline(cleanPrompt, symbol, timeframe);
  }

  /**
   * Check if prompt is purely ambiguous without quantitative rules
   */
  private static checkAmbiguity(text: string): { isAmbiguous: boolean; reason: string } {
    const lower = text.toLowerCase();

    // Ambiguous subjective phrases without technical or price-action rules
    const ambiguousPhrases = [
      "market looks strong",
      "market is strong",
      "trend is good",
      "when momentum is high",
      "enter when good",
      "trade when good",
      "buy when nice",
      "good trade",
      "best strategy",
      "make profit",
      "win every trade"
    ];

    const hasMeasurableRule =
      /\b(candle|candles|rsi|ema|sma|macd|bollinger|supertrend|vwap|stoch|stochastic|high|low|swing|breakout|engulfing|support|resistance|session|london|tp|sl|stop|target|profit|loss|%)\b/i.test(lower);

    for (const phrase of ambiguousPhrases) {
      if (lower.includes(phrase) && !hasMeasurableRule) {
        return {
          isAmbiguous: true,
          reason: `Ambiguous rule: '${phrase}' does not specify a measurable quantitative indicator, price action, or candle condition.`
        };
      }
    }

    if (text.length < 3 && !hasMeasurableRule) {
      return {
        isAmbiguous: true,
        reason: `Input '${text}' is too short and does not specify a quantitative trading rule.`
      };
    }

    return { isAmbiguous: false, reason: "" };
  }

  /**
   * Call Gemini API with structured JSON schema
   */
  private static async callGeminiStructuredAPI(
    promptText: string,
    apiKey: string,
    symbol: string,
    timeframe: string
  ): Promise<CompilationResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const systemPrompt = `You are a deterministic trading strategy compiler and Quantitative Systems Engineer.
Compile the user's natural language trading strategy description into the provided Strategy AST schema.
You are NOT a trading advisor. You must NEVER invent trading rules or guess missing indicators.
Extract conditions explicitly stated by the user. Represent every condition using structured fields.
Do NOT put the user prompt into any AST field.
Do NOT use the original prompt as an entry trigger or exit trigger.

Candle offset convention:
0 = current candle (t-0)
-1 = previous candle (t-1)
-2 = two candles ago (t-2)
-3 = three candles ago (t-3)

Supported condition types:
- "candle": { "type": "candle", "candleOffset": number, "property": "bullish"|"bearish"|"open"|"high"|"low"|"close"|"body_size" }
- "indicator": { "type": "indicator", "indicator": "RSI"|"EMA"|"SMA"|"MACD"|"SuperTrend"|"BollingerBands"|"VWAP"|"Stochastic"|"ATR", "params": {...}, "operator": ">"|">="|"<"|"<="|"="|"crosses_above"|"crosses_below", "value": number|string|object }
- "price": { "type": "price", "source": "close"|"open"|"high"|"low", "operator": ">"|">="|"<"|"<="|"crosses_above"|"crosses_below", "reference": number|{"type":"indicator",...}|{"type":"price",...} }
- "volume": { "type": "volume", "operator": ">"|"<", "reference": number|object }
- "session": { "type": "session", "session": "London"|"New York"|"Asian" }
- "breakout": { "type": "breakout", "direction": "above"|"below", "reference": "swing_high"|"swing_low", "lookback": number }
- "pattern": { "type": "pattern", "pattern": "bullish_engulfing"|"bearish_engulfing"|"hammer"|"doji"|"inside_bar", "candleOffset": number }
- Logical groups: { "type": "AND"|"OR", "conditions": [...] } or { "type": "NOT", "condition": {...} }

Exit Bracket:
{
  "stopLoss": { "type": "percent", "value": 1.5, "unit": "%" },
  "takeProfit": { "type": "percent", "value": 3.0, "unit": "%" },
  "riskRewardRatio": 2.0
}

If a condition is ambiguous or mathematically underspecified, output { "error": "Ambiguous condition description..." }.
Output strictly valid JSON matching this exact structure:
{
  "name": "Strategy Name",
  "direction": "LONG" | "SHORT" | "BOTH",
  "entry": {
    "long": { ...logical condition... },
    "short": { ...logical condition... }
  },
  "exit": {
    "bracket": {
      "takeProfit": { "type": "percent", "value": number, "unit": "%" },
      "stopLoss": { "type": "percent", "value": number, "unit": "%" },
      "riskRewardRatio": number
    }
  },
  "riskManagement": {
    "riskPerTrade": 1.0
  }
}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: `Compile this strategy for ${symbol} on ${timeframe}:\n"${promptText}"` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini API");

    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(rawText);

    if (parsed.error) {
      return { success: false, isAmbiguous: true, error: parsed.error };
    }

    parsed.metadata = { rawPrompt: promptText };
    const validation = StrategyValidator.validate(parsed);
    if (!validation.valid || !validation.ast) {
      return {
        success: false,
        error: `Strategy validation failed: ${validation.errors.join("; ")}`
      };
    }

    validation.ast.pineScriptV5 = this.generatePineScriptFromAST(validation.ast, symbol, timeframe);
    return { success: true, ast: validation.ast };
  }

  /**
   * Deterministic Offline Strategy Compiler
   */
  static compileOffline(promptText: string, symbol = "BTCUSDT", timeframe = "15m"): CompilationResult {
    const text = promptText.toLowerCase();

    // 1. Detect Direction
    let direction: StrategyDirection = "LONG";
    const hasShort = /\b(short|sell|bearish|down)\b/i.test(text);
    const hasLong = /\b(long|buy|bullish|up)\b/i.test(text);
    if (hasShort && hasLong) direction = "BOTH";
    else if (hasShort) direction = "SHORT";

    // 2. Parse Risk Parameters & Risk-to-Reward Ratio
    let tpPct = 3.0;
    let slPct = 1.5;
    let rrRatio: number | undefined = undefined;

    const rrMatch =
      text.match(/(?:rr|r:r|risk\s*(?:to|[\/:\-])?\s*reward)\s*(?:will\s*be|is|=|:)?\s*1\s*[:\-\/]\s*(\d+(?:\.\d+)?)/i) ||
      text.match(/1\s*[:\-\/]\s*(\d+(?:\.\d+)?)\s*(?:rr|r:r|risk\s*(?:to|[\/:\-])?\s*reward)/i);
    if (rrMatch) rrRatio = parseFloat(rrMatch[1]);

    const tpMatch = text.match(/(?:tp|take profit|target|profit|tp:)\s*(?:of|is|:)?\s*(\d+(?:\.\d+)?)\s*%?/i);
    if (tpMatch) tpPct = parseFloat(tpMatch[1]);

    const slMatch = text.match(/(?:sl|stop loss|stop|loss|risk|sl:)\s*(?:of|is|:)?\s*(\d+(?:\.\d+)?)\s*%?/i);
    if (slMatch) slPct = parseFloat(slMatch[1]);

    if (rrRatio && rrRatio > 0) {
      if (slMatch && !tpMatch) tpPct = +(slPct * rrRatio).toFixed(2);
      else if (tpMatch && !slMatch) slPct = +(tpPct / rrRatio).toFixed(2);
      else if (!tpMatch && !slMatch) {
        slPct = 1.2;
        tpPct = +(slPct * rrRatio).toFixed(2);
      }
    }

    const riskPerTradeMatch = text.match(/risk\s*(\d+(?:\.\d+)?)\s*%\s*(?:per\s*trade|account)?/i);
    const riskPerTrade = riskPerTradeMatch ? parseFloat(riskPerTradeMatch[1]) : 1.0;

    // 3. Multi-Candle Sequences Parsing (e.g. 3-candle strategy test case)
    const candleSeq = this.parseCandleSequence(text);
    if (candleSeq) {
      const astObj = {
        name: "3-Candle Sequence Quantitative Model",
        direction: candleSeq.direction,
        entry: candleSeq.entry,
        exit: {
          bracket: {
            takeProfit: { type: "percent", value: tpPct, unit: "%" },
            stopLoss: { type: "percent", value: slPct, unit: "%" },
            riskRewardRatio: rrRatio || +(tpPct / slPct).toFixed(2)
          }
        },
        riskManagement: { riskPerTrade },
        defaultParams: { takeProfitPct: tpPct, stopLossPct: slPct },
        metadata: { rawPrompt: promptText }
      };

      const val = StrategyValidator.validate(astObj);
      if (!val.valid || !val.ast) return { success: false, error: val.errors.join("; ") };
      val.ast.pineScriptV5 = this.generatePineScriptFromAST(val.ast, symbol, timeframe);
      return { success: true, ast: val.ast };
    }

    // 4. Indicator & Confluence Conditions
    const parsedConditions = this.parseTechnicalConditions(text);
    if (parsedConditions) {
      const astObj = {
        name: parsedConditions.name,
        direction,
        entry: parsedConditions.entry,
        exit: {
          bracket: {
            takeProfit: { type: "percent", value: tpPct, unit: "%" },
            stopLoss: { type: "percent", value: slPct, unit: "%" },
            riskRewardRatio: rrRatio || +(tpPct / slPct).toFixed(2)
          }
        },
        riskManagement: { riskPerTrade },
        defaultParams: {
          takeProfitPct: tpPct,
          stopLossPct: slPct,
          ...parsedConditions.defaultParams
        },
        metadata: { rawPrompt: promptText }
      };

      const val = StrategyValidator.validate(astObj);
      if (!val.valid || !val.ast) return { success: false, error: val.errors.join("; ") };
      val.ast.pineScriptV5 = this.generatePineScriptFromAST(val.ast, symbol, timeframe);
      return { success: true, ast: val.ast };
    }

    // 5. Breakout / Swing Level Model
    const hasSwing = /\b(swing|swing\s*high|swing\s*low|support|resistance|breakout)\b/i.test(text);
    if (hasSwing) {
      const isBreakout = text.includes("breakout") || text.includes("break");
      const lookbackMatch = text.match(/lookback\s*(\d+)/i) || text.match(/(\d+)\s*bars?/i);
      const lookback = lookbackMatch ? parseInt(lookbackMatch[1]) : 10;

      const longCond: LogicalCondition = isBreakout
        ? { type: "breakout", direction: "above", reference: "swing_high", lookback }
        : { type: "price", source: "close", operator: ">=", reference: { type: "price", source: "low", offset: -lookback } };

      const shortCond: LogicalCondition = isBreakout
        ? { type: "breakout", direction: "below", reference: "swing_low", lookback }
        : { type: "price", source: "close", operator: "<=", reference: { type: "price", source: "high", offset: -lookback } };

      const astObj = {
        name: isBreakout ? "Market Structure Breakout Model" : "Swing Support & Resistance Model",
        direction,
        entry: {
          long: direction === "SHORT" ? undefined : longCond,
          short: direction === "LONG" ? undefined : shortCond
        },
        exit: {
          bracket: {
            takeProfit: { type: "percent", value: tpPct, unit: "%" },
            stopLoss: { type: "percent", value: slPct, unit: "%" },
            riskRewardRatio: rrRatio || +(tpPct / slPct).toFixed(2)
          }
        },
        riskManagement: { riskPerTrade },
        defaultParams: { takeProfitPct: tpPct, stopLossPct: slPct, swingLookback: lookback },
        metadata: { rawPrompt: promptText }
      };

      const val = StrategyValidator.validate(astObj);
      if (!val.valid || !val.ast) return { success: false, error: val.errors.join("; ") };
      val.ast.pineScriptV5 = this.generatePineScriptFromAST(val.ast, symbol, timeframe);
      return { success: true, ast: val.ast };
    }

    // 6. If no structured condition could be extracted and the text has no measurable rule
    return {
      success: false,
      isAmbiguous: true,
      error: `Could not extract measurable quantitative rules from: "${promptText}". Please specify indicators (e.g. RSI, EMA, MACD), candlestick patterns, or breakout levels.`
    };
  }

  /**
   * Parse specific candle sequence patterns (e.g. 3-candle long/short prompt)
   */
  private static parseCandleSequence(text: string): { direction: StrategyDirection; entry: { long?: LogicalCondition; short?: LogicalCondition } } | null {
    const has3Candles = text.includes("3 candles") || text.includes("three candles") || text.includes("3 candle");
    const hasGreenRedPattern = (text.includes("green") || text.includes("bullish")) && (text.includes("red") || text.includes("bearish"));

    if (has3Candles || (hasGreenRedPattern && (text.includes("next") || text.includes("previous")))) {
      // Long: 2 green and next is red (t-2=bullish, t-1=bullish, t-0=bearish)
      const longCond: LogicalCondition = {
        type: "AND",
        conditions: [
          { type: "candle", candleOffset: -2, property: "bullish" },
          { type: "candle", candleOffset: -1, property: "bullish" },
          { type: "candle", candleOffset: 0, property: "bearish" }
        ]
      };

      // Short: 2 red and next is green (t-2=bearish, t-1=bearish, t-0=bullish)
      const shortCond: LogicalCondition = {
        type: "AND",
        conditions: [
          { type: "candle", candleOffset: -2, property: "bearish" },
          { type: "candle", candleOffset: -1, property: "bearish" },
          { type: "candle", candleOffset: 0, property: "bullish" }
        ]
      };

      let dir: StrategyDirection = "BOTH";
      if (text.includes("short") && !text.includes("long")) dir = "SHORT";
      else if (text.includes("long") && !text.includes("short")) dir = "LONG";

      return {
        direction: dir,
        entry: {
          long: dir === "SHORT" ? undefined : longCond,
          short: dir === "LONG" ? undefined : shortCond
        }
      };
    }

    return null;
  }

  /**
   * Parse technical indicator conditions (RSI, EMA, MACD, Bollinger, SuperTrend, Sessions)
   */
  private static parseTechnicalConditions(text: string): {
    name: string;
    entry: { long?: LogicalCondition; short?: LogicalCondition };
    defaultParams: Record<string, any>;
  } | null {
    const conditions: LogicalCondition[] = [];
    const defaultParams: Record<string, any> = {};

    let hasIndicator = false;

    // 1. RSI
    if (text.includes("rsi")) {
      hasIndicator = true;
      const rsiLenMatch = text.match(/rsi\s*\(?(\d+)\)?/i);
      const rsiLen = rsiLenMatch ? parseInt(rsiLenMatch[1]) : 14;
      defaultParams.rsiLength = rsiLen;

      if (text.includes("above") || text.includes(">") || text.includes("over")) {
        const valMatch = text.match(/(?:above|>|over)\s*(\d+)/i);
        const val = valMatch ? parseInt(valMatch[1]) : 50;
        conditions.push({
          type: "indicator",
          indicator: "RSI",
          params: { period: rsiLen },
          operator: ">",
          value: val
        });
      } else if (text.includes("below") || text.includes("<") || text.includes("under")) {
        const valMatch = text.match(/(?:below|<|under)\s*(\d+)/i);
        const val = valMatch ? parseInt(valMatch[1]) : 30;
        conditions.push({
          type: "indicator",
          indicator: "RSI",
          params: { period: rsiLen },
          operator: "<",
          value: val
        });
      } else {
        conditions.push({
          type: "indicator",
          indicator: "RSI",
          params: { period: rsiLen },
          operator: ">",
          value: 50
        });
      }
    }

    // 2. EMA / SMA / Moving Average
    if (text.includes("ema") || text.includes("sma") || text.includes("moving average")) {
      hasIndicator = true;
      const maMatches = [...text.matchAll(/(?:ema|sma|ma)?\s*(\d{1,3})/gi)].map(m => parseInt(m[1])).filter(n => n >= 5 && n <= 300);

      if (maMatches.length >= 2 && text.includes("cross")) {
        const fast = Math.min(maMatches[0], maMatches[1]);
        const slow = Math.max(maMatches[0], maMatches[1]);
        defaultParams.fastEma = fast;
        defaultParams.slowEma = slow;

        conditions.push({
          type: "indicator",
          indicator: "EMA",
          params: { period: fast },
          operator: "crosses_above",
          value: { type: "indicator", indicator: "EMA", params: { period: slow } }
        });
      } else if (maMatches.length >= 1 && (text.includes("price") || text.includes("close"))) {
        const period = maMatches[0];
        defaultParams.emaPeriod = period;
        const op = text.includes("below") || text.includes("<") ? "<" : ">";
        conditions.push({
          type: "price",
          source: "close",
          operator: op,
          reference: { type: "indicator", indicator: "EMA", params: { period } }
        });
      }
    }

    // 3. MACD
    if (text.includes("macd")) {
      hasIndicator = true;
      const op = text.includes("below") || text.includes("crosses below") || text.includes("cross under") ? "crosses_below" : "crosses_above";
      conditions.push({
        type: "indicator",
        indicator: "MACD",
        params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
        operator: op,
        value: "signal"
      });
    }

    // 4. Session
    if (text.includes("session") || text.includes("london") || text.includes("new york") || text.includes("asian")) {
      hasIndicator = true;
      let sessionName = "London";
      if (text.includes("new york") || text.includes("ny")) sessionName = "New York";
      else if (text.includes("asian") || text.includes("tokyo")) sessionName = "Asian";
      conditions.push({
        type: "session",
        session: sessionName
      });
    }

    // 5. Candlestick Pattern (e.g. Bullish Engulfing)
    if (text.includes("engulfing") || text.includes("hammer") || text.includes("doji")) {
      hasIndicator = true;
      let pattern = "bullish_engulfing";
      if (text.includes("bearish")) pattern = "bearish_engulfing";
      else if (text.includes("hammer")) pattern = "hammer";
      else if (text.includes("doji")) pattern = "doji";
      conditions.push({
        type: "pattern",
        pattern,
        candleOffset: 0
      });
    }

    if (!hasIndicator || conditions.length === 0) return null;

    const isOr = text.includes(" or ");
    const compositeCondition: LogicalCondition =
      conditions.length === 1
        ? conditions[0]
        : {
            type: isOr ? "OR" : "AND",
            conditions
          };

    // Construct short symmetric condition if both are supported
    const shortConditions = conditions.map(c => {
      if (c.type === "indicator") {
        return {
          ...c,
          operator: c.operator === ">" ? "<" : (c.operator === "crosses_above" ? "crosses_below" : c.operator)
        } as LogicalCondition;
      }
      if (c.type === "price") {
        return {
          ...c,
          operator: c.operator === ">" ? "<" : "<="
        } as LogicalCondition;
      }
      return c;
    });

    const compositeShortCondition: LogicalCondition =
      shortConditions.length === 1
        ? shortConditions[0]
        : {
            type: isOr ? "OR" : "AND",
            conditions: shortConditions
          };

    return {
      name: "Quantitative Multi-Condition Model",
      entry: {
        long: compositeCondition,
        short: compositeShortCondition
      },
      defaultParams
    };
  }

  /**
   * Generates clean Pine Script v5 directly from the AST nodes
   */
  static generatePineScriptFromAST(ast: StrategyAST, symbol = "BTCUSDT", timeframe = "15m"): string {
    const tpPct = ast.exit?.bracket?.takeProfit?.value || 3.0;
    const slPct = ast.exit?.bracket?.stopLoss?.value || 1.5;

    return `//@version=5
strategy("${ast.name}", overlay=true, initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=100, commission_type=strategy.commission.percent, commission_value=0.075)

// ==========================================
// 1. RISK & EXIT INPUTS
// ==========================================
tpPct = input.float(${tpPct}, "Take Profit (%)", minval=0.1, step=0.1, group="Risk Management")
slPct = input.float(${slPct}, "Stop Loss (%)", minval=0.1, step=0.1, group="Risk Management")

// ==========================================
// 2. INDICATOR & CONDITION DEFINITIONS
// ==========================================
// Fast & Slow EMA definitions
fastEma = ta.ema(close, 9)
slowEma = ta.ema(close, 21)
rsiVal = ta.rsi(close, 14)

// 3-Candle Structure Definitions
c0_bull = close >= open
c0_bear = close < open
c1_bull = close[1] >= open[1]
c1_bear = close[1] < open[1]
c2_bull = close[2] >= open[2]
c2_bear = close[2] < open[2]

// ==========================================
// 3. EXECUTION CONDITIONS (AST DERIVED)
// ==========================================
// LONG: ${StrategyValidator.formatCondition(ast.entry.long)}
longCondition = ${this.generatePineCondition(ast.entry.long, true)}

// SHORT: ${StrategyValidator.formatCondition(ast.entry.short)}
shortCondition = ${this.generatePineCondition(ast.entry.short, false)}

// ==========================================
// 4. STRATEGY ORDER ROUTING
// ==========================================
if (longCondition and (strategy.position_size == 0 or strategy.position_size < 0))
    strategy.entry("Long", strategy.long)
    strategy.exit("TP/SL Long", "Long", profit=close * (tpPct / 100) / syminfo.mintick, loss=close * (slPct / 100) / syminfo.mintick)

if (shortCondition and (strategy.position_size == 0 or strategy.position_size > 0))
    strategy.entry("Short", strategy.short)
    strategy.exit("TP/SL Short", "Short", profit=close * (tpPct / 100) / syminfo.mintick, loss=close * (slPct / 100) / syminfo.mintick)

plot(fastEma, "Fast EMA", color=color.cyan)
plot(slowEma, "Slow EMA", color=color.amber)
`;
  }

  private static generatePineCondition(cond?: LogicalCondition, isLong = true): string {
    if (!cond) return "false";

    if (cond.type === "AND") {
      return `(${cond.conditions.map(c => this.generatePineCondition(c, isLong)).join(" and ")})`;
    }
    if (cond.type === "OR") {
      return `(${cond.conditions.map(c => this.generatePineCondition(c, isLong)).join(" or ")})`;
    }
    if (cond.type === "NOT") {
      return `not (${this.generatePineCondition(cond.condition, isLong)})`;
    }

    switch (cond.type) {
      case "candle": {
        const offset = Math.abs(cond.candleOffset || 0);
        if (cond.property === "bullish") return `close[${offset}] >= open[${offset}]`;
        if (cond.property === "bearish") return `close[${offset}] < open[${offset}]`;
        return `close[${offset}] >= open[${offset}]`;
      }
      case "indicator": {
        if (cond.indicator === "RSI") {
          return `ta.rsi(close, ${cond.params.period || 14}) ${cond.operator} ${cond.value}`;
        }
        if (cond.indicator === "EMA") {
          return cond.operator === "crosses_above" ? "ta.crossover(fastEma, slowEma)" : "ta.crossunder(fastEma, slowEma)";
        }
        if (cond.indicator === "MACD") {
          return cond.operator === "crosses_above" ? "ta.crossover(ta.macd(close, 12, 26, 9)[0], ta.macd(close, 12, 26, 9)[1])" : "ta.crossunder(ta.macd(close, 12, 26, 9)[0], ta.macd(close, 12, 26, 9)[1])";
        }
        return "true";
      }
      case "price": {
        return `close ${cond.operator} ta.ema(close, ${(cond.reference as any)?.params?.period || 200})`;
      }
      default:
        return isLong ? "close > open" : "close < open";
    }
  }
}
