import React from "react";
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
  StrategyDirection
} from "@/src/types/strategy";
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  Activity,
  ShieldCheck,
  Target,
  AlertTriangle,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2
} from "lucide-react";

interface StructuredRuleInspectorProps {
  ast?: StrategyAST | null;
  direction?: StrategyDirection;
  error?: string | null;
  isAmbiguous?: boolean;
}

export const StructuredRuleInspector: React.FC<StructuredRuleInspectorProps> = ({
  ast,
  direction = "LONG",
  error,
  isAmbiguous
}) => {
  if (error) {
    return (
      <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20 text-xs space-y-2">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{isAmbiguous ? "Ambiguous Strategy Rule" : "Compilation Error"}</span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          {error}
        </p>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          💡 <strong>Tip:</strong> Specify measurable criteria such as indicators (RSI, EMA, MACD), candlestick sequences (e.g. 2 green candles then 1 red), or breakout levels.
        </div>
      </div>
    );
  }

  if (!ast) {
    return (
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] text-xs text-center text-slate-400 space-y-1.5">
        <Layers className="h-5 w-5 mx-auto text-slate-400 dark:text-slate-600 mb-1" />
        <p className="font-semibold text-slate-600 dark:text-slate-300">Awaiting Valid Strategy Rules</p>
        <p className="text-[11px] text-slate-400">
          Enter your natural-language trading rules above to compile a deterministic AST.
        </p>
      </div>
    );
  }

  const activeDirection = direction || ast.direction || "LONG";
  const showLong = (activeDirection === "LONG" || activeDirection === "BOTH") && !!ast.entry?.long;
  const showShort = (activeDirection === "SHORT" || activeDirection === "BOTH") && !!ast.entry?.short;

  const bracket = ast.exit?.bracket;
  const risk = ast.riskManagement;

  return (
    <div className="space-y-3">
      {/* Header Info Banner */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
            <span className="font-bold text-slate-900 dark:text-slate-100">{ast.name}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            AST v{ast.version || "1.0"}
          </span>
        </div>

        {/* Direction Indicator */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Execution Direction:</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
              activeDirection === "SHORT"
                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                : activeDirection === "BOTH"
                ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            }`}
          >
            {activeDirection === "SHORT" && <ArrowDownRight className="h-3 w-3" />}
            {activeDirection === "LONG" && <ArrowUpRight className="h-3 w-3" />}
            {activeDirection === "BOTH" && <RefreshCw className="h-3 w-3" />}
            <span>{activeDirection}</span>
          </span>
        </div>

        {/* Entry Conditions Tree */}
        <div className="space-y-2">
          {showLong && (
            <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>LONG ENTRY CONDITIONS</span>
              </div>
              <ConditionTree condition={ast.entry.long!} />
            </div>
          )}

          {showShort && (
            <div className="p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                <ArrowDownRight className="h-3.5 w-3.5" />
                <span>SHORT ENTRY CONDITIONS</span>
              </div>
              <ConditionTree condition={ast.entry.short!} />
            </div>
          )}
        </div>

        {/* Exit & Risk Bracket */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Exit Bracket & Risk Model
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[11px]">
            <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Take Profit</span>
              <span className="text-emerald-500 font-bold">
                {bracket?.takeProfit ? `+${bracket.takeProfit.value}${bracket.takeProfit.unit}` : "3.0%"}
              </span>
            </div>
            <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Stop Loss</span>
              <span className="text-rose-500 font-bold">
                {bracket?.stopLoss ? `-${bracket.stopLoss.value}${bracket.stopLoss.unit}` : "1.5%"}
              </span>
            </div>
            <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">R:R Ratio</span>
              <span className="text-cyan-500 font-bold">
                1:{bracket?.riskRewardRatio || "2.0"}
              </span>
            </div>
            <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Risk / Trade</span>
              <span className="text-purple-400 font-bold">
                {risk?.riskPerTrade || 1.0}%
              </span>
            </div>
          </div>
        </div>

        {/* AST-Derived Summary */}
        {ast.metadata?.summary && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
            <span className="font-bold text-slate-700 dark:text-slate-300">Audited Rule Summary: </span>
            {ast.metadata.summary}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Recursive Logical Condition Tree Renderer
 */
const ConditionTree: React.FC<{ condition: LogicalCondition }> = ({ condition }) => {
  if (condition.type === "AND" || condition.type === "OR") {
    const isAnd = condition.type === "AND";
    return (
      <div className="space-y-1.5 pl-2 border-l-2 border-cyan-500/40">
        {condition.conditions.map((child, idx) => (
          <React.Fragment key={idx}>
            <ConditionTree condition={child} />
            {idx < condition.conditions.length - 1 && (
              <div className="py-0.5 flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20">
                  {isAnd ? "AND" : "OR"}
                </span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (condition.type === "NOT") {
    return (
      <div className="pl-2 border-l-2 border-rose-500/40 space-y-1">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          NOT
        </span>
        <ConditionTree condition={condition.condition} />
      </div>
    );
  }

  return <AtomicConditionBadge condition={condition} />;
};

/**
 * Atomic Condition Badge Component
 */
const AtomicConditionBadge: React.FC<{ condition: AtomicCondition }> = ({ condition }) => {
  switch (condition.type) {
    case "candle": {
      const isBull = condition.property === "bullish";
      const isBear = condition.property === "bearish";
      const offsetLabel =
        condition.candleOffset === 0
          ? "Candle t-0 (Current)"
          : condition.candleOffset === -1
          ? "Candle t-1 (Previous)"
          : `Candle t${condition.candleOffset}`;

      return (
        <div
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-[11px] font-mono ${
            isBull
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : isBear
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-1.5">
            {isBull && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />}
            {isBear && <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />}
            <span className="font-bold text-slate-800 dark:text-slate-200">{offsetLabel}:</span>
          </div>
          <span className="font-bold uppercase">{condition.property || "Bullish"}</span>
        </div>
      );
    }

    case "indicator": {
      const paramStr = Object.entries(condition.params || {})
        .map(([k, v]) => `${v}`)
        .join(", ");
      const valStr =
        typeof condition.value === "object"
          ? (condition.value as any).indicator || "Indicator"
          : String(condition.value);

      return (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {condition.indicator}{paramStr ? `(${paramStr})` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1 font-bold text-cyan-300">
            <span>{condition.operator}</span>
            <span className="text-slate-100">{valStr}</span>
          </div>
        </div>
      );
    }

    case "price": {
      const refStr =
        typeof condition.reference === "object"
          ? (condition.reference as any).indicator || "Indicator"
          : String(condition.reference);

      return (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md border border-purple-500/30 bg-purple-500/10 text-purple-400 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-purple-400" />
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Price ({condition.source || "close"})
            </span>
          </div>
          <div className="flex items-center gap-1 font-bold">
            <span>{condition.operator}</span>
            <span className="text-slate-100">{refStr}</span>
          </div>
        </div>
      );
    }

    case "session":
      return (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[11px] font-mono">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-bold">Session:</span>
          <span className="text-slate-100">{condition.session} Session</span>
        </div>
      );

    case "breakout":
      return (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 text-sky-400 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-bold">Breakout {condition.direction}</span>
          </div>
          <span className="text-slate-100 font-bold">{condition.reference}</span>
        </div>
      );

    case "pattern":
      return (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] font-mono">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-bold">Pattern:</span>
          <span className="text-slate-100 uppercase">{condition.pattern}</span>
        </div>
      );

    default:
      return (
        <div className="px-2.5 py-1.5 rounded-md border border-slate-700 bg-slate-900 text-[11px] font-mono text-slate-300">
          Rule Condition
        </div>
      );
  }
};
