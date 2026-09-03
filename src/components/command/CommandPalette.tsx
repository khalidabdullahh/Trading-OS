import React, { useState, useEffect } from "react";
import {
  Search,
  Zap,
  BarChart3,
  TrendingUp,
  Activity,
  ShieldCheck,
  Package,
  Calendar,
  Globe,
  BrainCircuit,
  Settings,
  HelpCircle,
  X,
  ArrowRight,
  Sliders,
  DollarSign
} from "lucide-react";
import { MarketDataProvider } from "../../services/market/marketDataProvider";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNav: (nav: string) => void;
  onSelectSymbol: (symbol: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectNav,
  onSelectSymbol
}) => {
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          setQuery("");
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const instruments = MarketDataProvider.INSTRUMENTS;
  const filteredInstruments = instruments.filter(
    i =>
      i.symbol.toLowerCase().includes(query.toLowerCase()) ||
      i.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const navigationCommands = [
    { title: "Dashboard", category: "Overview", icon: BarChart3 },
    { title: "Watchlists", category: "Markets", icon: Activity },
    { title: "Screener", category: "Markets", icon: Sliders },
    { title: "Charts & Backtest", category: "Markets", icon: TrendingUp },
    { title: "Economic Calendar", category: "Markets", icon: Calendar },
    { title: "Strategy Lab", category: "Trading", icon: Zap },
    { title: "Risk Center", category: "Trading", icon: ShieldCheck },
    { title: "Trade Journal", category: "Trading", icon: DollarSign },
    { title: "Portfolio", category: "Trading", icon: Package },
    { title: "Performance Analytics", category: "Analytics", icon: BarChart3 },
    { title: "AI Analyst", category: "Intelligence", icon: BrainCircuit },
    { title: "Settings", category: "System", icon: Settings }
  ].filter(
    n =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
        {/* Search Bar */}
        <div className="p-3.5 flex items-center gap-3">
          <Search className="h-5 w-5 text-cyan-500 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command, page, or instrument symbol (e.g. BTCUSDT, Risk Center, Journal)..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Instruments Group */}
          {filteredInstruments.length > 0 && (
            <div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Instruments & Markets
              </span>
              <div className="space-y-0.5 mt-1">
                {filteredInstruments.map(inst => (
                  <button
                    key={inst.symbol}
                    onClick={() => {
                      onSelectSymbol(inst.symbol);
                      onClose();
                    }}
                    className="w-full px-2.5 py-2 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-500 flex items-center justify-between text-xs font-mono transition text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{inst.symbol}</span>
                      <span className="text-slate-400 font-sans">{inst.name}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {inst.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Pages */}
          {navigationCommands.length > 0 && (
            <div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Pages & Workspaces
              </span>
              <div className="space-y-0.5 mt-1">
                {navigationCommands.map(cmd => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.title}
                      onClick={() => {
                        onSelectNav(cmd.title);
                        onClose();
                      }}
                      className="w-full px-2.5 py-2 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-500 flex items-center justify-between text-xs transition text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-cyan-500 shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{cmd.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{cmd.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredInstruments.length === 0 && navigationCommands.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400 italic">
              No matching commands or symbols found for "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-slate-50 dark:bg-[#050811] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">⌘K</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">ESC to exit</kbd>
          </div>
          <span>Trading-OS Command Center</span>
        </div>
      </div>
    </div>
  );
};
