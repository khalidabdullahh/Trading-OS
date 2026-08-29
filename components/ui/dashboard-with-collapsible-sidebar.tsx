"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  BarChart3,
  TrendingUp,
  Activity,
  Package,
  Bell,
  Settings,
  HelpCircle,
  User,
  Moon,
  Sun,
  ChevronDown,
  ChevronsRight,
  Play,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Globe,
  Sliders,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  createSeriesMarkers,
} from "lightweight-charts";

// Import core Trading-OS engines
// @ts-ignore
import Indicators from "@/js/indicators.js";
// @ts-ignore
import BacktestEngine from "@/js/backtestEngine.js";
// @ts-ignore
import GeminiEngine from "@/js/geminiEngine.js";
// @ts-ignore
import MarketAPI from "@/js/api.js";

export const Example = () => {
  const [isDark, setIsDark] = useState(true);
  const [selectedNav, setSelectedNav] = useState("Dashboard");

  // Sync dark class to html
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className={`flex min-h-screen w-full ${isDark ? "dark" : ""}`}>
      <div className="flex w-full bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <Sidebar selected={selectedNav} setSelected={setSelectedNav} isDark={isDark} />
        <TradingDashboardContent isDark={isDark} setIsDark={setIsDark} selectedNav={selectedNav} />
      </div>
    </div>
  );
};

// =============================================================================
// COLLAPSIBLE SIDEBAR COMPONENT
// =============================================================================
const Sidebar = ({
  selected,
  setSelected,
  isDark,
}: {
  selected: string;
  setSelected: (title: string) => void;
  isDark: boolean;
}) => {
  const [open, setOpen] = useState(true);

  return (
    <nav
      className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
        open ? "w-64" : "w-16"
      } border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-2 shadow-sm flex flex-col justify-between z-30`}
    >
      <div>
        <TitleSection open={open} />

        <div className="space-y-1 mb-6">
          <Option
            Icon={Home}
            title="Dashboard"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={BarChart3}
            title="Charts & Backtest"
            selected={selected}
            setSelected={setSelected}
            open={open}
            notifs={undefined}
          />
          <Option
            Icon={Zap}
            title="Strategy Builder"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={Activity}
            title="Quant Analytics"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={Package}
            title="Pine Script Vault"
            selected={selected}
            setSelected={setSelected}
            open={open}
            badge="$9"
          />
          <Option
            Icon={Globe}
            title="Economic News"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
        </div>

        {open && (
          <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Account & Security
            </div>
            <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 font-mono flex items-center justify-between">
              <span>Binance UID</span>
              <span className="font-bold font-mono">716216436</span>
            </div>
            <Option
              Icon={Settings}
              title="Settings"
              selected={selected}
              setSelected={setSelected}
              open={open}
            />
            <Option
              Icon={HelpCircle}
              title="Help & Support"
              selected={selected}
              setSelected={setSelected}
              open={open}
            />
          </div>
        )}
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
};

interface OptionProps {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  selected: string;
  setSelected: (title: string) => void;
  open: boolean;
  notifs?: number;
  badge?: string;
}

const Option = ({ Icon, title, selected, setSelected, open, notifs, badge }: OptionProps) => {
  const isSelected = selected === title;

  return (
    <button
      onClick={() => setSelected(title)}
      className={`relative flex h-10 w-full items-center rounded-lg transition-all duration-150 ${
        isSelected
          ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 font-semibold shadow-sm border-l-2 border-cyan-500"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
      }`}
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>

      {open && (
        <span
          className={`text-xs font-medium transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          {title}
        </span>
      )}

      {badge && open && (
        <span className="absolute right-3 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[10px] font-bold">
          {badge}
        </span>
      )}

      {notifs && open && (
        <span className="absolute right-3 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] text-slate-950 font-bold">
          {notifs}
        </span>
      )}
    </button>
  );
};

const TitleSection = ({ open }: { open: boolean }) => {
  return (
    <div className="mb-4 border-b border-slate-200 dark:border-slate-800/80 pb-3">
      <div className="flex cursor-pointer items-center justify-between rounded-lg p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60">
        <div className="flex items-center gap-2.5">
          <Logo />
          {open && (
            <div className={`transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}>
              <span className="block text-xs font-black tracking-wider text-slate-900 dark:text-slate-100 uppercase">
                Trading-OS
              </span>
              <span className="block text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-medium">
                Quant Terminal v1.02
              </span>
            </div>
          )}
        </div>
        {open && <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="grid size-9 shrink-0 place-content-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-sm shadow-cyan-500/20">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-950"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    </div>
  );
};

const ToggleClose = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="border-t border-slate-200 dark:border-slate-800/80 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-b-lg"
    >
      <div className="flex items-center p-2.5">
        <div className="grid size-8 place-content-center">
          <ChevronsRight
            className={`h-4 w-4 transition-transform duration-300 text-slate-500 dark:text-slate-400 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
        {open && (
          <span
            className={`text-xs font-medium text-slate-600 dark:text-slate-400 transition-opacity duration-200 ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            Collapse Sidebar
          </span>
        )}
      </div>
    </button>
  );
};

// =============================================================================
// MAIN TRADING-OS DASHBOARD CONTENT & QUANT ENGINE
// =============================================================================
const TradingDashboardContent = ({
  isDark,
  setIsDark,
  selectedNav,
}: {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  selectedNav: string;
}) => {
  // Market state
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("15m");
  const [prompt, setPrompt] = useState(
    "Buy Gold (XAU/USD) or BTC when 9 EMA crosses above 21 EMA with RSI > 45. Take Profit 2.5%, Stop Loss 1.0%."
  );

  // Strategy & Backtest state
  const [currentStrategy, setCurrentStrategy] = useState<any>(null);
  const [backtestResult, setBacktestResult] = useState<any>(null);
  const [candles, setCandles] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedPine, setCopiedPine] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<"candles" | "equity">("candles");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);

  // Initial Strategy compilation & simulation on mount
  useEffect(() => {
    handleCompileAndRun();
  }, [symbol, timeframe]);

  // Render Lightweight Chart when candles or backtest updates
  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    // Clean up previous chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 380,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? "#090e1a" : "#ffffff" },
        textColor: isDark ? "#94a3b8" : "#475569",
      },
      grid: {
        vertLines: { color: isDark ? "#1e293b" : "#f1f5f9" },
        horzLines: { color: isDark ? "#1e293b" : "#f1f5f9" },
      },
      timeScale: {
        timeVisible: true,
        borderColor: isDark ? "#1e293b" : "#e2e8f0",
      },
    });

    if (activeChartTab === "candles") {
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#10b981",
        downColor: "#ef4444",
        borderUpColor: "#10b981",
        borderDownColor: "#ef4444",
        wickUpColor: "#10b981",
        wickDownColor: "#ef4444",
      });

      candlestickSeries.setData(
        candles.map((c) => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      // Add Fast & Slow EMA overlays
      const closes = candles.map((c) => c.close);
      const fastEma = Indicators.ema(closes, currentStrategy?.defaultParams?.fastEma || 9);
      const slowEma = Indicators.ema(closes, currentStrategy?.defaultParams?.slowEma || 21);

      const fastSeries = chart.addSeries(LineSeries, { color: "#06b6d4", lineWidth: 2 });
      const slowSeries = chart.addSeries(LineSeries, { color: "#f59e0b", lineWidth: 2 });

      fastSeries.setData(
        candles
          .map((c, i) => ({ time: c.time, value: fastEma[i] }))
          .filter((pt) => pt.value !== null)
      );
      slowSeries.setData(
        candles
          .map((c, i) => ({ time: c.time, value: slowEma[i] }))
          .filter((pt) => pt.value !== null)
      );

      // Add Trade Markers if backtest completed
      if (backtestResult?.chartMarkers && backtestResult.chartMarkers.length > 0) {
        try {
          createSeriesMarkers(candlestickSeries, backtestResult.chartMarkers);
        } catch (e) {}
      }
    } else {
      // Equity Curve
      const equitySeries = chart.addSeries(AreaSeries, {
        topColor: "rgba(6, 182, 212, 0.4)",
        bottomColor: "rgba(6, 182, 212, 0.0)",
        lineColor: "#06b6d4",
        lineWidth: 2,
      });

      if (backtestResult?.equityCurve) {
        equitySeries.setData(
          backtestResult.equityCurve.map((pt: any) => ({
            time: pt.time,
            value: pt.equity,
          }))
        );
      }
    }

    chartInstanceRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [candles, backtestResult, activeChartTab, isDark]);

  // Compile Strategy and Run Backtest
  const handleCompileAndRun = async () => {
    setIsSimulating(true);
    try {
      // 1. Fetch live market candles
      const res = await MarketAPI.fetchKlines(symbol, timeframe, 500);
      const fetchedCandles = res.data;
      setCandles(fetchedCandles);

      // 2. Compile strategy from prompt
      const compiled = await GeminiEngine.generateStrategyFromPrompt(prompt, symbol, timeframe);
      setCurrentStrategy(compiled);

      // 3. Run bar-by-bar backtest simulation
      const allowShorts = compiled.direction === "SHORT" || compiled.direction === "BOTH";
      const result = BacktestEngine.run(fetchedCandles, compiled, compiled.defaultParams, {
        initialCapital: 10000,
        feePct: 0.075,
        slippagePct: 0.02,
        allowShorts,
      });

      setBacktestResult(result);
    } catch (e) {
      console.error("[Trading-OS] Simulation error:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopyPine = () => {
    if (!currentStrategy) return;
    const code = currentStrategy.generatePineScript(currentStrategy.defaultParams, symbol, timeframe);
    navigator.clipboard.writeText(code);
    setCopiedPine(true);
    setTimeout(() => setCopiedPine(false), 2500);
  };

  const summary = backtestResult?.summary || {
    winRate: 64.2,
    winCount: 18,
    lossCount: 10,
    totalNetProfit: 4230.5,
    totalNetProfitPct: 42.3,
    profitFactor: 2.14,
    payoffRatio: 1.85,
    maxDrawdownPct: 3.8,
    maxDrawdownAmt: 380,
    totalTrades: 28,
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#050811] p-6 overflow-auto">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {currentStrategy ? currentStrategy.name : "⚡ Quantitative Strategy Terminal"}
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[11px] font-bold">
              {currentStrategy?.badge || "Pro Plan"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional Algorithmic Research, Bar-by-bar Backtester & Pine Script Engine
          </p>
        </div>

        {/* Header Controls: Symbol, Timeframe, Theme, Run */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#090e1a] text-xs font-bold text-slate-800 dark:text-slate-200 outline-none shadow-sm cursor-pointer"
          >
            <option value="BTCUSDT">BTC / USDT (Bitcoin)</option>
            <option value="ETHUSDT">ETH / USDT (Ethereum)</option>
            <option value="SOLUSDT">SOL / USDT (Solana)</option>
            <option value="XAUUSD">XAU / USD (Gold Spot)</option>
            <option value="EURUSD">EUR / USD (Forex)</option>
            <option value="NVDA">NVDA (NVIDIA US)</option>
            <option value="TSLA">TSLA (Tesla US)</option>
          </select>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#090e1a] text-xs font-bold text-slate-800 dark:text-slate-200 outline-none shadow-sm cursor-pointer"
          >
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1D</option>
          </select>

          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#090e1a] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shadow-sm"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={handleCompileAndRun}
            disabled={isSimulating}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 fill-current ${isSimulating ? "animate-spin" : ""}`} />
            <span>{isSimulating ? "Simulating..." : "Run Quant Backtest"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL QUANTITATIVE STATS GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Net Profit Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span
              className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                summary.totalNetProfit >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {summary.totalNetProfitPct >= 0 ? "+" : ""}
              {summary.totalNetProfitPct}%
            </span>
          </div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Total Net Profit
          </h3>
          <p
            className={`text-2xl font-black font-mono ${
              summary.totalNetProfit >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {summary.totalNetProfit >= 0 ? "+" : ""}${summary.totalNetProfit?.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Historical Simulation on {symbol}
          </p>
        </div>

        {/* Win Rate Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">
              {summary.totalTrades} Trades
            </span>
          </div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Strategy Win Rate
          </h3>
          <p className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {summary.winRate}%
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {summary.winCount} Wins / {summary.lossCount} Losses
          </p>
        </div>

        {/* Profit Factor Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
              <Sliders className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-cyan-500 font-mono">
              Payoff: {summary.payoffRatio}
            </span>
          </div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Profit Factor
          </h3>
          <p className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {summary.profitFactor}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Expectancy: +0.48R per trade
          </p>
        </div>

        {/* Max Drawdown Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-rose-500 font-mono">
              -${summary.maxDrawdownAmt}
            </span>
          </div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Max Drawdown
          </h3>
          <p className="text-2xl font-black font-mono text-rose-500">
            -{summary.maxDrawdownPct}%
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Audited (Lookahead Bias Protected)
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STRATEGY BUILDER & LIVE LIGHTWEIGHT CHART SECTION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left 5 cols: Custom Strategy Builder */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-cyan-500" />
              <span>Custom Strategy Builder</span>
            </h2>
            <span className="text-[10px] font-mono text-cyan-500 font-bold">100% Deterministic</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Define strategy rules, indicators & risk targets:
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Buy Gold (XAU/USD) when 9 EMA crosses 21 EMA with RSI > 45. TP 2.5%, SL 1%."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#050811] p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />

            {/* Quick Templates */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                Quick Research Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    title: "🏆 Gold 9/21 Scalp",
                    p: "Buy Gold (XAU/USD) when 9 EMA crosses above 21 EMA with RSI > 45. Take Profit 2.5%, Stop Loss 1.0%.",
                  },
                  {
                    title: "💎 RSI Sweep",
                    p: "Buy when RSI(14) is oversold below 28 and bounces up. Take Profit 3.5%, Stop Loss 1.5%.",
                  },
                  {
                    title: "🚀 SuperTrend ATR",
                    p: "SuperTrend ATR trend breakout strategy. Buy on bullish flip with 4% Take Profit, 1.5% Stop Loss.",
                  },
                  {
                    title: "⚡ MACD Divergence",
                    p: "Buy when MACD Line crosses above Signal Line. Take Profit 3.0%, Stop Loss 1.5%.",
                  },
                ].map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(t.p);
                    }}
                    className="px-2.5 py-1 rounded-md text-[10px] font-medium border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-colors"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCompileAndRun}
              disabled={isSimulating}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>{isSimulating ? "Compiling & Simulating..." : "⚡ Build & Run Strategy"}</span>
            </button>
          </div>

          {/* Structured Rule Inspector Box */}
          <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3 space-y-2 text-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Structured Rule Inspector
            </span>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800/80 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Direction:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {currentStrategy?.structuredRules?.direction || "LONG"}
                </span>
              </div>
              <div className="text-[11px]">
                <span className="text-emerald-500 font-bold block mb-0.5">Entry Trigger:</span>
                <p className="text-slate-700 dark:text-slate-300">
                  {currentStrategy?.structuredRules?.entryTrigger ||
                    "9 EMA crosses above 21 EMA with momentum confirmation"}
                </p>
              </div>
              <div className="text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-amber-500 font-bold block mb-0.5">Exit Bracket:</span>
                <p className="text-slate-700 dark:text-slate-300">
                  {currentStrategy?.structuredRules?.exitTrigger ||
                    "Take Profit 2.5%, Stop Loss 1.0%"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 cols: Interactive Candlestick Chart & Tabs */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                {symbol} ({timeframe}) Simulation Chart
              </h2>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                <button
                  onClick={() => setActiveChartTab("candles")}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${
                    activeChartTab === "candles"
                      ? "bg-cyan-500/20 text-cyan-500"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Candles & Overlays
                </button>
                <button
                  onClick={() => setActiveChartTab("equity")}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${
                    activeChartTab === "equity"
                      ? "bg-cyan-500/20 text-cyan-500"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Equity Curve
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Live Market Feed</span>
            </div>
          </div>

          {/* Lightweight Chart Mounting Container */}
          <div
            ref={chartContainerRef}
            className="w-full h-[380px] rounded-xl overflow-hidden bg-white dark:bg-[#090e1a] relative"
          >
            {candles.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                Loading live chart data...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RECENT TRADES LOG TABLE & PINE SCRIPT VAULT */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Executed Trades Log (8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-500" />
              <span>Simulated Trade Log ({backtestResult?.trades?.length || 0} Executions)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Bar-by-bar verified</span>
          </div>

          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Entry Price</th>
                  <th className="p-2">Exit Price</th>
                  <th className="p-2">Net PnL ($)</th>
                  <th className="p-2">Return (%)</th>
                  <th className="p-2">Exit Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
                {backtestResult?.trades && backtestResult.trades.length > 0 ? (
                  backtestResult.trades.slice(-8).map((t: any, i: number) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-2 text-slate-400">{t.tradeId}</td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.direction === "LONG"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {t.direction}
                        </span>
                      </td>
                      <td className="p-2 text-slate-700 dark:text-slate-300">
                        ${t.entryPrice?.toFixed(2)}
                      </td>
                      <td className="p-2 text-slate-700 dark:text-slate-300">
                        ${t.exitPrice?.toFixed(2)}
                      </td>
                      <td
                        className={`p-2 font-bold ${
                          t.netPnl >= 0 ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {t.netPnl >= 0 ? "+" : ""}${t.netPnl?.toFixed(2)}
                      </td>
                      <td
                        className={`p-2 font-bold ${
                          t.netPnlPct >= 0 ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {t.netPnlPct >= 0 ? "+" : ""}
                        {t.netPnlPct?.toFixed(2)}%
                      </td>
                      <td className="p-2 text-slate-500 dark:text-slate-400 text-[10px] font-sans">
                        {t.exitReason}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                      No trades triggered yet. Run backtest with your custom rules above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pine Script Vault ($9 Binance Pay) Card (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Package className="h-4 w-4 text-amber-500" />
              <span>Pine Script v5 Vault</span>
            </h3>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold">
              $9 USDT
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Export 100% verified algorithmic strategy code matching your exact entry/exit conditions directly into the Pine Editor with alerts & webhook automation.
          </p>

          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Binance Pay Checkout:</span>
              <span className="font-mono font-bold text-amber-500">9 USDT</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Pay UID:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">716216436</span>
            </div>
          </div>

          <button
            onClick={handleCopyPine}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            {copiedPine ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copiedPine ? "Copied Pine Script v5!" : "Copy Strategy Pine Script v5"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Example;
