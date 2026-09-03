import React from "react";
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
  Globe
} from "lucide-react";

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#050811]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-sm">
              OS
            </div>
            <div>
              <span className="font-black text-base tracking-wider text-white">TRADING OS</span>
              <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold">
                v2.0
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-medium">
            <a href="#features" className="hover:text-cyan-400 transition">Capabilities</a>
            <a href="#strategy" className="hover:text-cyan-400 transition">Strategy Lab</a>
            <a href="#risk" className="hover:text-cyan-400 transition">Risk Center</a>
            <a href="#pricing" className="hover:text-cyan-400 transition">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterApp}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Launch Workstation</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Production-Grade Trading Intelligence Terminal</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Market Intelligence. Strategy Lab. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">
            Institutional Risk & AI Analytics.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Trading OS bridges the entire lifecycle of a trader: Understand what is happening in the market, compile quantitative trading rules into structured ASTs, calculate deterministic risk, and audit every execution with cognitive AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Open Terminal Workstation</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 4 Core Pillars Grid */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">Engineered for Quantitative Process Execution</h2>
          <p className="text-xs text-slate-400">Not a signal-seller or automated robot. A rigorous intelligence system built for disciplined traders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-5 rounded-2xl border border-slate-800 bg-[#090e1a] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Generic Strategy AST Compiler</h3>
            <p className="text-slate-400 leading-relaxed">
              Transforms natural language descriptions into deterministic Abstract Syntax Trees with offset-based candle condition evaluation.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-[#090e1a] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Mathematical Risk Center</h3>
            <p className="text-slate-400 leading-relaxed">
              Deterministic position sizing models (Fixed %, Cash, ATR), max account risk gauges, and automated rule violation detection.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-[#090e1a] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Context-Aware AI Analyst</h3>
            <p className="text-slate-400 leading-relaxed">
              Reasons directly over your personal trade logs, session win rates, behavioral psychology, and trading plan adherence.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-[#090e1a] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Institutional Trade Journal</h3>
            <p className="text-slate-400 leading-relaxed">
              Log trades with R-multiples, setup tags, and session categorization. Import and export cleanly via structured CSV.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">Simple, Transparent Access</h2>
          <p className="text-xs text-slate-400">Choose the license level that matches your quantitative workflow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Free Tier */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#090e1a] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Core</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$0</span>
                <span className="text-slate-400">/ forever</span>
              </div>
              <p className="text-slate-400 text-[11px]">Core charting, basic rule inspection, and manual journal.</p>
              <ul className="space-y-2 pt-2 text-slate-300 font-medium">
                <li className="flex items-center gap-2">✓ Multi-Asset Charting</li>
                <li className="flex items-center gap-2">✓ Risk Position Sizer</li>
                <li className="flex items-center gap-2">✓ Basic Trade Journal</li>
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
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Pro License</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$9</span>
                <span className="text-slate-400">USDT / Lifetime</span>
              </div>
              <p className="text-slate-400 text-[11px]">Full Strategy Compiler, AI Copilot, Rule Violation Engine & Exporters.</p>
              <ul className="space-y-2 pt-2 text-slate-200 font-medium">
                <li className="flex items-center gap-2">✓ Natural Language Strategy Compiler</li>
                <li className="flex items-center gap-2">✓ Context-Aware AI Analyst</li>
                <li className="flex items-center gap-2">✓ Rule Violation Engine</li>
                <li className="flex items-center gap-2">✓ Pine Script v5 Code Exporter</li>
              </ul>
            </div>
            <button
              onClick={onEnterApp}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer"
            >
              Unlock Pro License
            </button>
          </div>

          {/* Elite Tier */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#090e1a] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Elite Desk</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$29</span>
                <span className="text-slate-400">/ month</span>
              </div>
              <p className="text-slate-400 text-[11px]">Dedicated quant analytics, walk-forward audits, and custom webhooks.</p>
              <ul className="space-y-2 pt-2 text-slate-300 font-medium">
                <li className="flex items-center gap-2">✓ Everything in Pro</li>
                <li className="flex items-center gap-2">✓ Multi-Account Aggregation</li>
                <li className="flex items-center gap-2">✓ Walk-Forward Monte Carlo Engine</li>
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

      {/* Regulatory & Risk Disclaimer Footer */}
      <footer className="border-t border-slate-800 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-[11px] text-slate-400 space-y-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
              OS
            </div>
            <span className="font-bold text-slate-300">TRADING OS v2.0</span>
          </div>
          <p>© 2026 Trading-OS. Designed & Engineered by Khalid Abdullah.</p>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          <strong>Mandatory Risk Disclaimer:</strong> Trading OS is a personal trading intelligence terminal and quantitative strategy analysis platform. Trading OS is NOT a broker, financial advisor, signal-selling service, or automatic execution bot. Financial trading in cryptocurrencies, forex, equities, and commodities involves substantial risk of capital loss. Past performance simulation is not indicative of future market results.
        </p>
      </footer>
    </div>
  );
};
