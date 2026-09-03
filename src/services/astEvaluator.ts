/**
 * Trading-OS Generic AST Evaluator
 * Deterministic bar-by-bar condition evaluation on historical candle series
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
  ComparisonOperator
} from "../types/strategy";
import Indicators from "../../js/indicators.js";

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Signal {
  index: number;
  time: number;
  type: "BUY" | "SELL";
  price: number;
  reason: string;
}

export class ASTEvaluator {
  private candles: Candle[];
  private closes: number[];
  private indicatorCache = new Map<string, any>();

  constructor(candles: Candle[]) {
    this.candles = candles;
    this.closes = candles.map(c => c.close);
  }

  /**
   * Evaluate full strategy AST across all candles
   */
  evaluateStrategy(ast: StrategyAST, activeDirection: "LONG" | "SHORT" | "BOTH" = "BOTH"): Signal[] {
    const signals: Signal[] = [];
    const minLookback = 1;
    const isLongAllowed = activeDirection === "LONG" || activeDirection === "BOTH";
    const isShortAllowed = activeDirection === "SHORT" || activeDirection === "BOTH";

    for (let i = minLookback; i < this.candles.length; i++) {
      const candle = this.candles[i];

      // 1. Check LONG Entry
      if (isLongAllowed && ast.entry.long) {
        const isLongTriggered = this.evaluateCondition(ast.entry.long, i);
        if (isLongTriggered) {
          signals.push({
            index: i,
            time: candle.time,
            type: "BUY",
            price: candle.close,
            reason: `LONG Entry: ${ast.structuredRules?.entryTrigger || "AST Condition Met"}`
          });
          continue; // Avoid both long & short on same candle
        }
      }

      // 2. Check SHORT Entry
      if (isShortAllowed && ast.entry.short) {
        const isShortTriggered = this.evaluateCondition(ast.entry.short, i);
        if (isShortTriggered) {
          signals.push({
            index: i,
            time: candle.time,
            type: "SELL",
            price: candle.close,
            reason: `SHORT Entry: ${ast.structuredRules?.entryTrigger || "AST Condition Met"}`
          });
        }
      }
    }

    return signals;
  }

  /**
   * Evaluate recursive logical condition at bar index i
   */
  evaluateCondition(cond: LogicalCondition, i: number): boolean {
    if (!cond) return false;

    if (cond.type === "AND") {
      return cond.conditions.every(c => this.evaluateCondition(c, i));
    }
    if (cond.type === "OR") {
      return cond.conditions.some(c => this.evaluateCondition(c, i));
    }
    if (cond.type === "NOT") {
      return !this.evaluateCondition(cond.condition, i);
    }

    // Atomic Condition
    return this.evaluateAtomic(cond, i);
  }

  /**
   * Evaluate atomic condition
   */
  private evaluateAtomic(cond: AtomicCondition, i: number): boolean {
    switch (cond.type) {
      case "candle":
        return this.evaluateCandle(cond, i);
      case "indicator":
        return this.evaluateIndicator(cond, i);
      case "price":
        return this.evaluatePrice(cond, i);
      case "volume":
        return this.evaluateVolume(cond, i);
      case "session":
        return this.evaluateSession(cond, i);
      case "breakout":
        return this.evaluateBreakout(cond, i);
      case "pattern":
        return this.evaluatePattern(cond, i);
      default:
        return false;
    }
  }

  private evaluateCandle(cond: CandleCondition, i: number): boolean {
    const targetIdx = i + (cond.candleOffset || 0);
    if (targetIdx < 0 || targetIdx >= this.candles.length) return false;

    const c = this.candles[targetIdx];
    const isBull = c.close >= c.open;
    const isBear = c.close < c.open;

    if (cond.property === "bullish") return isBull;
    if (cond.property === "bearish") return isBear;

    if (cond.property === "body_size" && cond.comparison && typeof cond.value === "number") {
      const body = Math.abs(c.close - c.open);
      return this.compare(body, cond.comparison, cond.value);
    }

    if (cond.property === "range" && cond.comparison && typeof cond.value === "number") {
      const range = c.high - c.low;
      return this.compare(range, cond.comparison, cond.value);
    }

    if (["open", "high", "low", "close"].includes(cond.property || "") && cond.comparison && typeof cond.value === "number") {
      const val = (c as any)[cond.property!];
      return this.compare(val, cond.comparison, cond.value);
    }

    return isBull; // default
  }

  private evaluateIndicator(cond: IndicatorCondition, i: number): boolean {
    const indName = cond.indicator.toUpperCase();
    const curr = this.getIndicatorValue(indName, cond.params, i);
    const prev = this.getIndicatorValue(indName, cond.params, i - 1);

    if (curr === null || curr === undefined) return false;

    // Value can be a numeric threshold or reference indicator
    let targetVal = cond.value;
    let prevTargetVal = targetVal;

    if (typeof cond.value === "object" && cond.value !== null && (cond.value as any).type === "indicator") {
      const refInd = cond.value as unknown as IndicatorCondition;
      targetVal = this.getIndicatorValue(refInd.indicator.toUpperCase(), refInd.params, i);
      prevTargetVal = this.getIndicatorValue(refInd.indicator.toUpperCase(), refInd.params, i - 1);
    } else if (typeof cond.value === "string") {
      if (cond.value.toLowerCase() === "signal" && indName === "MACD") {
        const macdObj = this.getIndicatorData("MACD", cond.params);
        targetVal = macdObj.signal[i];
        prevTargetVal = macdObj.signal[i - 1];
      } else {
        targetVal = parseFloat(cond.value) || 0;
      }
    }

    if (typeof targetVal !== "number" || isNaN(targetVal)) return false;

    if (cond.operator === "crosses_above") {
      if (prev === null || prevTargetVal === null || typeof prevTargetVal !== "number") return false;
      return prev <= prevTargetVal && curr > targetVal;
    }

    if (cond.operator === "crosses_below") {
      if (prev === null || prevTargetVal === null || typeof prevTargetVal !== "number") return false;
      return prev >= prevTargetVal && curr < targetVal;
    }

    return this.compare(curr, cond.operator, targetVal);
  }

  private evaluatePrice(cond: PriceCondition, i: number): boolean {
    const c = this.candles[i];
    const prev = this.candles[i - 1];
    const sourceVal = c[cond.source || "close"];
    const prevSourceVal = prev ? prev[cond.source || "close"] : sourceVal;

    let targetVal: number | null = null;
    let prevTargetVal: number | null = null;

    if (typeof cond.reference === "number") {
      targetVal = cond.reference;
      prevTargetVal = cond.reference;
    } else if (typeof cond.reference === "object" && cond.reference !== null) {
      const ref = cond.reference as any;
      if (ref.type === "indicator") {
        targetVal = this.getIndicatorValue(ref.indicator.toUpperCase(), ref.params, i);
        prevTargetVal = this.getIndicatorValue(ref.indicator.toUpperCase(), ref.params, i - 1);
      } else if (ref.type === "price") {
        const offset = ref.offset || -1;
        const targetBar = this.candles[i + offset];
        targetVal = targetBar ? targetBar[ref.source as keyof Candle] : null;
      }
    }

    if (targetVal === null || isNaN(targetVal)) return false;

    if (cond.operator === "crosses_above") {
      if (prevTargetVal === null) return false;
      return prevSourceVal <= prevTargetVal && sourceVal > targetVal;
    }
    if (cond.operator === "crosses_below") {
      if (prevTargetVal === null) return false;
      return prevSourceVal >= prevTargetVal && sourceVal < targetVal;
    }

    return this.compare(sourceVal, cond.operator, targetVal);
  }

  private evaluateVolume(cond: VolumeCondition, i: number): boolean {
    const c = this.candles[i];
    const vol = c.volume || 0;
    let target = 0;

    if (typeof cond.reference === "number") {
      target = cond.reference;
    } else if (typeof cond.reference === "object" && cond.reference !== null) {
      // Volume SMA
      const period = (cond.reference as any).params?.period || 20;
      const vols = this.candles.map(cand => cand.volume || 0);
      const sma = Indicators.sma(vols, period);
      target = sma[i] || 0;
    }

    return this.compare(vol, cond.operator, target);
  }

  private evaluateSession(cond: SessionCondition, i: number): boolean {
    const date = new Date(this.candles[i].time * 1000);
    const utcHours = date.getUTCHours();
    const session = cond.session.toLowerCase();

    // Standard UTC session hours
    if (session.includes("london")) return utcHours >= 8 && utcHours < 16;
    if (session.includes("new york") || session.includes("ny")) return utcHours >= 13 && utcHours < 21;
    if (session.includes("asian") || session.includes("tokyo")) return utcHours >= 0 && utcHours < 9;

    return true;
  }

  private evaluateBreakout(cond: BreakoutCondition, i: number): boolean {
    const lookback = cond.lookback || 10;
    if (i < lookback + 1) return false;

    let swingHigh = -Infinity;
    let swingLow = Infinity;
    for (let j = i - lookback; j < i; j++) {
      if (this.candles[j].high > swingHigh) swingHigh = this.candles[j].high;
      if (this.candles[j].low < swingLow) swingLow = this.candles[j].low;
    }

    const curr = this.candles[i];
    const prev = this.candles[i - 1];

    if (cond.direction === "above") {
      // Break above swing high
      return prev.close <= swingHigh && curr.close > swingHigh;
    } else {
      // Breakdown below swing low
      return prev.close >= swingLow && curr.close < swingLow;
    }
  }

  private evaluatePattern(cond: PatternCondition, i: number): boolean {
    const targetIdx = i + (cond.candleOffset || 0);
    if (targetIdx < 1) return false;

    const curr = this.candles[targetIdx];
    const prev = this.candles[targetIdx - 1];
    const pattern = cond.pattern.toLowerCase();

    if (pattern.includes("bullish_engulfing") || pattern.includes("engulfing") && pattern.includes("bull")) {
      return prev.close < prev.open && curr.close > curr.open && curr.close >= prev.open && curr.open <= prev.close;
    }
    if (pattern.includes("bearish_engulfing") || pattern.includes("engulfing") && pattern.includes("bear")) {
      return prev.close > prev.open && curr.close < curr.open && curr.open >= prev.close && curr.close <= prev.open;
    }
    if (pattern.includes("hammer")) {
      const body = Math.abs(curr.close - curr.open);
      const lowerWick = Math.min(curr.open, curr.close) - curr.low;
      const upperWick = curr.high - Math.max(curr.open, curr.close);
      return lowerWick >= 2 * body && upperWick <= body * 0.5;
    }
    if (pattern.includes("inside_bar")) {
      return curr.high <= prev.high && curr.low >= prev.low;
    }
    if (pattern.includes("doji")) {
      const body = Math.abs(curr.close - curr.open);
      const range = curr.high - curr.low;
      return range > 0 && body / range < 0.1;
    }

    return false;
  }

  private getIndicatorValue(indicator: string, params: Record<string, unknown>, i: number): number | null {
    const data = this.getIndicatorData(indicator, params);
    if (!data) return null;

    if (Array.isArray(data)) {
      return data[i] ?? null;
    }
    if (indicator === "MACD" && data.macd) {
      return data.macd[i] ?? null;
    }
    if (indicator === "SUPERTREND" && data.direction) {
      return data.direction[i] ?? null;
    }
    if (indicator === "BOLLINGER" || indicator === "BOLLINGERBANDS") {
      return data.middle[i] ?? null;
    }
    if (indicator === "STOCHASTIC" && data.k) {
      return data.k[i] ?? null;
    }

    return null;
  }

  private getIndicatorData(indicator: string, params: Record<string, unknown>): any {
    const key = `${indicator}_${JSON.stringify(params)}`;
    if (this.indicatorCache.has(key)) {
      return this.indicatorCache.get(key);
    }

    let data: any = null;
    const p = params || {};

    switch (indicator) {
      case "EMA": {
        const period = (p.period as number) || (p.fastEma as number) || (p.length as number) || 14;
        data = Indicators.ema(this.closes, period);
        break;
      }
      case "SMA": {
        const period = (p.period as number) || (p.length as number) || 20;
        data = Indicators.sma(this.closes, period);
        break;
      }
      case "RSI": {
        const period = (p.period as number) || (p.length as number) || 14;
        data = Indicators.rsi(this.closes, period);
        break;
      }
      case "MACD": {
        const fast = (p.fastPeriod as number) || 12;
        const slow = (p.slowPeriod as number) || 26;
        const signal = (p.signalPeriod as number) || 9;
        data = Indicators.macd(this.closes, fast, slow, signal);
        break;
      }
      case "BOLLINGER":
      case "BOLLINGERBANDS": {
        const period = (p.period as number) || 20;
        const mult = (p.multiplier as number) || 2.0;
        data = Indicators.bollingerBands(this.closes, period, mult);
        break;
      }
      case "SUPERTREND": {
        const period = (p.period as number) || 10;
        const mult = (p.multiplier as number) || 3.0;
        data = Indicators.superTrend(this.candles, period, mult);
        break;
      }
      case "VWAP": {
        data = Indicators.vwap(this.candles);
        break;
      }
      case "STOCHASTIC": {
        const k = (p.kPeriod as number) || 14;
        const d = (p.dPeriod as number) || 3;
        const smooth = (p.smooth as number) || 3;
        data = Indicators.stochastic(this.candles, k, d, smooth);
        break;
      }
      case "ATR": {
        const period = (p.period as number) || 14;
        data = Indicators.atr(this.candles, period);
        break;
      }
      default:
        data = null;
    }

    this.indicatorCache.set(key, data);
    return data;
  }

  private compare(a: number, op: ComparisonOperator, b: number): boolean {
    switch (op) {
      case ">":
        return a > b;
      case ">=":
        return a >= b;
      case "<":
        return a < b;
      case "<=":
        return a <= b;
      case "=":
        return Math.abs(a - b) < 0.0001;
      case "!=":
        return Math.abs(a - b) >= 0.0001;
      default:
        return a > b;
    }
  }
}
