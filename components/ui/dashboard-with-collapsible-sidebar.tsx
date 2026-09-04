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
  ArrowRight,
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
import { ApiClient } from "@/src/services/api/apiClient";
import { StorageAdapter } from "@/src/services/storage/storageAdapter";
import { NewsService } from "@/src/services/market/newsService";

export const Example = () => {
  const [isDark, setIsDark] = useState(true);
  const [selectedNav, setSelectedNav] = useState(() => {
    try {
      return localStorage.getItem("trading_os_active_tab") || "Dashboard";
    } catch (e) {
      return "Dashboard";
    }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isLandingPageOpen, setIsLandingPageOpen] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("auth_token") || urlParams.get("app") === "true" || window.location.hash === "#app") {
          return false;
        }
      }
      return true; // Default: show Landing Page first on root visit
    } catch (e) {
      return true;
    }
  });

  const handleSelectNav = (tab: string) => {
    setSelectedNav(tab);
    try {
      localStorage.setItem("trading_os_active_tab", tab);
    } catch (e) {}
  };

  // Selected symbol for global sync
  const [activeSymbol, setActiveSymbol] = useState("BTCUSDT");

  // User auth state (default null for guests)
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      return AuthService.getCurrentUser();
    } catch (e) {
      return null;
    }
  });

  // Handle Google OAuth Callback in URL (?auth_token=... or ?error=...)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get("auth_token");
    const authError = urlParams.get("error");

    if (authToken) {
      try {
        ApiClient.setToken(authToken);
        const parts = authToken.split(".");
        if (parts.length === 3) {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const payload = JSON.parse(jsonPayload);
          const isSuper =
            payload.email?.toLowerCase().includes("seamafridi") ||
            payload.email?.toLowerCase().includes("khalid") ||
            payload.role === "SUPER_ADMIN";
          const defaultAdminName = payload.email?.toLowerCase().includes("khalid")
            ? "Khalid Abdullah (Super Admin)"
            : "Seam Afridi (Super Admin)";
          const userObj = {
            id: payload.id,
            email: payload.email,
            role: payload.role || (isSuper ? "SUPER_ADMIN" : "USER"),
            fullName: payload.fullName || (isSuper ? defaultAdminName : payload.email.split("@")[0]),
            avatarUrl: payload.avatarUrl
          };
          StorageAdapter.saveUser(userObj as any);
          StorageAdapter.setCurrentUserId(userObj.id);
          setCurrentUser(userObj);
        }
      } catch (err) {
        console.error("[Trading-OS] Failed to process OAuth token:", err);
      } finally {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (authError) {
      console.warn("[Trading-OS] OAuth error reported:", authError);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Real-time listener for profile updates (photo upload / name change)
  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      const updatedProfile = e.detail;
      if (updatedProfile) {
        setCurrentUser((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            fullName: updatedProfile.fullName || prev.fullName,
            avatarUrl: updatedProfile.avatarUrl !== undefined ? updatedProfile.avatarUrl : prev.avatarUrl
          };
        });
      }
    };
    window.addEventListener("trading_os_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("trading_os_profile_updated", handleProfileUpdate);
  }, []);

  // Helper to check if current user is Super Admin
  const isSuperAdminUser = Boolean(
    currentUser &&
      (currentUser.email?.toLowerCase().includes("seamafridi") ||
        currentUser.email?.toLowerCase().includes("khalid") ||
        currentUser.role === "SUPER_ADMIN" ||
        currentUser.fullName?.toLowerCase().includes("super admin"))
  );

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
    ApiClient.clearToken();
    AuthService.logout();
    setCurrentUser(null);
  };

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "register">("register");
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const openRegister = () => {
    setAuthInitialMode("register");
    setIsAuthOpen(true);
  };

  const openLogin = () => {
    setAuthInitialMode("login");
    setIsAuthOpen(true);
  };

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
          setSelected={handleSelectNav}
          openSettings={() => handleSelectNav("Settings")}
          openPricing={() => setIsPricingOpen(true)}
          openAuth={openRegister}
          openHelp={() => setIsHelpOpen(true)}
          openLanding={() => setIsLandingPageOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <TradingDashboardContent
          isDark={isDark}
          setIsDark={setIsDark}
          selectedNav={selectedNav}
          setSelectedNav={handleSelectNav}
          openCheckout={() => setIsPricingOpen(true)}
          openAuth={openRegister}
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
          onSelectNav={(nav) => handleSelectNav(nav)}
          onSelectSymbol={(sym) => {
            setActiveSymbol(sym);
            handleSelectNav("Charts & Backtest");
          }}
        />

        {/* Authentication Modal (Google OAuth & Email) */}
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authInitialMode}
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
  onLogout,
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
  onLogout: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
}) => {
  const [open, setOpen] = useState(true);
  const isSuperAdmin = Boolean(
    currentUser &&
      (currentUser.email?.toLowerCase().includes("seamafridi") ||
        currentUser.email?.toLowerCase().includes("khalid") ||
        currentUser.role === "SUPER_ADMIN" ||
        currentUser.fullName?.toLowerCase().includes("super admin"))
  );

  const navSections = [
    {
      group: "OVERVIEW",
      items: [
        { title: "Landing Page / Home", icon: Globe },
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
                  v2.01 TERMINAL
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
                      if (item.title === "Landing Page / Home") {
                        openLanding();
                        setIsMobileMenuOpen(false);
                        return;
                      }
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
          {currentUser && currentUser.email ? (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 mb-1 space-y-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden border border-cyan-500/30 shrink-0">
                  {currentUser.avatarUrl || StorageAdapter.getProfile(currentUser.id)?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl || StorageAdapter.getProfile(currentUser.id)?.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{currentUser.email.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                {open && (
                  <div className="flex flex-col truncate flex-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                      {currentUser.fullName || currentUser.email.split("@")[0]}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-amber-400">
                      {isSuperAdmin ? "👑 SUPER ADMIN" : "PRO SUBSCRIBER"}
                    </span>
                  </div>
                )}
              </div>
              {open && (
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg text-[11px] font-bold transition cursor-pointer text-center"
                >
                  Sign Out / Switch Account
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                openAuth();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition cursor-pointer mb-1 shadow-xs"
            >
              <UserIcon className="h-4 w-4 shrink-0" />
              {open && <span>Sign In / Create Account</span>}
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
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  const isSuperAdmin = Boolean(
    currentUser &&
      (currentUser.email?.toLowerCase().includes("seamafridi") ||
        currentUser.email?.toLowerCase().includes("khalid") ||
        currentUser.role === "SUPER_ADMIN" ||
        currentUser.fullName?.toLowerCase().includes("super admin"))
  );

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
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090e1a] px-3 sm:px-4 flex items-center justify-between shrink-0 gap-2 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Open Navigation Menu"
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

          {/* Quick Search Button / Command Palette Trigger (Desktop only) */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:border-cyan-500/40 transition cursor-pointer w-52 xl:w-64 justify-between"
          >
            <div className="flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-cyan-500" />
              <span className="truncate">Search pairs, tools...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-500">⌘K</kbd>
          </button>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Data Badge - Desktop only */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-500 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping"></span>
            <span>LIVE DATA</span>
          </div>

          {/* Upgrade to Pro ($9) Button - Desktop/Tablet only */}
          <button
            onClick={openPricing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 hover:border-amber-500/60 font-bold text-xs transition cursor-pointer shadow-xs"
          >
            <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>Upgrade Pro ($9)</span>
          </button>

          {/* Theme Toggle - Desktop only */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* User Auth: Guest vs Logged In */}
          {currentUser && currentUser.email ? (
            <>
              {/* Desktop User Profile Box */}
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-[11px] flex items-center justify-center overflow-hidden border border-cyan-500/30 shrink-0">
                    {currentUser.avatarUrl || StorageAdapter.getProfile(currentUser.id)?.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl || StorageAdapter.getProfile(currentUser.id)?.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{currentUser.email.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[110px] truncate leading-tight">
                      {currentUser.fullName || currentUser.email.split("@")[0]}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold leading-none ${
                        isSuperAdmin ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {isSuperAdmin ? "👑 SUPER ADMIN" : "PRO TRADER"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition cursor-pointer font-medium"
                  title="Sign Out / Switch Account"
                >
                  Sign Out
                </button>
              </div>

              {/* Mobile User Avatar Pill (Opens Mobile Profile Sheet) */}
              <button
                onClick={() => setIsMobileProfileOpen(true)}
                className="md:hidden flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 cursor-pointer"
                aria-label="User profile menu"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden border border-cyan-500/40 shrink-0">
                  {currentUser.avatarUrl || StorageAdapter.getProfile(currentUser.id)?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl || StorageAdapter.getProfile(currentUser.id)?.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{currentUser.email.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                {isSuperAdmin ? (
                  <span className="text-xs pr-1">👑</span>
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 pr-0.5" />
                )}
              </button>
            </>
          ) : (
            /* Guest User: Clean Sign In button */
            <button
              onClick={openAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <UserIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile User Profile Modal Sheet */}
      {isMobileProfileOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileProfileOpen(false)}
          />
          <div className="relative w-full sm:max-w-md bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl z-10 space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Drag Handle for Mobile */}
            <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />

            {/* User Profile Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-sm flex items-center justify-center overflow-hidden border-2 border-cyan-500/40 shrink-0">
                  {currentUser.avatarUrl || StorageAdapter.getProfile(currentUser.id)?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl || StorageAdapter.getProfile(currentUser.id)?.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{currentUser.email.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {currentUser.fullName || currentUser.email.split("@")[0]}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-[200px]">
                    {currentUser.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileProfileOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Account Tier Card */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Account Tier</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {isSuperAdmin ? "👑 SUPER ADMIN" : "PRO SUBSCRIBER"}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  isSuperAdmin
                    ? "bg-amber-400/20 text-amber-400 border border-amber-400/50"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                }`}
              >
                {isSuperAdmin ? "LIFETIME ELITE" : "ACTIVE"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsMobileProfileOpen(false);
                  openPricing();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 font-bold text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 fill-amber-400" />
                  <span>Upgrade / Manage Plans ($9)</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  setIsMobileProfileOpen(false);
                  setSelectedNav("Settings");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-cyan-500" />
                  <span>Terminal Settings & Photo Upload</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  setIsDark(!isDark);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <span className="flex items-center gap-2">
                  {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
                  <span>Interface Theme: {isDark ? "Dark Mode" : "Light Mode"}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Toggle</span>
              </button>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                setIsMobileProfileOpen(false);
                onLogout();
              }}
              className="w-full py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition cursor-pointer text-center"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>
      )}

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
// 3. ECONOMIC NEWS & MACRO TERMINAL (v2.01 Enhanced)
// =============================================================================
const EconomicNewsSection = ({ isDark }: { isDark: boolean }) => {
  const [activeModalNews, setActiveModalNews] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"CALENDAR" | "LIVE_NEWS">("CALENDAR");
  const [newsCategory, setNewsCategory] = useState<string>("All");

  const economicEvents = NewsService.getEconomicEvents();
  const rawArticles = NewsService.getNewsArticles();

  const filteredArticles = newsCategory === "All" 
    ? rawArticles 
    : rawArticles.filter(a => a.category.toLowerCase() === newsCategory.toLowerCase());

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 sm:p-6 shadow-sm space-y-5">
      {/* Terminal Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-500" />
              <span>Institutional Macro Calendar & Financial News Terminal</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              v2.01
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time macroeconomic catalysts, central bank rate decisions, and multi-asset live intelligence.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-[#050811] p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab("CALENDAR")}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === "CALENDAR"
                ? "bg-white dark:bg-[#090e1a] text-cyan-500 dark:text-cyan-400 shadow-xs border border-slate-200 dark:border-slate-700"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            🏛️ Macro Calendar ({economicEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("LIVE_NEWS")}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === "LIVE_NEWS"
                ? "bg-white dark:bg-[#090e1a] text-cyan-500 dark:text-cyan-400 shadow-xs border border-slate-200 dark:border-slate-700"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            📰 Live Financial News ({rawArticles.length})
          </button>
        </div>
      </div>

      {/* View 1: Macroeconomic Calendar */}
      {activeTab === "CALENDAR" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            {economicEvents.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveModalNews(item)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:border-cyan-500/50 hover:shadow-md transition cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px]">
                      {item.currency}
                    </span>
                    <span className="text-slate-400 text-[11px]">{item.country}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.impact === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : item.impact === "HIGH"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {item.impact} IMPACT
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition-colors">
                  {item.event}
                </h4>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80 font-mono text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>Forecast: <strong className="text-slate-800 dark:text-slate-200">{item.forecast}</strong></span>
                    <span>Prior: <strong className="text-slate-800 dark:text-slate-200">{item.previous}</strong></span>
                  </div>
                  <span className="text-cyan-500 font-bold text-[10px]">View Trading Rule →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 2: Live Financial News */}
      {activeTab === "LIVE_NEWS" && (
        <div className="space-y-4">
          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["All", "Crypto", "Commodities", "Equities", "Forex", "Macro"].map((cat) => (
              <button
                key={cat}
                onClick={() => setNewsCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                  newsCategory === cat
                    ? "bg-cyan-500 text-slate-950 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {cat === "All" ? "All Markets" : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setActiveModalNews(article)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:border-cyan-500/50 hover:shadow-md transition cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px]">
                      {article.category}
                    </span>
                    <span className="text-slate-400 text-[11px]">{article.source}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                    {article.impact} IMPACT
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition-colors">
                  {article.title}
                </h4>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {article.summary}
                </p>

                {article.aiAnalysis && (
                  <div className="p-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-cyan-700 dark:text-cyan-300">
                    <strong>AI Quantitative Angle:</strong> {article.aiAnalysis}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 py-6">
        <div
          className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 text-xs font-sans my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
            <X className="h-5 w-5" />
          </button>

          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[10px] font-bold">
                {news.currency || news.category || "GLOBAL"}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono text-[10px] font-bold">
                {news.impact || "HIGH"} IMPACT
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{news.event || news.title}</h2>
            {news.bias && <span className="text-cyan-500 font-mono text-[11px] block mt-0.5">{news.bias}</span>}
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Fundamental Summary:</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{news.summary}</p>
          </div>

          {news.cryptoImpact && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-[11px]">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800">
                <strong className="text-amber-400 font-sans block mb-1">🪙 Crypto Impact:</strong>
                <p className="text-slate-400 leading-relaxed">{news.cryptoImpact}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800">
                <strong className="text-amber-300 font-sans block mb-1">🏆 Gold (XAU) Impact:</strong>
                <p className="text-slate-400 leading-relaxed">{news.goldImpact}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800">
                <strong className="text-blue-400 font-sans block mb-1">💱 Forex Impact:</strong>
                <p className="text-slate-400 leading-relaxed">{news.forexImpact}</p>
              </div>
            </div>
          )}

          {news.tradingRule && (
            <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-1">
              <span className="font-bold text-cyan-600 dark:text-cyan-400 block font-sans">Institutional Trading Rule:</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{news.tradingRule}</p>
            </div>
          )}

          {news.aiAnalysis && (
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block font-sans">AI Market Sentiment Analysis:</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{news.aiAnalysis}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckoutModal = ({ isDark, onClose, onUnlock }: any) => {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 py-6">
        <div
          className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-center text-xs my-auto"
          onClick={(e) => e.stopPropagation()}
        >
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
    </div>
  );
};

const HelpModal = ({ isDark, onClose }: any) => {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 py-6">
        <div
          className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-xs font-sans my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Trading-OS Documentation</h3>
          </div>
          <div className="space-y-2 text-slate-600 dark:text-slate-300 text-left">
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

export default Example;
