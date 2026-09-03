import React, { useState } from "react";
import {
  ShieldCheck,
  DollarSign,
  Calculator,
  Percent,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  Activity,
  CheckCircle2
} from "lucide-react";
import { RiskCalculator, PositionSizeResult } from "../../services/risk/riskCalculator";
import { StorageAdapter } from "../../services/storage/storageAdapter";
import { RuleViolationEngine } from "../../services/trading/ruleViolationEngine";

export const RiskCenterView: React.FC = () => {
  const account = StorageAdapter.getTradingAccounts()[0] || { balance: 10000, equity: 10000 };
  const riskSettings = StorageAdapter.getRiskSettings();
  const plan = StorageAdapter.getTradingPlan();
  const trades = StorageAdapter.getTrades();
  const violations = RuleViolationEngine.auditTrades(trades, plan, riskSettings, account.equity);

  // Position Sizing Calculator state
  const [accountEquity, setAccountEquity] = useState(account.equity || 10000);
  const [riskPct, setRiskPct] = useState(plan.maxRiskPerTradePct || 1.0);
  const [entryPrice, setEntryPrice] = useState(64000.0);
  const [stopLossPrice, setStopLossPrice] = useState(63000.0);
  const [takeProfitPrice, setTakeProfitPrice] = useState(66000.0);
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [model, setModel] = useState<"percent_equity" | "fixed_cash" | "atr_risk">("percent_equity");

  const sizingResult: PositionSizeResult = RiskCalculator.calculatePositionSize({
    accountEquity,
    riskPct,
    entryPrice,
    stopLossPrice,
    model
  });

  const rrRatio = RiskCalculator.calculateRiskReward(entryPrice, stopLossPrice, takeProfitPrice, direction);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-500" />
            <span>Institutional Risk Center & Position Sizing Engine</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deterministic risk allocation, portfolio drawdown containment, and real-time mathematical trade sizing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-mono text-xs font-bold">
            Account Equity: ${accountEquity.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Max Account Risk</span>
          <p className="text-xl font-black text-cyan-500">{riskSettings.maxAccountRiskPct}%</p>
          <p className="text-[10px] text-slate-400 font-sans">Total open market exposure ceiling</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Daily Loss Limit</span>
          <p className="text-xl font-black text-rose-500">{plan.maxDailyLossPct}% (${(accountEquity * (plan.maxDailyLossPct / 100)).toFixed(0)})</p>
          <p className="text-[10px] text-slate-400 font-sans">Enforced by Rule Violation Engine</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Active Risk / Trade</span>
          <p className="text-xl font-black text-purple-400">{riskPct}% (${(accountEquity * (riskPct / 100)).toFixed(2)})</p>
          <p className="text-[10px] text-slate-400 font-sans">Single position risk allocation</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Rule Violations</span>
          <p className={`text-xl font-black ${violations.length > 0 ? "text-amber-500" : "text-emerald-500"}`}>
            {violations.length} Flags
          </p>
          <p className="text-[10px] text-slate-400 font-sans">{violations.length > 0 ? "Audited trade discrepancies" : "100% Rule Compliance"}</p>
        </div>
      </div>

      {/* Main Sizing Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left: Interactive Sizing Calculator Inputs */}
        <div className="lg:col-span-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-cyan-500" />
              <span>Position Sizing Calculator</span>
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setDirection("LONG")}
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  direction === "LONG" ? "bg-emerald-500 text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                LONG
              </button>
              <button
                onClick={() => setDirection("SHORT")}
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  direction === "SHORT" ? "bg-rose-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                SHORT
              </button>
            </div>
          </div>

          <div className="space-y-3 font-mono">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-sans font-semibold mb-1">
                Account Equity ($):
              </label>
              <input
                type="number"
                value={accountEquity}
                onChange={e => setAccountEquity(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-sans font-semibold mb-1">
                Risk Per Trade (%):
              </label>
              <input
                type="number"
                step="0.1"
                value={riskPct}
                onChange={e => setRiskPct(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-sans font-semibold mb-1">
                  Entry Price ($):
                </label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={e => setEntryPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-sans font-semibold mb-1">
                  Stop Loss Price ($):
                </label>
                <input
                  type="number"
                  value={stopLossPrice}
                  onChange={e => setStopLossPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-sans font-semibold mb-1">
                Take Profit Target ($):
              </label>
              <input
                type="number"
                value={takeProfitPrice}
                onChange={e => setTakeProfitPrice(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right: Real-time Mathematical Output */}
        <div className="lg:col-span-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span>Calculated Order Sizing & Risk Bracket</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 font-bold">
              1:{rrRatio} R:R
            </span>
          </div>

          <div className="space-y-3 font-mono">
            <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-1">
              <span className="text-[11px] font-sans text-slate-500">Recommended Units (Quantity):</span>
              <p className="text-2xl font-black text-cyan-500">{sizingResult.units} Units</p>
              <p className="text-[10px] text-slate-400 font-sans">Total Position Value: ${sizingResult.positionValueUsd.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-0.5">
                <span className="text-[10px] font-sans text-slate-400">Total Cash at Risk</span>
                <p className="text-base font-bold text-rose-500">-${sizingResult.riskAmountUsd.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400 font-sans">{sizingResult.riskPct}% of capital</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-0.5">
                <span className="text-[10px] font-sans text-slate-400">Stop Loss Distance</span>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">${sizingResult.stopDistanceUsd}</p>
                <p className="text-[10px] text-slate-400 font-sans">{sizingResult.stopDistancePct}% price delta</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-1 text-[11px] font-sans text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Execution Rule Check:</span>
              {rrRatio >= 2.0 ? (
                <p className="text-emerald-500 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Valid Risk-to-Reward Ratio (1:{rrRatio} satisfies Trading Plan requirement).</span>
                </p>
              ) : (
                <p className="text-amber-500 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Warning: R:R ratio (1:{rrRatio}) is below the recommended 1:2.0 minimum.</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rule Violations Section */}
      {violations.length > 0 && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-sm space-y-3 text-xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
            <AlertTriangle className="h-4 w-4" />
            <span>Active Rule Violations Detected in Journal History ({violations.length})</span>
          </div>
          <div className="space-y-2">
            {violations.map(v => (
              <div
                key={v.id}
                className="p-3 rounded-xl border border-amber-500/20 bg-white dark:bg-[#090e1a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{v.rule}: </span>
                  <span className="text-slate-600 dark:text-slate-400">{v.observedBehavior}</span>
                  <p className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-0.5">💡 Fix: {v.suggestedImprovement}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                  {v.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
