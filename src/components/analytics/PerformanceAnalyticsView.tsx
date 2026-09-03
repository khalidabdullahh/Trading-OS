import React from "react";
import {
  BarChart3,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Clock,
  ShieldCheck,
  Award
} from "lucide-react";
import { StorageAdapter } from "../../services/storage/storageAdapter";
import { PerformanceAnalytics } from "../../services/analytics/performanceAnalytics";
import { PerformanceMetrics } from "../../types/domain";

export const PerformanceAnalyticsView: React.FC = () => {
  const userId = StorageAdapter.getCurrentUserId();
  const trades = StorageAdapter.getTrades(userId);
  const metrics: PerformanceMetrics = PerformanceAnalytics.calculate(trades);
  const sessionBreakdown = PerformanceAnalytics.breakdownBySession(trades);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-500" />
            <span>Institutional Performance Analytics & Edge Verification</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rigorous mathematical statistics calculated directly from audited trade execution logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono text-xs font-bold">
            Total Return: {metrics.netReturnPct >= 0 ? "+" : ""}{metrics.netReturnPct}%
          </span>
        </div>
      </div>

      {/* Top 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Win Rate ({metrics.winningTrades}/{metrics.totalTrades})</span>
          <p className="text-2xl font-black text-emerald-500">{metrics.winRate}%</p>
          <p className="text-[10px] text-slate-400 font-sans">Longs: {metrics.longWinRate}% • Shorts: {metrics.shortWinRate}%</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Profit Factor</span>
          <p className="text-2xl font-black text-cyan-500">{metrics.profitFactor}</p>
          <p className="text-[10px] text-slate-400 font-sans">Gross Profit / Gross Loss ratio</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Mathematical Expectancy</span>
          <p className="text-2xl font-black text-purple-400">+${metrics.expectancy}</p>
          <p className="text-[10px] text-slate-400 font-sans">Expected value per trade placed</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Sharpe / Calmar Ratio</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{metrics.sharpeRatio} / {metrics.recoveryFactor}</p>
          <p className="text-[10px] text-slate-400 font-sans">Risk-adjusted return persistence</p>
        </div>
      </div>

      {/* Grid: Secondary Stats & Session Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs font-mono">
        {/* Left: Detailed Quantitative Metrics */}
        <div className="lg:col-span-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4 font-sans">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-500" />
            <span>Quantitative Execution Statistics</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-0.5">
              <span className="text-[10px] font-sans text-slate-400">Average Win</span>
              <p className="text-base font-bold text-emerald-500">+${metrics.averageWin}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-0.5">
              <span className="text-[10px] font-sans text-slate-400">Average Loss</span>
              <p className="text-base font-bold text-rose-500">-${metrics.averageLoss}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-0.5">
              <span className="text-[10px] font-sans text-slate-400">Average R-Multiple</span>
              <p className="text-base font-bold text-cyan-500">{metrics.averageR}R</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-0.5">
              <span className="text-[10px] font-sans text-slate-400">Maximum Drawdown</span>
              <p className="text-base font-bold text-rose-500">-${metrics.maxDrawdown} ({metrics.maxDrawdownPct}%)</p>
            </div>
          </div>
        </div>

        {/* Right: Session Breakdown Matrix */}
        <div className="lg:col-span-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4 font-sans">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-500" />
            <span>Session Performance Matrix</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {Object.entries(sessionBreakdown).map(([sess, data]) => (
              <div
                key={sess}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-sans block">{sess} Session</span>
                  <span className="text-[10px] text-slate-400 font-sans">{data.trades} Executions</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-500 block">{data.winRate}% Win</span>
                  <span className={`text-[11px] ${data.netPnl >= 0 ? "text-cyan-400" : "text-rose-400"}`}>
                    {data.netPnl >= 0 ? "+" : ""}${data.netPnl.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
