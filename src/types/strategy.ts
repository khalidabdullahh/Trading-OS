/**
 * Trading-OS Strategy AST & Quantitative Domain Types
 * Canonical AST representation for all compiled trading strategies
 */

export type StrategyDirection = "LONG" | "SHORT" | "BOTH";

export type ComparisonOperator =
  | ">"
  | ">="
  | "<"
  | "<="
  | "="
  | "!="
  | "crosses_above"
  | "crosses_below";

export type CandleProperty =
  | "bullish"
  | "bearish"
  | "open"
  | "high"
  | "low"
  | "close"
  | "body_size"
  | "range";

export interface CandleCondition {
  type: "candle";
  candleOffset: number; // 0 = current bar, -1 = previous bar, -2 = two bars ago...
  property?: CandleProperty;
  comparison?: ComparisonOperator;
  value?: number | string | boolean;
}

export interface IndicatorCondition {
  type: "indicator";
  indicator: string; // e.g. "RSI", "EMA", "SMA", "MACD", "SuperTrend", "BollingerBands", "VWAP", "Stochastic", "ADX", "ATR"
  params: Record<string, unknown>;
  operator: ComparisonOperator;
  value: number | string | Record<string, unknown>;
  source?: string;
}

export interface PriceCondition {
  type: "price";
  source: "close" | "open" | "high" | "low";
  operator: ComparisonOperator;
  reference:
    | number
    | string
    | {
        type: "indicator";
        indicator: string;
        params: Record<string, unknown>;
      }
    | {
        type: "price";
        source: string;
        offset?: number;
      };
}

export interface VolumeCondition {
  type: "volume";
  operator: ComparisonOperator;
  reference:
    | number
    | string
    | {
        type: "indicator";
        indicator: string;
        params: Record<string, unknown>;
      };
}

export interface SessionCondition {
  type: "session";
  session: string; // e.g. "London", "New York", "Asian", "Tokyo"
  timezone?: string;
}

export interface BreakoutCondition {
  type: "breakout";
  direction: "above" | "below";
  reference: "swing_high" | "swing_low" | "previous_day_high" | "previous_day_low" | string;
  lookback?: number;
}

export interface PatternCondition {
  type: "pattern";
  pattern:
    | "engulfing"
    | "bullish_engulfing"
    | "bearish_engulfing"
    | "inside_bar"
    | "doji"
    | "hammer"
    | "shooting_star"
    | string;
  candleOffset?: number;
}

export type AtomicCondition =
  | CandleCondition
  | IndicatorCondition
  | PriceCondition
  | VolumeCondition
  | SessionCondition
  | BreakoutCondition
  | PatternCondition;

export type LogicalCondition =
  | AtomicCondition
  | {
      type: "AND";
      conditions: LogicalCondition[];
    }
  | {
      type: "OR";
      conditions: LogicalCondition[];
    }
  | {
      type: "NOT";
      condition: LogicalCondition;
    };

export interface ExitBracket {
  stopLoss?: {
    type: "percent" | "points" | "atr";
    value: number;
    unit: "%" | "pts" | "atr";
  };
  takeProfit?: {
    type: "percent" | "points" | "atr";
    value: number;
    unit: "%" | "pts" | "atr";
  };
  riskRewardRatio?: number;
  trailingStop?: {
    type: "percent" | "points" | "atr";
    value: number;
    unit: "%" | "pts" | "atr";
  };
  breakEven?: {
    enabled: boolean;
    triggerPct: number;
  };
}

export interface RiskManagement {
  riskPerTrade?: number; // % of account equity
  maxDailyLoss?: number;
  maxPositions?: number;
}

export interface StrategyMetadata {
  rawPrompt?: string;
  summary?: string;
  assumptions?: string[];
  weaknesses?: string[];
  compiledAt?: string;
  author?: string;
}

export interface StrategyAST {
  version: string;
  id: string;
  name: string;
  category?: string;
  badge?: string;
  direction: StrategyDirection;
  strategyType?: string;

  entry: {
    long?: LogicalCondition;
    short?: LogicalCondition;
  };

  exit?: {
    conditions?: {
      long?: LogicalCondition;
      short?: LogicalCondition;
    };
    bracket?: ExitBracket;
  };

  riskManagement?: RiskManagement;
  defaultParams: Record<string, number | string | boolean>;
  metadata: StrategyMetadata;
  pineScriptV5?: string;

  // Structured rules summary for backward compatibility and quick views
  structuredRules?: {
    direction: StrategyDirection;
    entryTrigger: string;
    exitTrigger: string;
    assumptions?: string[];
    weaknesses?: string[];
  };
}

export type CompilationResult =
  | {
      success: true;
      ast: StrategyAST;
    }
  | {
      success: false;
      error: string;
      isAmbiguous?: boolean;
      details?: string;
    };
