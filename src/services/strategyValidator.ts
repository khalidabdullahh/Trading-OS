/**
 * Trading-OS Strategy AST Validator, Normalizer, and Summary Generator
 * Strict schema validation and AST-derived human-readable formatting
 */

import {
  StrategyAST,
  LogicalCondition,
  AtomicCondition,
  CandleCondition,
  IndicatorCondition,
  PriceCondition,
  VolumeCondition,
  SessionCondition,
  BreakoutCondition,
  PatternCondition,
  ComparisonOperator,
  CandleProperty,
  ExitBracket,
  RiskManagement,
  StrategyDirection
} from "../types/strategy";

export class StrategyValidator {
  /**
   * Validate raw strategy object from AI or parser
   */
  static validate(data: unknown): { valid: boolean; errors: string[]; ast?: StrategyAST } {
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Strategy data must be a non-null object"] };
    }

    const obj = data as Record<string, unknown>;

    // 1. Check Direction
    const direction = this.normalizeDirection(obj.direction as string);
    if (!direction) {
      errors.push(`Invalid or missing direction. Must be LONG, SHORT, or BOTH. Got: ${obj.direction}`);
    }

    // 2. Validate Entry Conditions
    let entryObj = obj.entry as { long?: unknown; short?: unknown } | undefined;
    if (!entryObj && (obj.entryLong || obj.entryShort)) {
      entryObj = {
        long: obj.entryLong,
        short: obj.entryShort
      };
    } else if (obj.entry && (obj.entry as any).type) {
      // If single condition given
      if (direction === "SHORT") {
        entryObj = { short: obj.entry };
      } else {
        entryObj = { long: obj.entry };
      }
    }

    if (!entryObj) {
      errors.push("Missing entry conditions in strategy AST.");
    }

    const validatedEntry: { long?: LogicalCondition; short?: LogicalCondition } = {};
    if (entryObj) {
      if (direction === "LONG" || direction === "BOTH") {
        if (entryObj.long) {
          const res = this.validateCondition(entryObj.long, "entry.long");
          if (!res.valid) errors.push(...res.errors);
          else validatedEntry.long = res.condition;
        } else if (direction === "LONG") {
          errors.push("Direction is LONG but entry.long condition is missing.");
        }
      }

      if (direction === "SHORT" || direction === "BOTH") {
        if (entryObj.short) {
          const res = this.validateCondition(entryObj.short, "entry.short");
          if (!res.valid) errors.push(...res.errors);
          else validatedEntry.short = res.condition;
        } else if (direction === "SHORT") {
          errors.push("Direction is SHORT but entry.short condition is missing.");
        }
      }
    }

    // 3. Validate Exit Brackets and Exits
    const exitBracket = this.normalizeExitBracket(obj.exit as any || obj.exitBracket as any);

    // 4. Validate Risk Management
    const riskManagement = this.normalizeRiskManagement(obj.riskManagement as any);

    // 5. Default Parameters
    const defaultParams: Record<string, number | string | boolean> = {
      takeProfitPct: exitBracket.takeProfit?.value || 3.0,
      stopLossPct: exitBracket.stopLoss?.value || 1.5,
      ...((obj.defaultParams as Record<string, any>) || {})
    };

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Derive summary purely from AST
    const entryTriggerSummary = this.formatEntrySummary(validatedEntry, direction!);
    const exitTriggerSummary = this.formatExitSummary(exitBracket);
    const overallSummary = `${entryTriggerSummary}. Risk parameters: ${exitTriggerSummary}.`;

    const ast: StrategyAST = {
      version: (obj.version as string) || "1.0",
      id: (obj.id as string) || `strat_${Date.now()}`,
      name: (obj.name as string) || "Deterministic Quantitative Strategy",
      category: (obj.category as string) || "Custom Strategy",
      badge: (obj.badge as string) || "Validated AST",
      direction: direction!,
      strategyType: (obj.strategyType as string) || "ast_dynamic",
      entry: validatedEntry,
      exit: {
        bracket: exitBracket
      },
      riskManagement,
      defaultParams,
      metadata: {
        rawPrompt: typeof obj.metadata === "object" && obj.metadata ? (obj.metadata as any).rawPrompt : undefined,
        summary: overallSummary,
        assumptions: Array.isArray((obj.metadata as any)?.assumptions)
          ? (obj.metadata as any).assumptions
          : ["Bar-by-bar chronological execution", "Sufficient liquidity"],
        weaknesses: Array.isArray((obj.metadata as any)?.weaknesses)
          ? (obj.metadata as any).weaknesses
          : ["Subject to volatility spikes", "Spread & commission impact"],
        compiledAt: new Date().toISOString()
      },
      structuredRules: {
        direction: direction!,
        entryTrigger: entryTriggerSummary,
        exitTrigger: exitTriggerSummary,
        assumptions: ["Bar-by-bar chronological execution", "Sufficient liquidity"],
        weaknesses: ["Subject to volatility spikes", "Spread & commission impact"]
      },
      pineScriptV5: obj.pineScriptV5 as string | undefined
    };

    return { valid: true, errors: [], ast };
  }

  /**
   * Validate recursive logical condition tree
   */
  static validateCondition(cond: unknown, path: string): { valid: boolean; errors: string[]; condition?: LogicalCondition } {
    if (!cond || typeof cond !== "object") {
      return { valid: false, errors: [`${path}: Condition must be a valid object`] };
    }

    const c = cond as Record<string, unknown>;
    const type = String(c.type || "").toUpperCase();

    if (type === "AND" || type === "OR") {
      if (!Array.isArray(c.conditions) || c.conditions.length === 0) {
        return { valid: false, errors: [`${path}: Logical ${type} must contain a non-empty array of conditions`] };
      }
      const validatedList: LogicalCondition[] = [];
      const errors: string[] = [];
      c.conditions.forEach((child, idx) => {
        const res = this.validateCondition(child, `${path}.${type}[${idx}]`);
        if (!res.valid) errors.push(...res.errors);
        else if (res.condition) validatedList.push(res.condition);
      });
      if (errors.length > 0) return { valid: false, errors };
      return { valid: true, errors: [], condition: { type: type as "AND" | "OR", conditions: validatedList } };
    }

    if (type === "NOT") {
      if (!c.condition) {
        return { valid: false, errors: [`${path}: Logical NOT must contain a condition object`] };
      }
      const res = this.validateCondition(c.condition, `${path}.NOT`);
      if (!res.valid) return res;
      return { valid: true, errors: [], condition: { type: "NOT", condition: res.condition! } };
    }

    // Atomic Condition Validation
    const lowerType = String(c.type || "").toLowerCase();
    switch (lowerType) {
      case "candle": {
        let offset = typeof c.candleOffset === "number" ? c.candleOffset : (typeof c.offset === "number" ? c.offset : 0);
        // Normalize positive offset to negative if needed (e.g. user prompt "2 candles ago" -> -2)
        if (offset > 0) offset = -offset;

        const rawProp = String(c.property || "").toLowerCase();
        let property: CandleProperty = "bullish";
        if (["bullish", "green", "up", "white"].includes(rawProp)) property = "bullish";
        else if (["bearish", "red", "down", "black"].includes(rawProp)) property = "bearish";
        else if (["open", "high", "low", "close", "body_size", "range"].includes(rawProp)) {
          property = rawProp as CandleProperty;
        }

        const condition: CandleCondition = {
          type: "candle",
          candleOffset: offset,
          property,
          comparison: c.comparison ? this.normalizeOperator(c.comparison as string) : undefined,
          value: c.value as any
        };
        return { valid: true, errors: [], condition };
      }

      case "indicator": {
        const indName = String(c.indicator || "").toUpperCase();
        if (!indName) return { valid: false, errors: [`${path}: Indicator condition requires an indicator name (e.g. RSI, EMA)`] };

        const operator = this.normalizeOperator(c.operator as string || ">");
        const condition: IndicatorCondition = {
          type: "indicator",
          indicator: indName,
          params: (c.params as Record<string, unknown>) || {},
          operator,
          value: (c.value as any) ?? 0,
          source: c.source as string | undefined
        };
        return { valid: true, errors: [], condition };
      }

      case "price": {
        const source = (String(c.source || "close").toLowerCase()) as "close" | "open" | "high" | "low";
        const operator = this.normalizeOperator(c.operator as string || ">");
        const condition: PriceCondition = {
          type: "price",
          source,
          operator,
          reference: (c.reference as any) ?? 0
        };
        return { valid: true, errors: [], condition };
      }

      case "volume": {
        const operator = this.normalizeOperator(c.operator as string || ">");
        const condition: VolumeCondition = {
          type: "volume",
          operator,
          reference: (c.reference as any) ?? 0
        };
        return { valid: true, errors: [], condition };
      }

      case "session": {
        const session = String(c.session || "").trim();
        if (!session) return { valid: false, errors: [`${path}: Session condition requires a session name (e.g. London)`] };
        const condition: SessionCondition = {
          type: "session",
          session,
          timezone: c.timezone as string | undefined
        };
        return { valid: true, errors: [], condition };
      }

      case "breakout": {
        const dir = String(c.direction || "above").toLowerCase() === "below" ? "below" : "above";
        const ref = String(c.reference || "swing_high");
        const condition: BreakoutCondition = {
          type: "breakout",
          direction: dir,
          reference: ref,
          lookback: typeof c.lookback === "number" ? c.lookback : 10
        };
        return { valid: true, errors: [], condition };
      }

      case "pattern": {
        const pat = String(c.pattern || "engulfing").toLowerCase();
        const condition: PatternCondition = {
          type: "pattern",
          pattern: pat,
          candleOffset: typeof c.candleOffset === "number" ? c.candleOffset : 0
        };
        return { valid: true, errors: [], condition };
      }

      default:
        return { valid: false, errors: [`${path}: Unknown condition type '${c.type}'`] };
    }
  }

  static normalizeDirection(dir?: string): StrategyDirection | null {
    if (!dir) return null;
    const clean = dir.trim().toUpperCase();
    if (clean === "LONG" || clean === "BUY") return "LONG";
    if (clean === "SHORT" || clean === "SELL") return "SHORT";
    if (clean === "BOTH" || clean === "LONG_SHORT" || clean === "ALL") return "BOTH";
    return null;
  }

  static normalizeOperator(op?: string): ComparisonOperator {
    if (!op) return ">";
    const clean = op.trim().toLowerCase();
    if (clean === "crosses_above" || clean === "crosses above" || clean === "cross above" || clean === "crossesover") return "crosses_above";
    if (clean === "crosses_below" || clean === "crosses below" || clean === "cross below" || clean === "crossesunder") return "crosses_below";
    if (clean === ">=" || clean === "gte" || clean === "at least") return ">=";
    if (clean === "<=" || clean === "lte" || clean === "at most") return "<=";
    if (clean === ">" || clean === "gt" || clean === "above" || clean === "higher than") return ">";
    if (clean === "<" || clean === "lt" || clean === "below" || clean === "lower than") return "<";
    if (clean === "=" || clean === "==" || clean === "equals" || clean === "is") return "=";
    if (clean === "!=" || clean === "!==" || clean === "not equal") return "!=";
    return ">";
  }

  static normalizeExitBracket(exitData?: any): ExitBracket {
    const bracket: ExitBracket = {};
    if (!exitData || typeof exitData !== "object") {
      return {
        stopLoss: { type: "percent", value: 1.5, unit: "%" },
        takeProfit: { type: "percent", value: 3.0, unit: "%" },
        riskRewardRatio: 2.0
      };
    }

    const b = exitData.bracket || exitData;

    // Take profit
    if (b.takeProfit) {
      bracket.takeProfit = {
        type: b.takeProfit.type || "percent",
        value: typeof b.takeProfit.value === "number" ? b.takeProfit.value : (parseFloat(b.takeProfit) || 3.0),
        unit: b.takeProfit.unit || "%"
      };
    } else if (typeof b.takeProfitPct === "number") {
      bracket.takeProfit = { type: "percent", value: b.takeProfitPct, unit: "%" };
    } else {
      bracket.takeProfit = { type: "percent", value: 3.0, unit: "%" };
    }

    // Stop loss
    if (b.stopLoss) {
      bracket.stopLoss = {
        type: b.stopLoss.type || "percent",
        value: typeof b.stopLoss.value === "number" ? b.stopLoss.value : (parseFloat(b.stopLoss) || 1.5),
        unit: b.stopLoss.unit || "%"
      };
    } else if (typeof b.stopLossPct === "number") {
      bracket.stopLoss = { type: "percent", value: b.stopLossPct, unit: "%" };
    } else {
      bracket.stopLoss = { type: "percent", value: 1.5, unit: "%" };
    }

    // Risk Reward
    if (typeof b.riskRewardRatio === "number" && b.riskRewardRatio > 0) {
      bracket.riskRewardRatio = b.riskRewardRatio;
    } else if (bracket.takeProfit && bracket.stopLoss && bracket.stopLoss.value > 0) {
      bracket.riskRewardRatio = +(bracket.takeProfit.value / bracket.stopLoss.value).toFixed(2);
    }

    // Trailing stop
    if (b.trailingStop) {
      bracket.trailingStop = {
        type: b.trailingStop.type || "percent",
        value: typeof b.trailingStop.value === "number" ? b.trailingStop.value : (parseFloat(b.trailingStop) || 1.0),
        unit: b.trailingStop.unit || "%"
      };
    }

    // Break even
    if (b.breakEven) {
      bracket.breakEven = {
        enabled: Boolean(b.breakEven.enabled),
        triggerPct: typeof b.breakEven.triggerPct === "number" ? b.breakEven.triggerPct : 1.5
      };
    }

    return bracket;
  }

  static normalizeRiskManagement(riskData?: any): RiskManagement {
    if (!riskData || typeof riskData !== "object") {
      return { riskPerTrade: 1.0, maxDailyLoss: 3.0, maxPositions: 1 };
    }
    return {
      riskPerTrade: typeof riskData.riskPerTrade === "number" ? riskData.riskPerTrade : 1.0,
      maxDailyLoss: typeof riskData.maxDailyLoss === "number" ? riskData.maxDailyLoss : 3.0,
      maxPositions: typeof riskData.maxPositions === "number" ? riskData.maxPositions : 1
    };
  }

  /**
   * Format condition to human-readable AST summary (Derived, never raw prompt)
   */
  static formatCondition(cond?: LogicalCondition): string {
    if (!cond) return "None";

    if (cond.type === "AND") {
      return cond.conditions.map(c => this.formatCondition(c)).join(" AND ");
    }
    if (cond.type === "OR") {
      return `(${cond.conditions.map(c => this.formatCondition(c)).join(" OR ")})`;
    }
    if (cond.type === "NOT") {
      return `NOT (${this.formatCondition(cond.condition)})`;
    }

    switch (cond.type) {
      case "candle": {
        const offsetLabel = cond.candleOffset === 0 ? "Current bar [t-0]" : (cond.candleOffset === -1 ? "Previous bar [t-1]" : `Bar [t${cond.candleOffset}]`);
        return `${offsetLabel} is ${cond.property || "bullish"}`;
      }
      case "indicator": {
        const paramStr = Object.entries(cond.params || {}).map(([k, v]) => `${k}:${v}`).join(",");
        const valStr = typeof cond.value === "object" ? JSON.stringify(cond.value) : String(cond.value);
        return `${cond.indicator}${paramStr ? `(${paramStr})` : ""} ${cond.operator} ${valStr}`;
      }
      case "price": {
        const refStr = typeof cond.reference === "object" ? JSON.stringify(cond.reference) : String(cond.reference);
        return `Price(${cond.source}) ${cond.operator} ${refStr}`;
      }
      case "volume": {
        const refStr = typeof cond.reference === "object" ? JSON.stringify(cond.reference) : String(cond.reference);
        return `Volume ${cond.operator} ${refStr}`;
      }
      case "session":
        return `During ${cond.session} Session`;
      case "breakout":
        return `Breakout ${cond.direction} ${cond.reference}${cond.lookback ? ` (${cond.lookback} bars)` : ""}`;
      case "pattern":
        return `Pattern: ${cond.pattern} on bar [t${cond.candleOffset || 0}]`;
      default:
        return "Custom Condition";
    }
  }

  static formatEntrySummary(entry: { long?: LogicalCondition; short?: LogicalCondition }, direction: StrategyDirection): string {
    const parts: string[] = [];
    if ((direction === "LONG" || direction === "BOTH") && entry.long) {
      parts.push(`LONG: [${this.formatCondition(entry.long)}]`);
    }
    if ((direction === "SHORT" || direction === "BOTH") && entry.short) {
      parts.push(`SHORT: [${this.formatCondition(entry.short)}]`);
    }
    return parts.length > 0 ? parts.join(" | ") : "Deterministic Signal Trigger";
  }

  static formatExitSummary(bracket?: ExitBracket): string {
    if (!bracket) return "Fixed 3.0% TP / 1.5% SL";
    const tp = bracket.takeProfit ? `Take Profit: ${bracket.takeProfit.value}${bracket.takeProfit.unit}` : "";
    const sl = bracket.stopLoss ? `Stop Loss: ${bracket.stopLoss.value}${bracket.stopLoss.unit}` : "";
    const rr = bracket.riskRewardRatio ? ` (1:${bracket.riskRewardRatio} R:R)` : "";
    return [tp, sl].filter(Boolean).join(", ") + rr;
  }
}
