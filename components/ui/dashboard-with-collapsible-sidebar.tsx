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
  Maximize2,
  Minimize2,
  Menu,
  BrainCircuit,
  Search,
  LayoutGrid,
  Sparkles,
  User as UserIcon
} from "lucide-react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
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
// @ts-ignore
import PaymentVerifier from "@/js/paymentVerifier.js";
import { StructuredRuleInspector } from "@/components/ui/StructuredRuleInspector";

// Import v2.0 Modular Subviews
import { OverviewDashboard } from "@/src/components/overview/OverviewDashboard";
import { WatchlistsView } from "@/src/components/markets/WatchlistsView";
import { ScreenerView } from "@/src/components/markets/ScreenerView";
import { TradingPlanView } from "@/src/components/trading/TradingPlanView";
import { RiskCenterView } from "@/src/components/trading/RiskCenterView";
import { TradeJournalView } from "@/src/components/trading/TradeJournalView";
import { PortfolioView } from "@/src/components/trading/PortfolioView";
import { PerformanceAnalyticsView } from "@/src/components/analytics/PerformanceAnalyticsView";
import { AIAnalystView } from "@/src/components/intelligence/AIAnalystView";
import { SettingsView } from "@/src/components/system/SettingsView";
import { LandingPage } from "@/src/components/landing/LandingPage";
import { CommandPalette } from "@/src/components/command/CommandPalette";
import { AuthModal } from "@/src/components/auth/AuthModal";
import { PricingModal } from "@/src/components/pricing/PricingModal";
import { MarketPairSelector } from "@/src/components/markets/MarketPairSelector";
import { AuthService } from "@/src/services/auth/authService";
import { StorageAdapter } from "@/src/services/storage/storageAdapter";

export const Example = () => {
  const [isDark, setIsDark] = useState(true);
  const [selectedNav, setSelectedNav] = useState("Dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isLandingPageOpen, setIsLandingPageOpen] = useState(false);

  // Selected symbol for global sync
  const [activeSymbol, setActiveSymbol] = useState("BTCUSDT");

  // User auth state
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      return AuthService.getCurrentUser();
    } catch (e) {
      return { id: "usr_demo_trader", email: "trader@tradingos.io" };
    }
  });

  // License state (Unlocked vs Locked)
  const [isLicenseUnlocked, setIsLicenseUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem("trading_os_license_unlocked") === "true";
    } catch (e) {
      return true; // Default unlocked for full v2.0 workstation demo
    }
  });

  const handleUnlockLicense = () => {
    setIsLicenseUnlocked(true);
    try {
      localStorage.setItem("trading_os_license_unlocked", "true");
    } catch (e) {}
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(AuthService.getCurrentUser());
  };

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Sync dark class to html
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  if (isLandingPageOpen) {
    return <LandingPage onEnterApp={() => setIsLandingPageOpen(false)} />;
  }

  return (
    <div className={`flex h-[100dvh] w-full min-w-0 max-w-[100vw] overflow-hidden ${isDark ? "dark" : ""}`}>
      <div className="flex h-full w-full min-w-0 bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
        <Sidebar
          selected={selectedNav}
          setSelected={setSelectedNav}
          openSettings={() => setSelectedNav("Settings")}
          openPricing={() => setIsPricingOpen(true)}
          openAuth={() => setIsAuthOpen(true)}
          openHelp={() => setIsHelpOpen(true)}
          openLanding={() => setIsLandingPageOpen(true)}
          currentUser={currentUser}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <TradingDashboardContent
          isDark={isDark}
          setIsDark={setIsDark}
          selectedNav={selectedNav}
          setSelectedNav={setSelectedNav}
          openCheckout={() => setIsPricingOpen(true)}
          openAuth={() => setIsAuthOpen(true)}
          openPricing={() => setIsPricingOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          isLicenseUnlocked={isLicenseUnlocked}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenLanding={() => setIsLandingPageOpen(true)}
          activeSymbol={activeSymbol}
          setActiveSymbol={setActiveSymbol}
        />

        {/* Global Command Palette (⌘K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSelectNav={(nav) => setSelectedNav(nav)}
          onSelectSymbol={(sym) => {
            setActiveSymbol(sym);
            setSelectedNav("Charts & Backtest");
          }}
        />

        {/* Authentication Modal (Google OAuth & Email) */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={(user) => setCurrentUser(user)}
        />

        {/* Pricing & Paid Subscription Modal (Binance Pay & Crypto Checkout) */}
        <PricingModal
          isOpen={isPricingOpen}
          onClose={() => setIsPricingOpen(false)}
          onSuccessUpgrade={(tier) => handleUnlockLicense()}
        />

        {/* Help & Documentation Modal */}
        {isHelpOpen && (
          <HelpModal isDark={isDark} onClose={() => setIsHelpOpen(false)} />
        )}
      </div>
    </div>
  );
};

// =============================================================================
// 1. COLLAPSIBLE SIDEBAR COMPONENT
// =============================================================================
const Sidebar = ({
  selected,
  setSelected,
  openSettings,
  openPricing,
  openAuth,
  openHelp,
  openLanding,
  currentUser,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  selected: string;
  setSelected: (val: string) => void;
  openSettings: () => void;
  openPricing: () => void;
  openAuth: () => void;
  openHelp: () => void;
  openLanding: () => void;
  currentUser: any;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
}) => {
  const [open, setOpen] = useState(true);

  const navSections = [
    {
      group: "OVERVIEW",
      items: [
        { title: "Dashboard", icon: Home },
        { title: "Pricing & Plans ($9)", icon: Sparkles },
      ]
    },
    {
      group: "MARKETS",
      items: [
        { title: "Watchlists", icon: Activity },
        { title: "Screener", icon: Sliders },
        { title: "Charts & Backtest", icon: TrendingUp },
        { title: "Economic Calendar", icon: Calendar },
      ]
    },
    {
      group: "TRADING",
      items: [
        { title: "Trading Plan", icon: ShieldCheck },
        { title: "Strategy Lab", icon: Zap },
        { title: "Risk Center", icon: Sliders },
        { title: "Trade Journal", icon: DollarSign },
        { title: "Portfolio", icon: Package },
      ]
    },
    {
      group: "ANALYTICS & AI",
      items: [
        { title: "Performance Analytics", icon: BarChart3 },
        { title: "AI Analyst", icon: BrainCircuit },
        { title: "Pine Script Vault", icon: Package },
      ]
    },
    {
      group: "SYSTEM",
      items: [
        { title: "Settings", icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          open ? "w-64" : "w-18"
        } ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between px-3.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-xs shadow-md">
              OS
            </div>
            {open && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100">
                  TRADING OS
                </span>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 -mt-0.5 font-bold">
                  v2.0 TERMINAL
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsMobileMenuOpen(false);
              } else {
                setOpen(!open);
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <ChevronsRight className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-4">
          {navSections.map((sec, sIdx) => (
            <div key={sec.group} className="space-y-1">
              {open && (
                <span className="px-2.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase font-mono block">
                  {sec.group}
                </span>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isSelected = selected === item.title;
                return (
                  <button
                    key={item.title}
                    onClick={() => {
                      if (item.title === "Pricing & Plans ($9)") {
                        openPricing();
                        setIsMobileMenuOpen(false);
                        return;
                      }
                      setSelected(item.title);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer group ${
                      isSelected
                        ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold shadow-xs border border-cyan-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-cyan-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"}`} />
                    {open && <span className="truncate">{item.title}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          {currentUser && currentUser.email && currentUser.id !== "usr_demo_trader" ? (
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                  {currentUser.email.charAt(0).toUpperCase()}
                </div>
                {open && (
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px] truncate">
                      {currentUser.fullName || currentUser.email.split("@")[0]}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400 font-bold">PRO SUBSCRIBER</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={openAuth}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition cursor-pointer mb-1 shadow-xs"
            >
              <UserIcon className="h-4 w-4 shrink-0" />
              {open && <span>Sign In / Register</span>}
            </button>
          )}

          <button
            onClick={openLanding}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Globe className="h-4 w-4 shrink-0 text-cyan-500" />
            {open && <span>Public Landing Page</span>}
          </button>
          <button
            onClick={openHelp}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <HelpCircle className="h-4 w-4 shrink-0 text-slate-400" />
            {open && <span>Help & Docs</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

// =============================================================================
// 2. MAIN DASHBOARD CONTENT AREA
// =============================================================================
const TradingDashboardContent = ({
  isDark,
  setIsDark,
  selectedNav,
  setSelectedNav,
  openCheckout,
  openAuth,
  openPricing,
  currentUser,
  onLogout,
  isLicenseUnlocked,
  setIsMobileMenuOpen,
  onOpenCommandPalette,
  onOpenLanding,
  activeSymbol,
  setActiveSymbol
}: {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  selectedNav: string;
  setSelectedNav: (val: string) => void;
  openCheckout: () => void;
  openAuth: () => void;
  openPricing: () => void;
  currentUser: any;
  onLogout: () => void;
  isLicenseUnlocked: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  onOpenCommandPalette: () => void;
  onOpenLanding: () => void;
  activeSymbol: string;
  setActiveSymbol: (val: string) => void;
}) => {
  const [timeframe, setTimeframe] = useState("15m");
  const [prompt, setPrompt] = useState("");
  const [directionMode, setDirectionMode] = useState<"LONG" | "SHORT" | "BOTH">("LONG");

  // Strategy & Backtest state
  const [currentStrategy, setCurrentStrategy] = useState<any>(null);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [isAmbiguousError, setIsAmbiguousError] = useState<boolean>(false);
  const [backtestResult, setBacktestResult] = useState<any>(null);
  const [candles, setCandles] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedPine, setCopiedPine] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<"candles" | "equity">("candles");
  const [isChartFullscreen, setIsChartFullscreen] = useState(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);

  // Load live market candles on symbol or timeframe switch
  useEffect(() => {
    const loadMarketData = async () => {
      try {
        const res = await MarketAPI.fetchKlines(activeSymbol, timeframe, 500);
        setCandles(res.data);
      } catch (e) {
        console.error("[Trading-OS] Failed to load market candles:", e);
      }
    };
    loadMarketData();
  }, [activeSymbol, timeframe]);

  // Render Lightweight Chart
  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const container = chartContainerRef.current;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const defaultHeight = isMobile ? 380 : 540;
    const initialHeight = isChartFullscreen ? Math.max(window.innerHeight - 140, 340) : defaultHeight;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: initialHeight,
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
        downColor: "#f43f5e",
        borderVisible: false,
        wickUpColor: "#10b981",
        wickDownColor: "#f43f5e",
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

      // Add Trade Markers if backtest completed
      if (backtestResult?.chartMarkers && backtestResult.chartMarkers.length > 0) {
        try {
          if (typeof (candlestickSeries as any).setMarkers === "function") {
            (candlestickSeries as any).setMarkers(backtestResult.chartMarkers);
          }
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
          backtestResult.equityCurve.map((eq: any) => ({
            time: eq.time,
            value: eq.equity,
          }))
        );
      }
    }

    chartInstanceRef.current = chart;

    const handleResize = () => {
      if (chartInstanceRef.current && chartContainerRef.current) {
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
  }, [candles, backtestResult, activeChartTab, isDark, isChartFullscreen, selectedNav]);

  const handleCompileAndRun = async () => {
    const raw = prompt.trim();
    if (!raw) return;

    setIsSimulating(true);
    setCompilationError(null);
    setIsAmbiguousError(false);
    setBacktestResult(null);

    try {
      const compiled = await GeminiEngine.compileStrategy(raw, directionMode);

      if (!compiled || !compiled.success) {
        setIsAmbiguousError(true);
        setCompilationError(
          compiled?.error || "Could not parse clear trading rules. Please specify your indicators and exact entry conditions."
        );
        setCurrentStrategy(null);
        return;
      }

      setCurrentStrategy(compiled.strategy);

      // Run backtest simulation
      const result = await BacktestEngine.runBacktest({
        strategy: compiled.strategy,
        candles,
        initialCapital: 10000,
        feeRate: 0.075,
        slippageRate: 0.02,
        directionMode,
      });

      setBacktestResult(result);
    } catch (err: any) {
      setIsAmbiguousError(true);
      setCompilationError(err.message || "Failed to compile strategy. Please refine your prompt.");
      setCurrentStrategy(null);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopyPine = () => {
    if (!currentStrategy) return;
    const pineCode = currentStrategy.generatePineScript(currentStrategy.defaultParams);
    navigator.clipboard.writeText(pineCode);
    setCopiedPine(true);
    setTimeout(() => setCopiedPine(false), 2000);
  };

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 dark:bg-[#050811] overflow-hidden">
      {/* Top Application Bar */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090e1a] px-3 sm:px-4 flex items-center justify-between shrink-0 gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Interactive Multi-Asset Market Pair Selector */}
          <MarketPairSelector
            activeSymbol={activeSymbol}
            onSelectSymbol={(sym) => {
              setActiveSymbol(sym);
              setSelectedNav("Charts & Backtest");
            }}
          />

          {/* Quick Search Button / Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:border-cyan-500/40 transition cursor-pointer w-56 justify-between"
          >
            <div className="flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-cyan-500" />
              <span>Search tools, assets...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-500">⌘K</kbd>
          </button>
        </div>

        {/* Right Header Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Upgrade to Pro ($9) Button */}
          <button
            onClick={openPricing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 hover:border-amber-500/60 font-bold text-xs transition cursor-pointer shadow-xs"
          >
            <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="hidden sm:inline">Upgrade Pro ($9)</span>
            <span className="sm:hidden">Pro $9</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* User Auth / Account Dropdown */}
          {currentUser && currentUser.email && currentUser.id !== "usr_demo_trader" ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  {currentUser.email.charAt(0).toUpperCase()}
                </div>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate hidden md:inline">
                  {currentUser.email.split("@")[0]}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  PRO
                </span>
              </div>
              <button
                onClick={onLogout}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer hidden sm:inline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={openAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Sign In / Create Account</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Router Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {selectedNav === "Dashboard" && (
          <OverviewDashboard
            onNavigate={(nav) => setSelectedNav(nav)}
            onSelectSymbol={(sym) => {
              setActiveSymbol(sym);
              setSelectedNav("Charts & Backtest");
            }}
          />
        )}

        {selectedNav === "Watchlists" && (
          <WatchlistsView
            onSelectSymbol={(sym) => setActiveSymbol(sym)}
            onOpenChart={(sym) => {
              setActiveSymbol(sym);
              setSelectedNav("Charts & Backtest");
            }}
          />
        )}

        {selectedNav === "Screener" && (
          <ScreenerView
            onSelectSymbol={(sym) => setActiveSymbol(sym)}
            onOpenChart={(sym) => {
              setActiveSymbol(sym);
              setSelectedNav("Charts & Backtest");
            }}
          />
        )}

        {selectedNav === "Trading Plan" && <TradingPlanView />}

        {selectedNav === "Risk Center" && <RiskCenterView />}

        {selectedNav === "Trade Journal" && <TradeJournalView />}

        {selectedNav === "Portfolio" && <PortfolioView />}

        {selectedNav === "Performance Analytics" && <PerformanceAnalyticsView />}

        {selectedNav === "AI Analyst" && <AIAnalystView />}

        {selectedNav === "Settings" && <SettingsView />}

        {selectedNav === "Economic Calendar" && (
          <EconomicNewsSection isDark={isDark} />
        )}

        {selectedNav === "Pine Script Vault" && (
          <PineVaultSection
            currentStrategy={currentStrategy}
            copiedPine={copiedPine}
            handleCopyPine={handleCopyPine}
            openCheckout={openCheckout}
            isLicenseUnlocked={isLicenseUnlocked}
          />
        )}

        {/* Charts & Backtest / Strategy Lab View */}
        {(selectedNav === "Charts & Backtest" || selectedNav === "Strategy Lab") && (
          <div className="space-y-6">
            {/* Strategy Builder Prompt Box */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-500" />
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Generic Natural-Language Strategy Compiler
                  </h2>
                </div>

                {/* Direction Selector */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  {(["LONG", "SHORT", "BOTH"] as const).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => setDirectionMode(dir)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        directionMode === dir
                          ? "bg-cyan-500 text-slate-950 shadow-sm"
                          : "text-slate-500 hover:text-slate-200"
                      }`}
                    >
                      {dir === "LONG" ? "🟢 LONG" : dir === "SHORT" ? "🔴 SHORT" : "🔄 BOTH"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={2}
                  placeholder='e.g. "Buy when previous 2 candles are bullish and current candle is bearish. Stop loss 1.5%, take profit 3.0%"'
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-cyan-500"
                />

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">Timeframe:</span>
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                    >
                      <option value="1m">1 Minute</option>
                      <option value="5m">5 Minutes</option>
                      <option value="15m">15 Minutes</option>
                      <option value="1h">1 Hour</option>
                      <option value="4h">4 Hours</option>
                      <option value="1d">1 Day</option>
                    </select>
                  </div>

                  <button
                    onClick={handleCompileAndRun}
                    disabled={isSimulating || !prompt.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Play className={`h-4 w-4 ${isSimulating ? "animate-spin" : ""}`} />
                    <span>{isSimulating ? "Compiling AST & Simulating..." : "⚡ Build & Run Strategy"}</span>
                  </button>
                </div>
              </div>

              {/* Compilation Error Feedback */}
              {compilationError && (
                <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-mono space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{isAmbiguousError ? "Strategy Ambiguity / Parsing Notice" : "Compilation Error"}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{compilationError}</p>
                </div>
              )}
            </div>

            {/* Rule Inspector AST Visualizer */}
            {currentStrategy && currentStrategy.ast && (
              <StructuredRuleInspector ast={currentStrategy.ast} />
            )}

            {/* Interactive Chart Container */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-500" />
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {activeSymbol} • {timeframe} Quantitative Chart
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-mono">
                    <button
                      onClick={() => setActiveChartTab("candles")}
                      className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                        activeChartTab === "candles" ? "bg-cyan-500 text-slate-950" : "text-slate-400"
                      }`}
                    >
                      Candlesticks
                    </button>
                    <button
                      onClick={() => setActiveChartTab("equity")}
                      className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                        activeChartTab === "equity" ? "bg-cyan-500 text-slate-950" : "text-slate-400"
                      }`}
                    >
                      Equity Curve
                    </button>
                  </div>

                  <button
                    onClick={() => setIsChartFullscreen(!isChartFullscreen)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {isChartFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div ref={chartContainerRef} className="w-full min-h-[380px] rounded-xl overflow-hidden" />
            </div>

            {/* Backtest Results KPI Banner */}
            {backtestResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090e1a] space-y-1">
                  <span className="text-slate-400 font-sans">Simulated Net Profit</span>
                  <p className="text-xl font-bold text-emerald-500">
                    +${backtestResult.netProfit?.toFixed(2) || "0.00"} ({backtestResult.netProfitPct?.toFixed(2) || "0.0"}%)
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090e1a] space-y-1">
                  <span className="text-slate-400 font-sans">Win Rate</span>
                  <p className="text-xl font-bold text-cyan-500">{backtestResult.winRate?.toFixed(1) || "0.0"}%</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090e1a] space-y-1">
                  <span className="text-slate-400 font-sans">Profit Factor</span>
                  <p className="text-xl font-bold text-purple-400">{backtestResult.profitFactor?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090e1a] space-y-1">
                  <span className="text-slate-400 font-sans">Max Drawdown</span>
                  <p className="text-xl font-bold text-rose-500">{backtestResult.maxDrawdownPct?.toFixed(2) || "0.0"}%</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

// =============================================================================
// 3. ECONOMIC NEWS SECTION (Preserved & Enhanced)
// =============================================================================
const EconomicNewsSection = ({ isDark }: { isDark: boolean }) => {
  const [activeModalNews, setActiveModalNews] = useState<any>(null);

  const newsItems = [
    {
      id: "cpi",
      time: "08:30 EST",
      currency: "USD",
      title: "US Core CPI Inflation Rate (MoM & YoY)",
      impact: "HIGH",
      forecast: "0.3%",
      previous: "0.2%",
      bias: "Bullish Volatility for Gold & Crypto",
      summary:
        "The Consumer Price Index (CPI) measures changes in the price level of a weighted average market basket of consumer goods and services. Core CPI strips away volatile food and energy costs to reveal underlying structural inflation.",
      cryptoImpact:
        "Lower than expected CPI (<0.2%) triggers massive breakout rallies in Bitcoin and high-beta altcoins due to rising rate-cut probabilities.",
      goldImpact:
        "Gold (XAU/USD) rallies sharply when real yields fall post soft-CPI prints, making non-yielding assets attractive.",
      forexImpact:
        "Strong CPI spikes the US Dollar (DXY), depressing EUR/USD and GBP/USD. Weak CPI weakens USD immediately.",
      tradingRule:
        "Do not enter before the first 3-minute candle close. Wait for the initial liquidity sweep to complete before executing breakout trend entries.",
    },
    {
      id: "fomc",
      time: "14:00 EST",
      currency: "USD",
      title: "FOMC Federal Funds Rate & Jerome Powell Press Conference",
      impact: "CRITICAL",
      forecast: "5.25%",
      previous: "5.50%",
      bias: "Macro Catalyst across all global assets",
      summary:
        "The Federal Open Market Committee determines US benchmark interest rates. Chair Jerome Powell's press conference details economic forecasts and policy tightening or easing trajectories.",
      cryptoImpact:
        "A dovish rate cut or easing path unlocks systemic liquidity rotation into digital assets.",
      goldImpact:
        "Gold achieves historical records during dovish rate pivots as capital flees fiat debasement.",
      forexImpact:
        "Resets interest rate parity. Dovish tone weakens USD across all major pairs.",
      tradingRule:
        "Maintain conservative 1x-3x leverage and pre-define strict stops. Avoid trading the headline tick blind.",
    }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-500" />
            <span>High-Impact Macroeconomic News & Events</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time economic catalysts impacting Crypto, Gold (XAU), and Forex volatility.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
          Live Feed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {newsItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveModalNews(item)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:border-cyan-500/50 transition cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-400">{item.time}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">
                {item.impact} IMPACT
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition-colors">
              {item.title}
            </h4>
            <div className="flex items-center gap-4 text-slate-400 font-mono">
              <span>Forecast: {item.forecast}</span>
              <span>Previous: {item.previous}</span>
            </div>
          </div>
        ))}
      </div>

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

const NewsDetailModal = ({ news, onClose, isDark }: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 text-xs">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100">{news.title}</h2>
          <span className="text-cyan-500 font-mono text-[11px]">{news.bias}</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-1">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">Summary:</span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{news.summary}</p>
        </div>

        <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-1">
          <span className="font-bold text-cyan-600 dark:text-cyan-400 block">Quantitative Trading Rule:</span>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{news.tradingRule}</p>
        </div>
      </div>
    </div>
  );
};

const PineVaultSection = ({
  currentStrategy,
  copiedPine,
  handleCopyPine,
  openCheckout,
  isLicenseUnlocked,
}: any) => {
  const sampleCode = `//@version=5\nstrategy("Trading-OS Model", overlay=true)\n// Pine Script v5 Algorithm\n`;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-6 shadow-sm space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Package className="h-5 w-5 text-amber-500" />
          <span>Pine Script v5 Source Code Studio</span>
        </h2>
        <button
          onClick={handleCopyPine}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          {copiedPine ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copiedPine ? "Copied!" : "Copy Pine Script"}</span>
        </button>
      </div>

      <pre className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#050811] font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto max-h-96">
        {currentStrategy ? currentStrategy.generatePineScript(currentStrategy.defaultParams) : sampleCode}
      </pre>
    </div>
  );
};

const CheckoutModal = ({ isDark, onClose, onUnlock }: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-center text-xs">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
          <X className="h-5 w-5" />
        </button>
        <div className="text-2xl">🟡</div>
        <h3 className="text-base font-black text-slate-900 dark:text-slate-100">Unlock Pro License</h3>
        <p className="text-slate-400">Lifetime access to all AST compilation, AI Copilot, and Risk Center features.</p>
        <button
          onClick={() => {
            onUnlock();
            onClose();
          }}
          className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow cursor-pointer"
        >
          Activate Instant Access
        </button>
      </div>
    </div>
  );
};

const HelpModal = ({ isDark, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-xs font-sans">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
          <X className="h-5 w-5" />
        </button>
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Trading-OS Documentation</h3>
        </div>
        <div className="space-y-2 text-slate-600 dark:text-slate-300">
          <p><strong>1. Strategy Compiler:</strong> Input natural language conditions with negative offsets (e.g. t-1, t-0) to compile ASTs.</p>
          <p><strong>2. Risk Center:</strong> Calculate exact position sizing using account equity and distance to stop loss.</p>
          <p><strong>3. Trade Journal:</strong> Record trades and let the Rule Violation Engine audit compliance against your Trading Plan.</p>
          <p><strong>4. AI Analyst:</strong> Ask questions about session win rates, drawdown, and execution psychology.</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold rounded-xl cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Example;
