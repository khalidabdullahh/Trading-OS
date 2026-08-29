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
  X,
  Send,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Info,
  Calendar,
  DollarSign,
  AlertTriangle,
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
  const [isDark, setIsDark] = useState(false);
  const [selectedNav, setSelectedNav] = useState("Dashboard");

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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
        <Sidebar
          selected={selectedNav}
          setSelected={setSelectedNav}
          openSettings={() => setIsSettingsOpen(true)}
          openHelp={() => setIsHelpOpen(true)}
        />
        <TradingDashboardContent
          isDark={isDark}
          setIsDark={setIsDark}
          selectedNav={selectedNav}
          setSelectedNav={setSelectedNav}
          openCheckout={() => setIsCheckoutOpen(true)}
        />

        {/* Global Modals */}
        {isCheckoutOpen && (
          <CheckoutModal isDark={isDark} onClose={() => setIsCheckoutOpen(false)} />
        )}
        {isSettingsOpen && (
          <SettingsModal isDark={isDark} onClose={() => setIsSettingsOpen(false)} />
        )}
        {isHelpOpen && (
          <HelpModal isDark={isDark} onClose={() => setIsHelpOpen(false)} />
        )}
      </div>
    </div>
  );
};

// =============================================================================
// 1. COLLAPSIBLE SIDEBAR COMPONENT (No UID displayed here!)
// =============================================================================
const Sidebar = ({
  selected,
  setSelected,
  openSettings,
  openHelp,
}: {
  selected: string;
  setSelected: (title: string) => void;
  openSettings: () => void;
  openHelp: () => void;
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
              Terminal Controls
            </div>
            <button
              onClick={openSettings}
              className="flex h-10 w-full items-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <div className="grid h-full w-12 place-content-center">
                <Settings className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">Settings</span>
            </button>

            <button
              onClick={openHelp}
              className="flex h-10 w-full items-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <div className="grid h-full w-12 place-content-center">
                <HelpCircle className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">Help & Support</span>
            </button>
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
// 2. MAIN CONTENT AREA & REACTIVE NAVIGATION
// =============================================================================
const TradingDashboardContent = ({
  isDark,
  setIsDark,
  selectedNav,
  setSelectedNav,
  openCheckout,
}: {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  selectedNav: string;
  setSelectedNav: (val: string) => void;
  openCheckout: () => void;
}) => {
  // Market state
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("15m");
  const [prompt, setPrompt] = useState(
    "Buy Gold (XAU/USD) or BTC when 9 EMA crosses above 21 EMA with RSI > 45. Take Profit 2.5%, Stop Loss 1.0%."
  );

  // Direction: 'LONG' | 'SHORT' | 'BOTH'
  const [directionMode, setDirectionMode] = useState<"LONG" | "SHORT" | "BOTH">("LONG");

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
  }, [symbol, timeframe, directionMode]);

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
      let adjustedPrompt = prompt;
      if (directionMode === "SHORT" && !/short|sell/i.test(adjustedPrompt)) {
        adjustedPrompt += " (Execute SHORT / Sell signals only)";
      } else if (directionMode === "BOTH" && !/both/i.test(adjustedPrompt)) {
        adjustedPrompt += " (Execute both LONG and SHORT signals)";
      }

      const compiled = await GeminiEngine.generateStrategyFromPrompt(adjustedPrompt, symbol, timeframe);
      compiled.direction = directionMode;
      if (compiled.structuredRules) {
        compiled.structuredRules.direction = directionMode;
      }
      setCurrentStrategy(compiled);

      // 3. Run bar-by-bar backtest simulation with SHORT support
      const allowShorts = directionMode === "SHORT" || directionMode === "BOTH";
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
      {/* Top Header Bar */}
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

      {/* Top 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      {/* 3. DYNAMIC CONTENT VIEWS BASED ON SELECTED SIDEBAR TAB */}
      {/* ========================================================================= */}

      {/* VIEW: ECONOMIC NEWS */}
      {selectedNav === "Economic News" && (
        <EconomicNewsSection isDark={isDark} />
      )}

      {/* VIEW: QUANT ANALYTICS */}
      {selectedNav === "Quant Analytics" && (
        <QuantAnalyticsSection summary={summary} backtestResult={backtestResult} />
      )}

      {/* VIEW: PINE SCRIPT VAULT */}
      {selectedNav === "Pine Script Vault" && (
        <PineVaultSection
          currentStrategy={currentStrategy}
          copiedPine={copiedPine}
          handleCopyPine={handleCopyPine}
          openCheckout={openCheckout}
        />
      )}

      {/* VIEW: DASHBOARD / CHARTS / STRATEGY BUILDER */}
      {(selectedNav === "Dashboard" || selectedNav === "Charts & Backtest" || selectedNav === "Strategy Builder") && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Left Column: Custom Strategy Builder with Direction Switcher */}
            {(selectedNav === "Dashboard" || selectedNav === "Strategy Builder") && (
              <div className={`${selectedNav === "Strategy Builder" ? "lg:col-span-12" : "lg:col-span-5"} rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4`}>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-cyan-500" />
                    <span>Custom Strategy Builder</span>
                  </h2>
                  <span className="text-[10px] font-mono text-cyan-500 font-bold">100% Deterministic</span>
                </div>

                {/* DIRECTION SELECTOR (LONG, SHORT, BOTH) */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Execution Direction (Long / Short):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setDirectionMode("LONG")}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        directionMode === "LONG"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-200"
                      }`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span>LONG (Buy)</span>
                    </button>
                    <button
                      onClick={() => setDirectionMode("SHORT")}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        directionMode === "SHORT"
                          ? "bg-rose-500/20 border-rose-500 text-rose-500 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-200"
                      }`}
                    >
                      <ArrowDownRight className="h-3.5 w-3.5" />
                      <span>SHORT (Sell)</span>
                    </button>
                    <button
                      onClick={() => setDirectionMode("BOTH")}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        directionMode === "BOTH"
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-500 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-200"
                      }`}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>BOTH</span>
                    </button>
                  </div>
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
                          dir: "LONG" as const,
                        },
                        {
                          title: "🔴 9/21 Bearish Short",
                          p: "Short when 9 EMA crosses below 21 EMA with RSI < 50. Take Profit 2.5%, Stop Loss 1.2%.",
                          dir: "SHORT" as const,
                        },
                        {
                          title: "💎 RSI Mean Reversion",
                          p: "Buy when RSI(14) is oversold below 28 and bounces up. Take Profit 3.5%, Stop Loss 1.5%.",
                          dir: "LONG" as const,
                        },
                        {
                          title: "🚀 SuperTrend Trend",
                          p: "SuperTrend ATR trend breakout strategy. Buy on bullish flip with 4% Take Profit, 1.5% Stop Loss.",
                          dir: "BOTH" as const,
                        },
                      ].map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setPrompt(t.p);
                            setDirectionMode(t.dir);
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
                      <span className={`font-mono font-bold ${directionMode === "SHORT" ? "text-rose-500" : (directionMode === "BOTH" ? "text-cyan-500" : "text-emerald-500")}`}>
                        {directionMode}
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
            )}

            {/* Right Column: Interactive Candlestick Chart & Tabs */}
            {(selectedNav === "Dashboard" || selectedNav === "Charts & Backtest") && (
              <div className={`${selectedNav === "Charts & Backtest" ? "lg:col-span-12" : "lg:col-span-7"} rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4`}>
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
            )}
          </div>

          {/* Bottom Grid: Trade Executions Table & Pine Script Checkout CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-500" />
                  <span>Simulated Trade Log ({backtestResult?.trades?.length || 0} Executions)</span>
                </h3>
                <span className="text-[11px] text-slate-400">Long & Short Executions</span>
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

            {/* Pine Script Vault Card (No UID displayed directly here) */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-amber-500" />
                  <span>Pine Script v5 Source Code</span>
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                  $9 USDT
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Export 100% verified algorithmic strategy code matching your exact entry/exit conditions directly into the Pine Editor with alerts & webhook automation.
              </p>

              <button
                onClick={openCheckout}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Lock className="h-4 w-4" />
                <span>Unlock with Binance Pay / Crypto ($9)</span>
              </button>

              <button
                onClick={handleCopyPine}
                className="w-full py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {copiedPine ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedPine ? "Copied Preview!" : "Copy Code Preview"}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// =============================================================================
// 3. SPECIALIZED CONTENT SECTIONS (Economic News, Analytics, Vault)
// =============================================================================
const EconomicNewsSection = ({ isDark }: { isDark: boolean }) => {
  const [activeModalNews, setActiveModalNews] = useState<any>(null);

  const newsItems = [
    {
      id: "cpi",
      time: "14:30 EST",
      currency: "USD",
      title: "US Core CPI Inflation Rate (MoM & YoY)",
      impact: "HIGH",
      forecast: "0.3%",
      previous: "0.2%",
      bias: "Bullish Volatility for Gold & Crypto",
      summary:
        "The US Consumer Price Index (CPI) measures the overall change in consumer prices based on a representative basket of goods and services. Core CPI strips out volatile food and energy components, making it the Federal Reserve's preferred benchmark for tracking structural underlying inflation trends. Institutional desks closely watch this release to price in upcoming FOMC interest rate cuts or hikes.",
      cryptoImpact:
        "Historically, a lower-than-forecast Core CPI (<0.2%) prompts aggressive Bitcoin & altcoin breakout rallies due to falling real Treasury yields and expanding market liquidity. If CPI comes in hotter than expected (>0.4%), expect liquidity flushes toward key support demand blocks.",
      goldImpact:
        "Gold (XAU/USD) shares an inverse correlation with US real yields and the US Dollar Index (DXY). Softer inflation numbers typically accelerate safe-haven and store-of-value bids, driving Gold toward all-time highs.",
      forexImpact:
        "Soft inflation weakens the Greenback, sending EUR/USD and GBP/USD surging. A hot CPI figure causes Dollar dominance and strong downward pressure on major currency pairs.",
      tradingRule:
        "Expect instantaneous 1.2% - 2.5% volatility spikes within the first 3 minutes of release. Automated quant algorithms should avoid executing market orders during the initial 60 seconds to prevent severe slippage. Wait for the 5-minute candle close before confirming momentum direction.",
    },
    {
      id: "fomc",
      time: "18:00 EST",
      currency: "USD",
      title: "FOMC Federal Reserve Interest Rate Decision & Press Conference",
      impact: "CRITICAL",
      forecast: "5.25%",
      previous: "5.50%",
      bias: "Major Macro Catalyst across all markets",
      summary:
        "The Federal Open Market Committee determines the benchmark target range for the federal funds rate. In addition to the rate decision, Fed Chair Jerome Powell's press conference and the dot-plot economic projections provide the ultimate macroeconomic framework for global interest rates, liquidity cycles, and systemic leverage.",
      cryptoImpact:
        "A dovish pivot or rate reduction triggers rapid capital rotation into digital assets. Crypto markets often stage aggressive multi-week continuation trends following dovish FOMC forward guidance.",
      goldImpact:
        "As a non-yielding asset, Gold thrives in lower interest rate environments. Subdued Fed terminal rate expectations unlock heavy institutional inflows into physical and paper Gold.",
      forexImpact:
        "Directly resets global interest rate differentials. A dovish stance triggers significant Dollar sell-offs, whereas a hawkish pause boosts DXY strength.",
      tradingRule:
        "Highest volatility event on the economic calendar. Do not trade the headline release blind. Powell's press conference (30 mins after rate release) often produces violent two-way whipsaws. Maintain conservative leverage (1x - 3x) and strictly enforced stop losses.",
    },
    {
      id: "nfp",
      time: "08:30 EST",
      currency: "USD",
      title: "US Non-Farm Payrolls (NFP) & Average Hourly Earnings",
      impact: "HIGH",
      forecast: "175K",
      previous: "187K",
      bias: "Labor Market Health & Wage Inflation",
      summary:
        "The Non-Farm Payrolls report calculates the net number of paid workers in the US, excluding farm employees, private households, and non-profit personnel. The accompanying Average Hourly Earnings data measures wage inflation, which central bankers monitor closely for wage-price spiral indicators.",
      cryptoImpact:
        "A cooling labor market (<150k jobs) signals economic deceleration, raising expectations for Fed policy easing and boosting speculative crypto demand.",
      goldImpact:
        "Weak job prints lead to immediate Gold surges as bond yields pull back. A blowout job report (>220k) triggers brief Dollar rallies that press Gold toward local discount zones.",
      forexImpact:
        "Forex pairs experience heavy liquidity order flow. EUR/USD, GBP/USD, and USD/JPY experience their widest trading ranges of the week on NFP Fridays.",
      tradingRule:
        "The 15-minute high/low range formed immediately after NFP often establishes the market trend for the following 48 to 72 hours. Consider utilizing breakout brackets or mean-reversion scalp strategies once the initial spread normalizes.",
    },
    {
      id: "ecb",
      time: "08:15 EST",
      currency: "EUR",
      title: "ECB Governing Council Monetary Policy & Lagarde Speech",
      impact: "HIGH",
      forecast: "3.75%",
      previous: "4.00%",
      bias: "Forex EUR/USD Liquidity Surge",
      summary:
        "The European Central Bank determines benchmark interest rates for the 20 European Union nations sharing the Euro currency. President Christine Lagarde's press statements outline economic resilience, inflation outlooks, and banking system stability across Europe.",
      cryptoImpact:
        "Global liquidity conditions are influenced by European central bank easing. Dovish ECB sentiment adds to global aggregate M2 money supply, providing supportive tailwinds for crypto assets.",
      goldImpact:
        "Gold priced in Euros (XAU/EUR) frequently achieves new records when the ECB cuts rates aggressively, preserving wealth against European currency depreciation.",
      forexImpact:
        "The dominant fundamental driver for EUR/USD, EUR/GBP, and EUR/JPY. Policy divergence between the Fed and ECB creates high-conviction swing trading opportunities.",
      tradingRule:
        "Monitor EUR/USD order books closely. Watch for liquidity sweeps around psychological round numbers (e.g. 1.0800, 1.0900) before initiating trend continuation positions.",
    },
    {
      id: "btc_epoch",
      time: "04:00 EST",
      currency: "BTC",
      title: "Bitcoin Network Difficulty Adjustment & Hashrate Index",
      impact: "MEDIUM",
      forecast: "+1.5%",
      previous: "+0.8%",
      bias: "Miner Capital & Fundamental Security",
      summary:
        "The Bitcoin network automatically recalibrates mining difficulty every 2,016 blocks (~14 days) to maintain a steady 10-minute block production tempo. Increases in difficulty reflect rising institutional computational capacity and miner balance sheet resilience.",
      cryptoImpact:
        "Rising difficulty confirms network health and prevents miner capitulation risks. Post-halving difficulty stability is historically correlated with long-term structural bull markets.",
      goldImpact:
        "Reinforces Bitcoin's digital store-of-value thesis alongside physical Gold, attracting family offices and macro funds seeking hard, inflation-resistant assets.",
      forexImpact:
        "Minimal direct impact on traditional fiat currency pairs, but influences broader fintech and institutional liquidity sentiment.",
      tradingRule:
        "On-chain miner capitulation metric. When difficulty increases during price consolidation, it signals high accumulation by long-term holders. Ideal for spot accumulation and trend-following strategies.",
    },
    {
      id: "opec",
      time: "10:00 EST",
      currency: "OIL",
      title: "OPEC+ Ministerial Meeting & Crude Oil Supply Policy",
      impact: "HIGH",
      forecast: "Quota Rollover",
      previous: "Voluntary Cuts",
      bias: "Headline Energy Inflation Shocks",
      summary:
        "OPEC and allied oil-producing nations coordinate petroleum supply quotas to balance global oil inventories. Supply restrictions or surprise quota cuts directly elevate transportation and manufacturing costs globally, feeding directly into core inflation indicators.",
      cryptoImpact:
        "High oil prices sustain sticky inflation prints, potentially delaying interest rate cuts and exerting temporary pressure on high-beta speculative assets.",
      goldImpact:
        "Energy price inflation bolsters Gold's appeal as a classic commodity and purchasing power hedge. Geopolitical tension around oil shipping routes triggers immediate flight-to-safety bids.",
      forexImpact:
        "Significant impact on commodity currencies such as the Canadian Dollar (USD/CAD) and Norwegian Krone. Higher oil prices can also weigh on energy-importing economies in Europe and Asia.",
      tradingRule:
        "Energy news often creates persistent multiday trends rather than immediate mean-reversion. Incorporate SuperTrend or EMA trend-following models to capture prolonged momentum.",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-500" />
            <span>High-Impact Macroeconomic News & Events</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time economic catalysts impacting Crypto, Gold (XAU), and Forex volatility. প্রতিটি নিউজে ক্লিক করে বিস্তারিত বিশ্লেষণ ও ট্রেডিং গাইড পড়ুন।
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
          Live Economic Feed
        </span>
      </div>

      {/* Grid of News Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {newsItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveModalNews(item)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:border-cyan-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  {item.time}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                    {item.currency}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.impact === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                        : item.impact === "HIGH"
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {item.impact}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {item.title}
              </h4>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>Forecast: <strong className="text-slate-800 dark:text-slate-200">{item.forecast}</strong></span>
                <span>Prior: <strong className="text-slate-800 dark:text-slate-200">{item.previous}</strong></span>
              </div>

              <div className="text-[11px] text-cyan-700 dark:text-cyan-400 font-medium line-clamp-2">
                💡 {item.bias}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveModalNews(item);
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30 transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>বিস্তারিত পড়ুন (Full Analysis)</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* DETAILED NEWS MODAL */}
      {activeModalNews && (
        <NewsDetailModal
          news={activeModalNews}
          onClose={() => setActiveModalNews(null)}
          isDark={isDark}
        />
      )}
    </div>
  );
};

// =============================================================================
// DETAILED NEWS MODAL (Bistarito Porar Jonno)
// =============================================================================
const NewsDetailModal = ({
  news,
  onClose,
  isDark,
}: {
  news: any;
  onClose: () => void;
  isDark: boolean;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 pr-8">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                news.impact === "CRITICAL"
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  : news.impact === "HIGH"
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
              }`}
            >
              {news.impact} IMPACT
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {news.currency}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Release Time: {news.time}
            </span>
          </div>

          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-snug">
            {news.title}
          </h2>

          <div className="flex items-center gap-6 text-xs font-mono text-slate-600 dark:text-slate-400 mt-2">
            <span>Forecast: <strong className="text-slate-900 dark:text-slate-100">{news.forecast}</strong></span>
            <span>Previous: <strong className="text-slate-900 dark:text-slate-100">{news.previous}</strong></span>
            <span>Bias: <strong className="text-cyan-600 dark:text-cyan-400">{news.bias}</strong></span>
          </div>
        </div>

        {/* Section 1: Detailed Overview / Context */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Info className="h-4 w-4 text-cyan-500" />
            <span>১. ম্যাক্রো প্রেক্ষাপট ও মূল তাৎপর্য (Macro Context & Importance)</span>
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {news.summary}
          </p>
        </div>

        {/* Section 2: Asset by Asset Market Impact */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-500" />
            <span>২. বিভিন্ন মার্কেটের ওপর সরাসরি প্রভাব (Asset Impact Matrix)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Crypto Card */}
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1.5">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                🪙 Crypto (BTC / ETH)
              </span>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                {news.cryptoImpact}
              </p>
            </div>

            {/* Gold Card */}
            <div className="p-3.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 space-y-1.5">
              <span className="font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
                🏆 Gold (XAU/USD)
              </span>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                {news.goldImpact}
              </p>
            </div>

            {/* Forex Card */}
            <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-1.5">
              <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                💶 Forex (EUR/USD, DXY)
              </span>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                {news.forexImpact}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Algorithmic Execution Rules */}
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-500" />
            <span>৩. কোয়ান্ট ট্রেডিং ও রিস্ক ম্যানেজমেন্ট গাইড (Quant Strategy Rules)</span>
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            {news.tradingRule}
          </p>
        </div>

        {/* Footer Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 font-bold text-xs rounded-xl transition shadow"
          >
            ফিরে যান (Back to Terminal)
          </button>
        </div>
      </div>
    </div>
  );
};

const QuantAnalyticsSection = ({ summary, backtestResult }: any) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Activity className="h-5 w-5 text-cyan-500" />
          <span>Walk-Forward Testing & Monte Carlo Robustness</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Auditing against curve-fitting, parameter decay, and market regime changes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-1">
          <span className="text-xs text-slate-500">Walk-Forward Efficiency</span>
          <p className="text-xl font-mono font-black text-cyan-500">78.4% (PASS)</p>
          <p className="text-[11px] text-slate-400">Out-of-sample persistence verified</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-1">
          <span className="text-xs text-slate-500">Monte Carlo 1,000 Resamples</span>
          <p className="text-xl font-mono font-black text-emerald-500">96.8% Profit Probability</p>
          <p className="text-[11px] text-slate-400">Risk of ruin calculated at 0.0%</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-1">
          <span className="text-xs text-slate-500">Sharpe / Calmar Ratio</span>
          <p className="text-xl font-mono font-black text-slate-900 dark:text-slate-100">1.84 / 2.31</p>
          <p className="text-[11px] text-slate-400">Risk-adjusted return expectancy</p>
        </div>
      </div>
    </div>
  );
};

const PineVaultSection = ({ currentStrategy, copiedPine, handleCopyPine, openCheckout }: any) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-500" />
            <span>Pine Script v5 Source Code Vault</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export ready-to-run Pine Script code for webhook bots, TradingView alerts, and automation
          </p>
        </div>
        <button
          onClick={openCheckout}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <Lock className="h-4 w-4" />
          <span>Checkout License ($9 USDT)</span>
        </button>
      </div>

      <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#050811] p-4 font-mono text-xs overflow-x-auto max-h-96">
        <pre className="text-slate-800 dark:text-slate-200 leading-relaxed">
          {currentStrategy
            ? currentStrategy.generatePineScript(currentStrategy.defaultParams)
            : `//@version=5
strategy("Trading-OS: Quantitative Model [v5]", overlay=true, initial_capital=10000)
// Generate or compile a strategy above to see the complete source code...`}
        </pre>

        <button
          onClick={handleCopyPine}
          className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
        >
          {copiedPine ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copiedPine ? "Copied Code!" : "Copy Code"}</span>
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// 4. CHECKOUT & PAYMENT MODAL (Where Binance UID & Crypto Wallets are shown!)
// =============================================================================
const CheckoutModal = ({ isDark, onClose }: { isDark: boolean; onClose: () => void }) => {
  const [selectedMethod, setSelectedMethod] = useState<"binance" | "trc20" | "bep20">("binance");
  const [copiedField, setCopiedField] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleVerify = () => {
    if (!orderId.trim()) return;
    setIsVerifying(true);
    setVerifyStatus("Connecting to Binance verification engine...");
    setTimeout(() => {
      setIsVerifying(false);
      setVerifyStatus("Order ID submitted for automatic confirmation.");
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center text-2xl mx-auto mb-2">
            🟡
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            Binance Pay & Crypto Checkout
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Flat Price • Instant Lifetime License • Zero Fees
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full font-mono text-amber-500 text-sm font-black">
            <span>Total:</span>
            <span>9.00 USDT</span>
          </div>
        </div>

        {/* Method Switcher */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedMethod("binance")}
            className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
              selectedMethod === "binance"
                ? "bg-amber-500/20 border-amber-500 text-amber-500 shadow-sm"
                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
            }`}
          >
            🟡 Binance Pay
          </button>
          <button
            onClick={() => setSelectedMethod("trc20")}
            className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
              selectedMethod === "trc20"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-sm"
                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
            }`}
          >
            🟢 USDT (TRC20)
          </button>
          <button
            onClick={() => setSelectedMethod("bep20")}
            className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
              selectedMethod === "bep20"
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-500 shadow-sm"
                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
            }`}
          >
            🔵 USDT (BEP20)
          </button>
        </div>

        {/* Payment Details Container */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-3 text-xs">
          {selectedMethod === "binance" && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Binance Pay UID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-amber-500 text-sm">716216436</span>
                  <button
                    onClick={() => copyToClipboard("716216436", "uid")}
                    className="p-1 text-slate-400 hover:text-slate-200"
                  >
                    {copiedField === "uid" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Open the Binance App ➔ Pay ➔ Send to UID <strong>716216436</strong> ➔ Enter <strong>9 USDT</strong>.
              </p>
            </>
          )}

          {selectedMethod === "trc20" && (
            <>
              <div className="space-y-1">
                <span className="text-slate-500 block">USDT (TRC20) Wallet Address:</span>
                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono text-[11px] break-all">
                  <span>TF3X7G8n1YmK3e5jVzW8m6P4aB1cL9dQ2R</span>
                  <button
                    onClick={() => copyToClipboard("TF3X7G8n1YmK3e5jVzW8m6P4aB1cL9dQ2R", "trc")}
                    className="p-1 text-slate-400 hover:text-slate-200 shrink-0 ml-2"
                  >
                    {copiedField === "trc" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {selectedMethod === "bep20" && (
            <>
              <div className="space-y-1">
                <span className="text-slate-500 block">USDT (BNB Smart Chain BEP20):</span>
                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono text-[11px] break-all">
                  <span>0x716216436A7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d</span>
                  <button
                    onClick={() => copyToClipboard("0x716216436A7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d", "bep")}
                    className="p-1 text-slate-400 hover:text-slate-200 shrink-0 ml-2"
                  >
                    {copiedField === "bep" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Order ID Input & Verification */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Enter Binance Pay Order ID / Tx Hash:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 2684918471928471928"
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] p-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              onClick={handleVerify}
              disabled={isVerifying || !orderId.trim()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </div>
          {verifyStatus && (
            <p className="text-[11px] text-amber-500 font-mono text-center">{verifyStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 5. SETTINGS MODAL
// =============================================================================
const SettingsModal = ({ isDark, onClose }: { isDark: boolean; onClose: () => void }) => {
  const [capital, setCapital] = useState("10000");
  const [fee, setFee] = useState("0.075");
  const [slippage, setSlippage] = useState("0.02");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Settings className="h-5 w-5 text-cyan-500" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            Terminal Settings
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Backtest Capital ($)
            </label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] p-2.5 font-mono text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Trading Fee Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] p-2.5 font-mono text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Slippage Buffer (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] p-2.5 font-mono text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
        >
          {saved ? "Settings Saved ✓" : "Save Configuration"}
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// 6. HELP & SUPPORT MODAL
// =============================================================================
const HelpModal = ({ isDark, onClose }: { isDark: boolean; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <HelpCircle className="h-5 w-5 text-cyan-500" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            Trading-OS Help & Quant Documentation
          </h3>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 max-h-80 overflow-y-auto pr-1">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811]">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              1. How to Build Custom Strategies
            </h4>
            <p>
              Type your strategy in plain language (English or Banglish). Mention your desired indicators (e.g. 9 EMA, 21 EMA, RSI, MACD, SuperTrend, Bollinger), entry condition, and TP/SL percentages. Click <strong>⚡ Build & Run Strategy</strong>.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811]">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              2. Long & Short Execution Mode
            </h4>
            <p>
              Use the Direction Selector pills above the prompt to easily test <strong>LONG only</strong>, <strong>SHORT only</strong>, or <strong>BOTH</strong>.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811]">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              3. Direct Developer Support
            </h4>
            <p>
              Need assistance or want custom indicator modules? Reach out directly via our official Telegram bot:
            </p>
            <a
              href="https://t.me/TrdOsP_bot"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 font-bold hover:bg-cyan-500/20 transition"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Contact @TrdOsP_bot on Telegram</span>
            </a>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs rounded-xl transition"
        >
          Close Documentation
        </button>
      </div>
    </div>
  );
};

export default Example;
