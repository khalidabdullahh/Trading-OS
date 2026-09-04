import React, { useState } from "react";
import {
  Zap,
  ShieldCheck,
  BrainCircuit,
  BarChart3,
  DollarSign,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sliders,
  Sparkles,
  Activity,
  Globe,
  TrendingUp,
  Calendar,
  PieChart,
  FileCode2,
  ChevronDown,
  ChevronUp,
  Award,
  Flame,
  Terminal,
  Clock,
  Eye,
  Crosshair,
  Compass,
  Database,
  ArrowUpRight,
  AlertTriangle,
  Cpu,
  MapPin,
  ExternalLink,
  X
} from "lucide-react";

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [activeModuleTab, setActiveModuleTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isArchitectModalOpen, setIsArchitectModalOpen] = useState<boolean>(false);

  const modules = [
    {
      id: "strategy-lab",
      name: "Strategy Lab & AST Compiler",
      badge: "AI Powered",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      icon: Zap,
      headline: "Compile Natural Trading Rules into Deterministic Logic Trees & Pine Script v5",
      summary:
        "Define your trading ideas in natural language or structured blocks. The engine compiles them into deterministic Abstract Syntax Trees (AST) with exact candle offsets and generates ready-to-run TradingView Pine Script v5 & Python backtesting code.",
      features: [
        "Natural Language to AST Parser with recursive boolean logic (AND/OR)",
        "Offset-aware candle comparisons (e.g., EMA 20 crossing SMA 50 on bar [1])",
        "Instant Export to Pine Script v5 (TradingView) and Python Vectorbt",
        "Deterministic condition validation & syntax sanity guardrails"
      ],
      previewSnippet: {
        title: "AST Compiler Output",
        type: "code",
        content: `// Trading-OS Generated Pine Script v5
//@version=5
strategy("Momentum Breakout v2", overlay=true, initial_capital=10000)
ema20 = ta.ema(close, 20)
sma50 = ta.sma(close, 50)
longCond = ta.crossover(ema20, sma50) and rsi(close, 14) > 55
if (longCond)
    strategy.entry("Long", strategy.long, stop=close - (1.5 * ta.atr(14)))`
      }
    },
    {
      id: "risk-center",
      name: "Institutional Risk Center",
      badge: "Mathematical Guardrails",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: ShieldCheck,
      headline: "Zero-Latency Position Sizing & Deterministic Drawdown Protection",
      summary:
        "Protect your trading capital with institutional risk models. Calculate exact position sizing based on account equity, fixed dollar risk, or ATR market volatility before every single execution.",
      features: [
        "3 Deterministic Sizing Modes: Fixed %, Cash Amount, and ATR Volatility Multiplier",
        "Live Account Risk Gauge with dynamic max-loss threshold warnings",
        "Rule Violation Detection: Flags trades exceeding maximum risk limits",
        "Interactive Stop-Loss & Take-Profit R-Multiple Simulator"
      ],
      previewSnippet: {
        title: "Risk Engine Calculation",
        type: "metric",
        items: [
          { label: "Account Equity", value: "$25,000.00" },
          { label: "Risk Per Trade (1.0%)", value: "$250.00" },
          { label: "Recommended Position", value: "0.850 BTC" },
          { label: "Max Allowable Loss", value: "$250.00 (1.00R)" },
          { label: "Risk Multiplier Status", value: "APPROVED (Normal)", status: "good" }
        ]
      }
    },
    {
      id: "ai-analyst",
      name: "Context-Aware AI Analyst",
      badge: "Cognitive Intelligence",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      icon: BrainCircuit,
      headline: "Personalized AI Auditing for Psychological Bias & Setup Edge",
      summary:
        "Unlike generic chatbots, the AI Analyst reads directly from your private trade logs, session win rates, and trading plan to expose psychological traps, revenge trading, and leaky setups.",
      features: [
        "Deep trade log reasoning with instant behavioral diagnostics",
        "Detection of revenge trades, sizing deviations, and emotional tilt",
        "Setup win-rate breakdown with concrete optimization suggestions",
        "Local memory and real-time LLM integration (Gemini & Claude)"
      ],
      previewSnippet: {
        title: "AI Trade Audit Diagnostic",
        type: "quote",
        text: "“Warning: In your last 5 sessions, trading during NY PM session had a -1.4R expectancy compared to +2.8R in London Open. Your win rate drops by 38% after 2 consecutive losses. Recommendation: Enforce a 2-loss daily lockout rule.”"
      }
    },
    {
      id: "journal",
      name: "Quantitative Trade Journal",
      badge: "Performance Logging",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      icon: DollarSign,
      headline: "Institutional Execution Logging with R-Multiples & CSV Portability",
      summary:
        "Keep meticulous records of every execution. Tag setups, track realized R-multiples, log psychological state, and seamlessly import or export your entire history via structured CSV format.",
      features: [
        "Automatic R-Multiple and Risk-to-Reward calculation per trade",
        "Tagging by Strategy, Session (Asia/London/NY), and Emotional State",
        "Universal CSV Import & Export for spreadsheet and tax interoperability",
        "Detailed trade timeline with screenshot and post-trade notes"
      ],
      previewSnippet: {
        title: "Recent Journal Logs",
        type: "table",
        rows: [
          { symbol: "BTC/USDT", type: "LONG", r: "+3.20R", pnl: "+$800.00", setup: "Break & Retest" },
          { symbol: "EUR/USD", type: "SHORT", r: "-1.00R", pnl: "-$250.00", setup: "Trend Pullback" },
          { symbol: "ETH/USDT", type: "LONG", r: "+2.40R", pnl: "+$600.00", setup: "Liquidity Sweep" }
        ]
      }
    },
    {
      id: "screener",
      name: "Multi-Asset Market Screener",
      badge: "Real-Time Radar",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: Globe,
      headline: "Multi-Market Opportunity Radar Across Crypto, Forex, Indices & Commodities",
      summary:
        "Monitor global financial instruments simultaneously. Filter by volatility, moving average crosses, 24h volume momentum, and high-probability breakout patterns.",
      features: [
        "Comprehensive coverage: Crypto (BTC, ETH, SOL), Forex, Indices, and Metals",
        "Technical filter presets: RSI Overbought/Oversold, EMA Crosses, High Volume",
        "1-Click Navigation to chart simulation and position sizer",
        "Real-time price feed and 24-hour spread/volatility tracking"
      ],
      previewSnippet: {
        title: "Live Screener Signals",
        type: "table",
        rows: [
          { symbol: "BTC/USDT", price: "$92,450.00", chg: "+4.12%", signal: "Bullish EMA 20/50 Cross" },
          { symbol: "SOL/USDT", price: "$198.30", chg: "+8.45%", signal: "Volume Breakout (RSI 62)" },
          { symbol: "XAU/USD", price: "$2,890.50", chg: "+0.85%", signal: "Support Confluence Bounce" }
        ]
      }
    },
    {
      id: "plan",
      name: "Trading Plan Constitution",
      badge: "Discipline Protocol",
      badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
      icon: Lock,
      headline: "Ironclad Non-Negotiable Rules & Revenge-Trading Lockout Engine",
      summary:
        "Discipline is the differentiator between profitable institutions and failing retail traders. Define non-negotiable rules for daily max loss, permitted session hours, and mandatory cooldown periods.",
      features: [
        "Hard daily drawdown limit gates to prevent catastrophic account blowouts",
        "Permitted trading windows (auto-flagging off-session impulsive trades)",
        "Consecutive loss cooldown timers with mandatory trade lockouts",
        "Compliance score tracking to measure discipline over time"
      ],
      previewSnippet: {
        title: "Active Trading Rules",
        type: "rules",
        items: [
          { rule: "Max Risk Per Trade ≤ 1.0% Equity", status: "Active & Enforced", color: "text-emerald-400" },
          { rule: "Max Daily Drawdown Gate: -$500.00 (2.0%)", status: "Active & Enforced", color: "text-emerald-400" },
          { rule: "Trade Only London & NY Sessions", status: "Active & Enforced", color: "text-emerald-400" },
          { rule: "Mandatory 30m Cooldown After 2 Losses", status: "Active & Enforced", color: "text-emerald-400" }
        ]
      }
    },
    {
      id: "charts",
      name: "Charts & Strategy Simulator",
      badge: "Visual Backtest",
      badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
      icon: Activity,
      headline: "Multi-Timeframe Charting Engine with Interactive Trade Simulator",
      summary:
        "Powered by lightweight financial charting. Simulate historical entries, test strategy rules against past candles, and replay price action to sharpen execution precision without risking capital.",
      features: [
        "High-performance candlestick charting with volume overlays",
        "Interactive Trade Simulator: Place virtual entries, stop-loss, and take-profit",
        "Multiple timeframes: 1m, 5m, 15m, 1h, 4h, 1D",
        "Dynamic technical indicators: EMA, SMA, RSI, ATR, Bollinger Bands"
      ],
      previewSnippet: {
        title: "Simulation Widget",
        type: "metric",
        items: [
          { label: "Active Symbol", value: "BTC/USDT (15m)" },
          { label: "Simulated Entry", value: "$91,200.00" },
          { label: "Simulated Stop Loss", value: "$90,400.00 (-0.88%)" },
          { label: "Simulated Target", value: "$93,600.00 (+2.63%)" },
          { label: "Calculated Reward-to-Risk", value: "3.00 : 1.00", status: "good" }
        ]
      }
    },
    {
      id: "macro",
      name: "Global Macro Calendar",
      badge: "Economic Pulse",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      icon: Calendar,
      headline: "High-Impact Macroeconomic Event Tracker & Volatility Forecaster",
      summary:
        "Never get caught off-guard by surprise interest rate decisions, CPI prints, or Non-Farm Payrolls. The Macro Calendar tracks high-impact catalysts with volatility risk warnings.",
      features: [
        "Real-time economic event schedule categorized by impact level (High/Med/Low)",
        "Pre-event countdown warnings to avoid holding leveraged positions during news",
        "Historical consensus vs actual data comparisons",
        "Currency and asset correlation tagging"
      ],
      previewSnippet: {
        title: "Upcoming High-Impact Catalysts",
        type: "table",
        rows: [
          { symbol: "USD", price: "US CPI (YoY)", chg: "High", signal: "Consensus: 2.7% | Prev: 2.9%" },
          { symbol: "USD", price: "FOMC Rate Decision", chg: "Critical", signal: "Target Rate: 4.50%" },
          { symbol: "EUR", price: "ECB Press Conference", chg: "High", signal: "Monetary Policy Statement" }
        ]
      }
    },
    {
      id: "portfolio",
      name: "Multi-Broker Portfolio Tracker",
      badge: "Asset Aggregation",
      badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      icon: PieChart,
      headline: "Comprehensive Capital Allocation & Multi-Account Exposure Breakdown",
      summary:
        "Monitor your total net worth, margin utilization, and asset distribution across all connected brokers and crypto exchange accounts in one centralized dashboard.",
      features: [
        "Consolidated capital balance and unrealized PnL overview",
        "Asset class allocation charts (Crypto vs Forex vs Equities vs Cash)",
        "Margin health and liquidation risk safety buffers",
        "Multi-currency support with real-time conversion rates"
      ],
      previewSnippet: {
        title: "Portfolio Asset Allocation",
        type: "metric",
        items: [
          { label: "Total Managed Capital", value: "$54,820.00" },
          { label: "Crypto Allocation (62%)", value: "$34,000.00" },
          { label: "Forex & Commodities (28%)", value: "$15,350.00" },
          { label: "Dry Powder Cash (10%)", value: "$5,470.00" },
          { label: "Margin Utilization", value: "14.2% (Conservative)", status: "good" }
        ]
      }
    },
    {
      id: "analytics",
      name: "Performance Analytics",
      badge: "Quant Intelligence",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      icon: BarChart3,
      headline: "Institutional Statistical Suite: Sharpe Ratio, Expectancy & Max Drawdown",
      summary:
        "Transform raw trade entries into deep statistical insights. Measure mathematical expectancy, Profit Factor, Sharpe Ratio, average holding duration, and drawdown recovery periods.",
      features: [
        "Institutional statistical metrics: Sharpe Ratio, Sortino Ratio, Profit Factor",
        "Mathematical Expectancy ($/trade and R/trade) breakdown",
        "Cumulative equity growth curves with high-water mark tracking",
        "Drawdown duration and peak-to-trough recovery analysis"
      ],
      previewSnippet: {
        title: "Statistical Performance Summary",
        type: "metric",
        items: [
          { label: "Win Rate", value: "64.2% (45 / 70 Trades)" },
          { label: "Profit Factor", value: "2.48" },
          { label: "Mathematical Expectancy", value: "+0.84 R / trade" },
          { label: "Max Historical Drawdown", value: "-4.20% (Recovered)" },
          { label: "Sharpe Ratio (Annualized)", value: "2.85 (Institutional Tier)", status: "good" }
        ]
      }
    }
  ];

  const faqs = [
    {
      question: "What makes Trading OS different from TradingView or a generic trade journal?",
      answer:
        "TradingView is primarily a charting and signal platform, while generic trade journals are just glorified spreadsheets. Trading OS is an end-to-end quantitative execution operating system. It bridges strategy formulation (AST Compiler), deterministic risk calculation (Institutional Risk Center), discipline enforcement (Trading Plan Constitution), and AI psychological auditing (AI Analyst) into one unified, distraction-free workstation."
    },
    {
      question: "How does the Strategy Lab AST Compiler work?",
      answer:
        "The Strategy Lab transforms your strategy logic into a formal Abstract Syntax Tree (AST). This allows you to evaluate candle rules with exact historical bar offsets (e.g. bar[1] EMA cross, RSI condition on trigger bar). Once defined, it automatically compiles the logic into deterministic Pine Script v5 code for TradingView or Python code for vector backtesting with a single click."
    },
    {
      question: "How does the Risk Center prevent account blowups?",
      answer:
        "The Institutional Risk Center calculates exact position size based on your account balance, maximum allowed risk per trade (e.g., 1%), and market volatility (ATR). If a trade setup violates your Trading Plan Constitution (such as exceeding maximum daily risk or trading outside permitted hours), the system flags a high-priority violation alert before you execute."
    },
    {
      question: "Is my personal trading and financial data kept secure?",
      answer:
        "Yes. Trading OS is built with local-first and enterprise cloud persistence using secure PostgreSQL databases. Your strategy formulas, private journal entries, and account balances remain your intellectual property and are never shared or sold."
    },
    {
      question: "Can I use Trading OS for Forex, Crypto, Stocks, and Commodities?",
      answer:
        "Absolutely. Trading OS is completely multi-asset. It natively supports Cryptocurrencies (Bitcoin, Ethereum, Solana, Altcoins), Major & Minor Forex Pairs (EUR/USD, GBP/USD, USD/JPY), Global Equity Indices (S&P 500, Nasdaq, DAX), and Commodities (Gold, Silver, Crude Oil)."
    },
    {
      question: "Do I need to install software or can I use it in my browser?",
      answer:
        "Trading OS runs seamlessly as a web application across all modern desktop, tablet, and mobile browsers. You can launch the workstation immediately without downloading bulky desktop installers."
    }
  ];

  const currentModule = modules[activeModuleTab];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#050811]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-sm shadow-inner shadow-cyan-500/20">
              OS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-wider text-white">TRADING OS</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold border border-cyan-500/30">
                  v2.01
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Quantitative Terminal & Intelligence Suite</p>
            </div>
          </div>

          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-6 text-xs text-slate-400 font-medium">
            <a href="#modules" className="hover:text-cyan-400 transition-colors">10 Modules</a>
            <a href="#strategy-ast" className="hover:text-cyan-400 transition-colors">Strategy AST</a>
            <a href="#risk-engine" className="hover:text-cyan-400 transition-colors">Risk Engine</a>
            <a href="#ai-intelligence" className="hover:text-cyan-400 transition-colors">AI Analyst</a>
            <a href="#comparison" className="hover:text-cyan-400 transition-colors">Why Trading OS</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterApp}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Launch Workstation</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold shadow-sm shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>v2.01 Enterprise Quantitative Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            The All-in-One <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">
              Quantitative Trading Terminal
            </span> <br />
            & Institutional Strategy OS
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Bridge the entire trading lifecycle: Compile natural language rules into structured ASTs, calculate deterministic risk before placing a trade, eliminate psychological revenge habits with AI auditing, and export native Pine Script v5 code.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm rounded-xl shadow-2xl shadow-cyan-500/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Launch Terminal Workstation Free</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#modules"
              className="w-full sm:w-auto px-6 py-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="h-4 w-4 text-cyan-400" />
              <span>Explore All 10 Modules</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl border border-slate-800/80 bg-[#090e1a]/80 backdrop-blur-sm">
              <div className="text-2xl font-black text-cyan-400 font-mono">10 Modules</div>
              <div className="text-xs text-slate-400 font-medium">Fully Integrated Suite</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-800/80 bg-[#090e1a]/80 backdrop-blur-sm">
              <div className="text-2xl font-black text-emerald-400 font-mono">0ms Latency</div>
              <div className="text-xs text-slate-400 font-medium">Local-First AST Logic</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-800/80 bg-[#090e1a]/80 backdrop-blur-sm">
              <div className="text-2xl font-black text-purple-400 font-mono">100% Quant</div>
              <div className="text-xs text-slate-400 font-medium">Deterministic Risk Math</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-800/80 bg-[#090e1a]/80 backdrop-blur-sm">
              <div className="text-2xl font-black text-amber-400 font-mono">Pine v5</div>
              <div className="text-xs text-slate-400 font-medium">TradingView Exporter</div>
            </div>
          </div>
        </section>

        {/* 10-Module Interactive Showcase Section */}
        <section id="modules" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <Layers className="h-3.5 w-3.5" />
              <span>Complete System Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              10 Dedicated Institutional Modules
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Each module is engineered to address a distinct phase of institutional trade execution. Click any module below to inspect its capabilities and live preview.
            </p>
          </div>

          {/* Module Selector Pills / Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
            {modules.map((mod, idx) => {
              const Icon = mod.icon;
              const isActive = activeModuleTab === idx;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModuleTab(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-black scale-105"
                      : "bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-slate-950" : "text-cyan-400"}`} />
                  <span>{mod.name.split("&")[0].trim()}</span>
                </button>
              );
            })}
          </div>

          {/* Active Module Showcase Card */}
          <div className="p-6 sm:p-10 rounded-3xl border border-slate-800 bg-[#090e1a]/90 backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Top Badge & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${currentModule.badgeColor}`}>
                    {currentModule.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Module #{activeModuleTab + 1} of 10</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                  <currentModule.icon className="h-7 w-7 text-cyan-400" />
                  <span>{currentModule.name}</span>
                </h3>
              </div>

              <button
                onClick={onEnterApp}
                className="self-start md:self-auto px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <span>Launch {currentModule.name.split(" ")[0]}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content & Live Preview Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
              {/* Left Column: Description & Feature List */}
              <div className="lg:col-span-7 space-y-6">
                <h4 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
                  {currentModule.headline}
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {currentModule.summary}
                </p>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Core Capabilities:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentModule.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                        <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Interactive Mockup / Preview */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#050811] p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>{currentModule.previewSnippet.title}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">LIVE PREVIEW</span>
                </div>

                {/* Dynamic Preview Render based on Snippet Type */}
                {currentModule.previewSnippet.type === "code" && (
                  <pre className="text-[11px] font-mono text-cyan-300/90 bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto leading-relaxed">
                    <code>{currentModule.previewSnippet.content}</code>
                  </pre>
                )}

                {currentModule.previewSnippet.type === "metric" && currentModule.previewSnippet.items && (
                  <div className="space-y-2.5 text-xs font-mono">
                    {currentModule.previewSnippet.items.map((item, mIdx) => (
                      <div key={mIdx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60">
                        <span className="text-slate-400">{item.label}</span>
                        <span className={`font-bold ${item.status === "good" ? "text-emerald-400" : "text-white"}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {currentModule.previewSnippet.type === "quote" && (
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs text-purple-200/90 leading-relaxed font-sans italic">
                    {currentModule.previewSnippet.text}
                  </div>
                )}

                {currentModule.previewSnippet.type === "table" && currentModule.previewSnippet.rows && (
                  <div className="space-y-2 text-xs font-mono">
                    {currentModule.previewSnippet.rows.map((row, rIdx) => (
                      <div key={rIdx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                        <div>
                          <span className="font-bold text-white mr-2">{row.symbol}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {row.type || row.signal}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-cyan-400">{row.r || row.price}</span>
                          {row.pnl && <span className="text-[10px] text-emerald-400 ml-1.5">{row.pnl}</span>}
                          {row.chg && <span className="text-[10px] text-emerald-400 ml-1.5">{row.chg}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentModule.previewSnippet.type === "rules" && currentModule.previewSnippet.items && (
                  <div className="space-y-2 text-xs font-mono">
                    {currentModule.previewSnippet.items.map((r, rIdx) => (
                      <div key={rIdx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
                        <span className="text-slate-300">{r.rule}</span>
                        <span className={`text-[10px] font-bold ${r.color}`}>ENFORCED</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Deterministic validation engine</span>
                  <button onClick={onEnterApp} className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer">
                    Open in app <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deep Dive: Strategy AST & Code Export */}
        <section id="strategy-ast" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 border-t border-slate-800/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                <FileCode2 className="h-3.5 w-3.5" />
                <span>Compiler Technology</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                From Natural Language to Production Pine Script v5
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Traditional bot-builders force you into proprietary silos. Trading OS parses your plain-English rules into a strict Abstract Syntax Tree (AST), ensuring mathematical clarity and complete freedom to export to TradingView Pine Script v5 or Python backtesting engines.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">1</div>
                  <div><strong>Natural Description:</strong> “Enter long when 20 EMA crosses above 50 SMA and RSI(14) is above 50 on the 1-hour candle.”</div>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">2</div>
                  <div><strong>AST Compilation:</strong> Synthesizes deterministic node graphs with offset indexing (`close[1]`, `ema[0]`).</div>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">3</div>
                  <div><strong>Instant Code Generation:</strong> Compiles valid Pine Script v5 ready to paste into TradingView Strategy Tester.</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-800 bg-[#090e1a] shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
                <span className="text-cyan-400 font-bold">AST Tree & Pine Script Compiler</span>
                <span>v5.0 Engine</span>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-900 leading-relaxed overflow-x-auto">
{`{
  "type": "STRATEGY_AST",
  "root": {
    "operator": "AND",
    "conditions": [
      {
        "left": { "type": "INDICATOR", "name": "EMA", "period": 20, "offset": 0 },
        "comparator": "CROSSES_ABOVE",
        "right": { "type": "INDICATOR", "name": "SMA", "period": 50, "offset": 0 }
      },
      {
        "left": { "type": "INDICATOR", "name": "RSI", "period": 14, "offset": 0 },
        "comparator": "GREATER_THAN",
        "right": { "type": "CONSTANT", "value": 50 }
      }
    ]
  },
  "risk": { "stopLossATR": 1.5, "targetMultiple": 3.0 }
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Deep Dive: Mathematical Risk Center */}
        <section id="risk-engine" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 border-t border-slate-800/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 p-6 rounded-2xl border border-emerald-500/30 bg-[#090e1a] shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
                <span className="text-emerald-400 font-bold">Mathematical Position Sizer</span>
                <span className="text-emerald-400 font-bold">● ACTIVE AUDIT</span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Position Sizing Formula:</span>
                  <span className="text-cyan-400 font-bold">Size = (Account × Risk%) / |Entry - Stop|</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">ATR Volatility Cushion:</span>
                  <span className="text-emerald-400 font-bold">14-Period ATR Multiplier = 1.5x</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Daily Max Loss Limit:</span>
                  <span className="text-rose-400 font-bold">2.0% Maximum ($500.00 Lockout)</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Deterministic Protection</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Prevent Catastrophic Drawdowns with Institutional Math
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Amateurs guess lot sizes; quantitative traders calculate deterministic mathematical risk. Trading OS computes exact position size, risk-to-reward ratio, and drawdown limits before you place a single dollar on the line.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Dynamic account balance synchronization</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Hard stop-loss requirements on every trade calculation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Automated alerts when risk exceeds your pre-set constitution</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Deep Dive: AI Analyst & Psychological Audit */}
        <section id="ai-intelligence" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 border-t border-slate-800/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold">
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>Cognitive Trade Audits</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Context-Aware AI That Audits Your Psychology & Setups
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Most traders fail due to psychological leakage—revenge trading, over-sizing after losses, and taking low-probability setups during off-hours. Trading OS passes your historical trade data and rules directly into cognitive AI models for brutal, honest execution feedback.
              </p>
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200/90 leading-relaxed font-sans">
                <strong>AI Audit Insight:</strong> “Over your last 30 trades, setups tagged with &apos;Break & Retest&apos; generated +4.8R with a 72% win rate. However, counter-trend scalp trades lost -3.2R with a 28% win rate. Removing counter-trend scalps will immediately increase your net expectancy by +1.1R per trade.”
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl border border-purple-500/30 bg-[#090e1a] shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
                <span className="text-purple-400 font-bold">AI Execution Audit Stream</span>
                <span>REAL-TIME AGENT</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <Flame className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-400">Revenge Trading Pattern Detected:</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">3 trades entered within 8 minutes following a stop-out on BTC/USDT. Cooldown recommended.</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <Award className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-400">Optimal Session Confluence:</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">Your highest win rate (76%) occurs between 08:00 - 11:00 UTC (London Open session).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Comparison Table */}
        <section id="comparison" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 border-t border-slate-800/60">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Why Disciplined Traders Choose Trading OS
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              See how Trading OS compares against fragmented tools, generic spreadsheets, and charting apps.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#090e1a]/90 backdrop-blur-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
                  <th className="p-4 sm:px-6 font-bold">Feature / Capability</th>
                  <th className="p-4 sm:px-6 font-bold text-cyan-400">Trading OS v2.0</th>
                  <th className="p-4 sm:px-6 font-bold">TradingView</th>
                  <th className="p-4 sm:px-6 font-bold">Excel / Notion Journals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-4 sm:px-6 font-medium text-white">Natural Language AST Compiler</td>
                  <td className="p-4 sm:px-6 text-emerald-400 font-bold">✓ Included</td>
                  <td className="p-4 sm:px-6 text-rose-400">✗ Manual Code Only</td>
                  <td className="p-4 sm:px-6 text-rose-400">✗ Not Available</td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-6 font-medium text-white">Deterministic Risk Math & Hard Limits</td>
                  <td className="p-4 sm:px-6 text-emerald-400 font-bold">✓ Fixed %, Cash, ATR</td>
                  <td className="p-4 sm:px-6 text-slate-400">~ Basic Tool</td>
                  <td className="p-4 sm:px-6 text-slate-400">~ Static formulas only</td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-6 font-medium text-white">Context-Aware AI Psychological Audit</td>
                  <td className="p-4 sm:px-6 text-emerald-400 font-bold">✓ Deep Trade Reasoning</td>
                  <td className="p-4 sm:px-6 text-rose-400">✗ Not Available</td>
                  <td className="p-4 sm:px-6 text-rose-400">✗ Not Available</td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-6 font-medium text-white">Trading Plan Constitution & Lockouts</td>
                  <td className="p-4 sm:px-6 text-emerald-400 font-bold">✓ Rule Violation Engine</td>
                  <td className="p-4 sm:px-6 text-rose-400">✗ Not Available</td>
                  <td className="p-4 sm:px-6 text-rose-400">✗ Not Available</td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-6 font-medium text-white">Pine Script v5 & Python Exporters</td>
                  <td className="p-4 sm:px-6 text-emerald-400 font-bold">✓ 1-Click Export</td>
                  <td className="p-4 sm:px-6 text-slate-400">Native editor</td>
                  <td className="p-4 sm:px-6 text-rose-400">✗ Not Available</td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-6 font-medium text-white">Pricing Model</td>
                  <td className="p-4 sm:px-6 text-cyan-400 font-bold">$9 Lifetime Pro / Free</td>
                  <td className="p-4 sm:px-6 text-slate-400">$15 - $60 / Month</td>
                  <td className="p-4 sm:px-6 text-slate-400">$0 - $20 / Month</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12 border-t border-slate-800/60">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Transparent Access</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Simple, Disciplined Pricing</h2>
            <p className="text-xs sm:text-sm text-slate-400">No perpetual high-cost subscriptions. Start free or unlock lifetime pro capabilities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Free Tier */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-[#090e1a] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Free Core</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$0</span>
                  <span className="text-slate-400 font-mono">/ forever</span>
                </div>
                <p className="text-slate-400 text-[11px]">Core charting, risk sizer, market screener, and manual trade journal.</p>
                <ul className="space-y-2 pt-2 text-slate-300 font-medium">
                  <li className="flex items-center gap-2">✓ Multi-Asset Market Screener</li>
                  <li className="flex items-center gap-2">✓ Institutional Risk Position Sizer</li>
                  <li className="flex items-center gap-2">✓ Interactive Charts & Simulator</li>
                  <li className="flex items-center gap-2">✓ Manual Trade Journal</li>
                  <li className="flex items-center gap-2">✓ Macro Economic Calendar</li>
                </ul>
              </div>
              <button
                onClick={onEnterApp}
                className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Tier (Popular) */}
            <div className="p-6 rounded-2xl border border-cyan-500/50 bg-[#090e1a] relative shadow-xl shadow-cyan-500/10 space-y-4 flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">Pro License</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$9</span>
                  <span className="text-slate-400 font-mono">USDT / Lifetime</span>
                </div>
                <p className="text-slate-400 text-[11px]">Full Strategy Compiler, AI Copilot, Rule Violation Engine & Exporters.</p>
                <ul className="space-y-2 pt-2 text-slate-200 font-medium">
                  <li className="flex items-center gap-2">✓ Natural Language Strategy Compiler</li>
                  <li className="flex items-center gap-2">✓ Context-Aware AI Trade Analyst</li>
                  <li className="flex items-center gap-2">✓ Trading Plan Rule Violation Engine</li>
                  <li className="flex items-center gap-2">✓ Pine Script v5 & Python Exporter</li>
                  <li className="flex items-center gap-2">✓ Unlimited CSV Journal History</li>
                </ul>
              </div>
              <button
                onClick={onEnterApp}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Unlock Pro License
              </button>
            </div>

            {/* Elite Desk */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-[#090e1a] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">Elite Desk</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$29</span>
                  <span className="text-slate-400 font-mono">/ month</span>
                </div>
                <p className="text-slate-400 text-[11px]">Dedicated quant analytics, multi-account aggregation, and priority AI compute.</p>
                <ul className="space-y-2 pt-2 text-slate-300 font-medium">
                  <li className="flex items-center gap-2">✓ Everything in Pro</li>
                  <li className="flex items-center gap-2">✓ Multi-Broker Portfolio Aggregation</li>
                  <li className="flex items-center gap-2">✓ Advanced Monte Carlo Simulation</li>
                  <li className="flex items-center gap-2">✓ Custom Strategy Webhook Signals</li>
                </ul>
              </div>
              <button
                onClick={onEnterApp}
                className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Accordion */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10 border-t border-slate-800/60">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about the Trading OS architecture.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-[#090e1a] overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition"
                  >
                    <span className="font-bold text-sm text-white">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-cyan-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-cyan-950/40 via-[#090e1a] to-blue-950/40 border border-cyan-500/30 text-center space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Upgrade to Institutional Discipline?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Eliminate guesswork, trade with deterministic mathematical risk, and leverage context-aware AI audits today.
            </p>
            <div className="pt-2">
              <button
                onClick={onEnterApp}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-cyan-500/30 transition transform hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Launch Workstation Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Regulatory & Risk Disclaimer Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-slate-400 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-black text-xs">
                OS
              </div>
              <span className="font-black text-white text-sm tracking-wider">TRADING OS</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold">
                v2.01
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A personal quantitative trading terminal and intelligence suite designed to bridge strategy formulation, deterministic risk calculation, execution auditing, and cognitive AI.
            </p>
            
            {/* Lead Architect & Engineer Bio Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-[#090e1a] border border-slate-800 space-y-2.5 max-w-md shadow-lg">
              <div className="flex items-center gap-3">
                <img
                  src="https://avatars.githubusercontent.com/u/191352772?v=4"
                  alt="Khalid Abdullah"
                  className="w-11 h-11 rounded-xl border border-cyan-500/40 object-cover shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Architected & Engineered by</span>
                  </div>
                  <button
                    onClick={() => setIsArchitectModalOpen(true)}
                    className="font-bold text-sm text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5 cursor-pointer transition truncate"
                  >
                    <span>Khalid Abdullah</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold border border-cyan-500/20">
                      View Profile ↗
                    </span>
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed italic">
                “Computer Science student with a curiosity for Technology, Mathematics, and Problem Solving — learning, building, and exploring where ideas meet code.”
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                <a
                  href="https://github.com/khalidabdullahh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center gap-1.5 text-[11px] font-mono font-medium border border-slate-700/60 cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  <span>GitHub</span>
                </a>
                <a
                  href="https://khalid-digital-lab.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center gap-1.5 text-[11px] font-mono font-medium border border-slate-700/60 cursor-pointer"
                >
                  <Globe className="h-3 w-3 text-cyan-400" />
                  <span>Digital Lab</span>
                </a>
                <a
                  href="https://bd.linkedin.com/in/khalid-abdullah-847724339"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center gap-1.5 text-[11px] font-mono font-medium border border-slate-700/60 cursor-pointer"
                >
                  <svg className="h-3 w-3 fill-current text-blue-400" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://x.com/khalid_al_raed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center gap-1.5 text-[11px] font-mono font-medium border border-slate-700/60 cursor-pointer"
                >
                  <svg className="h-3 w-3 fill-current text-slate-200" viewBox="0 0 16 16"><path d="M9.332 6.925 14.544 1h-1.235L8.783 6.145 5.17 1H1l5.466 7.78L1 14.993h1.235l4.78-5.433 3.816 5.433H15L9.332 6.925ZM7.64 8.848l-.554-.775L2.68 1.91h1.897l3.556 4.975.554.775 4.622 6.466h-1.897L7.64 8.848Z"/></svg>
                  <span>X (Twitter)</span>
                </a>
                <a
                  href="https://www.facebook.com/khalidabdullah19"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center gap-1.5 text-[11px] font-mono font-medium border border-slate-700/60 cursor-pointer"
                >
                  <Globe className="h-3 w-3 text-blue-400" />
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-bold text-white font-mono uppercase tracking-wider">Core Modules</span>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#strategy-ast" className="hover:text-cyan-400 transition">Strategy Lab AST</a></li>
              <li><a href="#risk-engine" className="hover:text-cyan-400 transition">Risk Center</a></li>
              <li><a href="#ai-intelligence" className="hover:text-cyan-400 transition">AI Analyst Copilot</a></li>
              <li><a href="#modules" className="hover:text-cyan-400 transition">Trade Journal</a></li>
              <li><a href="#modules" className="hover:text-cyan-400 transition">Market Screener</a></li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-bold text-white font-mono uppercase tracking-wider">Resources</span>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#pricing" className="hover:text-cyan-400 transition">Pricing & Licenses</a></li>
              <li><a href="#comparison" className="hover:text-cyan-400 transition">Platform Comparison</a></li>
              <li><a href="#faq" className="hover:text-cyan-400 transition">FAQ</a></li>
              <li><button onClick={onEnterApp} className="text-cyan-400 hover:underline cursor-pointer">Launch Workstation</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 space-y-3">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong>Mandatory Risk & Regulatory Disclaimer:</strong> Trading OS is a personal trading intelligence terminal and quantitative strategy analysis software. Trading OS is NOT a registered broker-dealer, financial adviser, investment manager, or signal-selling commodity trading advisor. Trading in financial instruments (Cryptocurrency, Forex, Equities, Derivatives, and Commodities) carries substantial risk of capital loss and is not suitable for every investor. You may lose some or all of your initial investment. Any strategy compilation, AST logic, R-multiple simulation, or AI diagnostic output provided within this platform is strictly for informational and educational purposes and does not constitute financial advice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 pt-2">
            <span>© 2026 Trading-OS. All rights reserved.</span>
            <span>Local Privacy First Architecture</span>
          </div>
        </div>
      </footer>

      {/* Lead Architect & Engineer Detailed Profile Modal */}
      {isArchitectModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsArchitectModalOpen(false);
          }}
        >
          <div className="min-h-full flex items-center justify-center p-3 sm:p-6 py-6 sm:py-10">
            <div
              className="bg-[#090e1a] border border-cyan-500/30 rounded-3xl max-w-xl w-full shadow-2xl relative text-xs font-sans overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Banner Header */}
              <div className="relative h-28 bg-gradient-to-r from-cyan-900/60 via-blue-900/40 to-purple-900/50 border-b border-slate-800 p-4 flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
                    LEAD ARCHITECT PROFILE
                  </span>
                </div>
                <button
                  onClick={() => setIsArchitectModalOpen(false)}
                  className="p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer border border-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Profile Card Body */}
              <div className="px-6 pb-6 pt-0 relative space-y-5">
                {/* Avatar & Title Row */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
                  <div className="flex items-end gap-3.5">
                    <img
                      src="https://avatars.githubusercontent.com/u/191352772?v=4"
                      alt="Khalid Abdullah"
                      className="w-24 h-24 rounded-2xl border-2 border-cyan-400 object-cover shadow-xl bg-slate-950"
                    />
                    <div className="pb-1">
                      <h3 className="text-xl font-black text-white flex items-center gap-1.5">
                        <span>Khalid Abdullah</span>
                        <CheckCircle2 className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
                      </h3>
                      <span className="text-xs text-cyan-400 font-mono font-bold block">@khalidabdullahh</span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <MapPin className="h-3 w-3 text-emerald-400" />
                        <span>Bangladesh (UTC +06:00)</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://github.com/khalidabdullahh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Follow on GitHub</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Bio Block */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Official Bio
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    “Computer Science student with a curiosity for Technology, Mathematics, and Problem Solving — learning, building, and exploring where ideas meet code.”
                  </p>
                </div>

                {/* Core Focus & Engineering Stack */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Engineering & Quantitative Focus
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span className="text-slate-200">AST Strategy Compiler</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">Mathematical Risk Systems</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-purple-400 shrink-0" />
                      <span className="text-slate-200">Cognitive AI Auditing</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                      <FileCode2 className="h-4 w-4 text-amber-400 shrink-0" />
                      <span className="text-slate-200">Pine Script v5 & Python</span>
                    </div>
                  </div>
                </div>

                {/* Verified Social & Professional Networks */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Verified Social & Professional Links
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href="https://github.com/khalidabdullahh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                        <span className="font-mono">GitHub (@khalidabdullahh)</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                    </a>

                    <a
                      href="https://khalid-digital-lab.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-cyan-400" />
                        <span className="font-mono">Digital Lab / Portfolio</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                    </a>

                    <a
                      href="https://bd.linkedin.com/in/khalid-abdullah-847724339"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 fill-current text-blue-400" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        <span className="font-mono">LinkedIn Profile</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                    </a>

                    <a
                      href="https://x.com/khalid_al_raed"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 fill-current text-slate-200" viewBox="0 0 16 16"><path d="M9.332 6.925 14.544 1h-1.235L8.783 6.145 5.17 1H1l5.466 7.78L1 14.993h1.235l4.78-5.433 3.816 5.433H15L9.332 6.925ZM7.64 8.848l-.554-.775L2.68 1.91h1.897l3.556 4.975.554.775 4.622 6.466h-1.897L7.64 8.848Z"/></svg>
                        <span className="font-mono">X (@khalid_al_raed)</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                    </a>

                    <a
                      href="https://orcid.org/0009-0006-8945-7593"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-emerald-400" />
                        <span className="font-mono">ORCID Academic ID</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                    </a>

                    <a
                      href="https://www.facebook.com/khalidabdullah19"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <span className="font-mono">Facebook (@khalidabdullah19)</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                    </a>
                  </div>
                </div>

                {/* Bottom Close & Action Button */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                  <a
                    href="https://github.com/khalidabdullahh/Trading-OS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>View Trading-OS Repo</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => setIsArchitectModalOpen(false)}
                    className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
