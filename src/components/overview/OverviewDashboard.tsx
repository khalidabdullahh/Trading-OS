import React from "react";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  DollarSign,
  Globe,
  Sliders,
  Sparkles,
  Zap,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { StorageAdapter } from "../../services/storage/storageAdapter";
import { MarketDataProvider } from "../../services/market/marketDataProvider";
import { PerformanceAnalytics } from "../../services/analytics/performanceAnalytics";
import { NewsService } from "../../services/market/newsService";
import { RuleViolationEngine } from "../../services/trading/ruleViolationEngine";

interface OverviewDashboardProps {
  onNavigate: (tab: string) => void;
  onSelectSymbol: (symbol: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigate,
  onSelectSymbol
}) => {
  const userId = StorageAdapter.getCurrentUserId();
  const account = StorageAdapter.getTradingAccounts(userId)[0] || { balance: 10000, equity: 10000 };
  const trades = StorageAdapter.getTrades(userId);
  const plan = StorageAdapter.getTradingPlan(userId);
  const risk = StorageAdapter.getRiskSettings(userId);
  const metrics = PerformanceAnalytics.calculate(trades);
  const news = NewsService.getNewsArticles().slice(0, 3);
  const events = NewsService.getEconomicEvents().slice(0, 3);
  const violations = RuleViolationEngine.auditTrades(trades, plan, risk, account.equity);

  const topTickers = [
    { symbol: "BTCUSDT", name: "Bitcoin", price: "$64,200.00", change: "+1.98%", isUp: true, category: "Crypto" },
    { symbol: "ETHUSDT", name: "Ethereum", price: "$3,450.00", change: "+1.92%", isUp: true, category: "Crypto" },
    { symbol: "XAUUSD", name: "Gold Spot", price: "$2,510.00", change: "+0.74%", isUp: true, category: "Commodities" },
    { symbol: "EURUSD", name: "EUR / USD", price: "$1.0885", change: "-0.23%", isUp: false, category: "Forex" },
    { symbol: "NAS100", name: "Nasdaq 100", price: "$19,780.00", change: "+0.74%", isUp: true, category: "Indices" },
    { symbol: "NVDA", name: "NVIDIA", price: "$128.50", change: "+2.55%", isUp: true, category: "Stocks" }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome / Status Card */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="text-cyan-500">TRADING OS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono font-bold border border-cyan-500/20">
                v2.01 PRODUCTION
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Market Intelligence • Strategy Lab • Risk Center • Trade Journal • AI Analytics
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onNavigate("Strategy Lab")}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            <span>Build Strategy</span>
          </button>
          <button
            onClick={() => onNavigate("AI Analyst")}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <BrainCircuit className="h-4 w-4 text-cyan-500" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Live Market Ticker Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        {topTickers.map(t => (
          <div
            key={t.symbol}
            onClick={() => {
              onSelectSymbol(t.symbol);
              onNavigate("Charts & Backtest");
            }}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090e1a] hover:border-cyan-500/50 transition cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-500 transition-colors">
                {t.symbol}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">{t.category}</span>
            </div>
            <p className="font-bold text-slate-800 dark:text-slate-200">{t.price}</p>
            <div className={`flex items-center gap-1 font-bold ${t.isUp ? "text-emerald-500" : "text-rose-500"}`}>
              {t.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span>{t.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Trading Account Equity</span>
          <p className="text-2xl font-black text-cyan-500">${account.equity.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-sans">Primary Live Execution Balance</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Verified Win Rate</span>
          <p className="text-2xl font-black text-emerald-500">{metrics.winRate}%</p>
          <p className="text-[10px] text-slate-400 font-sans">From {metrics.totalTrades} closed journal trades</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Profit Factor / R:R</span>
          <p className="text-2xl font-black text-purple-400">{metrics.profitFactor} / {metrics.averageR}R</p>
          <p className="text-[10px] text-slate-400 font-sans">Average Expectancy: +${metrics.expectancy}</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Max Drawdown</span>
          <p className="text-2xl font-black text-rose-500">-${metrics.maxDrawdown} ({metrics.maxDrawdownPct}%)</p>
          <p className="text-[10px] text-slate-400 font-sans">Daily limit: {plan.maxDailyLossPct}%</p>
        </div>
      </div>

      {/* Grid: Recent Trades & Macro Catalysts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left: Recent Executions Log */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-cyan-500" />
              <span>Recent Trade Executions</span>
            </span>
            <button
              onClick={() => onNavigate("Trade Journal")}
              className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Journal</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5 font-mono">
            {trades.slice(0, 3).map(t => {
              const isUp = t.netPnl >= 0;
              return (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{t.symbol}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          t.direction === "LONG" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {t.direction}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">{t.session} Session</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">{t.setupType || "Quantitative Model"}</p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-bold block ${
                        isUp ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {isUp ? "+" : ""}${t.netPnl.toFixed(2)} ({isUp ? "+" : ""}{t.netPnlPct.toFixed(2)}%)
                    </span>
                    <span className="text-[10px] text-cyan-400">{t.rMultiple ? `${t.rMultiple}R` : "2.0R"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: High-Impact Macro Catalysts */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-500" />
              <span>Upcoming High-Impact Macro</span>
            </span>
            <button
              onClick={() => onNavigate("Economic Calendar")}
              className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Calendar</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5 font-sans">
            {events.map(ev => (
              <div
                key={ev.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{ev.event}</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-mono font-bold text-[10px]">
                    {ev.impact}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                  <span>Currency: {ev.currency}</span>
                  <span>Forecast: {ev.forecast}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
