import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  ChevronDown,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  Sliders,
  DollarSign
} from "lucide-react";
// @ts-ignore
import MarketAPI from "@/js/api.js";

interface MarketPairSelectorProps {
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export const MarketPairSelector: React.FC<MarketPairSelectorProps> = ({
  activeSymbol,
  onSelectSymbol
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supportedPairs: any[] = MarketAPI?.SUPPORTED_PAIRS || [
    { symbol: "BTCUSDT", name: "Bitcoin (BTC / USDT)", market: "CRYPTO", basePrice: 64200, category: "🪙 Crypto" },
    { symbol: "ETHUSDT", name: "Ethereum (ETH / USDT)", market: "CRYPTO", basePrice: 3450, category: "🪙 Crypto" },
    { symbol: "SOLUSDT", name: "Solana (SOL / USDT)", market: "CRYPTO", basePrice: 158, category: "🪙 Crypto" },
    { symbol: "BNBUSDT", name: "BNB (BNB / USDT)", market: "CRYPTO", basePrice: 585, category: "🪙 Crypto" },
    { symbol: "XRPUSDT", name: "Ripple (XRP / USDT)", market: "CRYPTO", basePrice: 0.62, category: "🪙 Crypto" },
    { symbol: "XAUUSD", name: "Gold Spot (XAU / USD)", market: "COMMODITIES", basePrice: 2510, category: "🏆 Commodities" },
    { symbol: "EURUSD", name: "EUR / USD (Euro vs Dollar)", market: "FOREX", basePrice: 1.0885, category: "💱 Forex" },
    { symbol: "GBPUSD", name: "GBP / USD (Pound vs Dollar)", market: "FOREX", basePrice: 1.2950, category: "💱 Forex" },
    { symbol: "USDJPY", name: "USD / JPY (Dollar vs Yen)", market: "FOREX", basePrice: 154.20, category: "💱 Forex" },
    { symbol: "NAS100", name: "Nasdaq 100 Index", market: "INDICES", basePrice: 19780, category: "📈 Indices" },
    { symbol: "SPX500", name: "S&P 500 Index", market: "INDICES", basePrice: 5650, category: "📈 Indices" },
    { symbol: "NVDA", name: "NVIDIA Corp.", market: "STOCKS", basePrice: 128.5, category: "🏢 US Stocks" },
    { symbol: "AAPL", name: "Apple Inc.", market: "STOCKS", basePrice: 228.0, category: "🏢 US Stocks" }
  ];

  const currentPair = supportedPairs.find(p => p.symbol === activeSymbol) || supportedPairs[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [
    { id: "ALL", label: "All Markets" },
    { id: "CRYPTO", label: "🪙 Crypto" },
    { id: "FOREX", label: "💱 Forex" },
    { id: "INDICES", label: "📈 Indices" },
    { id: "STOCKS", label: "🏢 Stocks" },
    { id: "COMMODITIES", label: "🏆 Metals & Oil" }
  ];

  const filteredPairs = supportedPairs.filter(pair => {
    const matchesCategory = selectedCategory === "ALL" || pair.market === selectedCategory;
    const matchesSearch =
      pair.symbol.toLowerCase().includes(search.toLowerCase()) ||
      pair.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090e1a] hover:border-cyan-500/50 text-slate-900 dark:text-slate-100 font-mono text-xs font-bold transition shadow-xs cursor-pointer group"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="group-hover:text-cyan-500 transition-colors">{currentPair.symbol}</span>
        </div>
        <span className="hidden md:inline text-[10px] text-slate-400 font-sans font-normal border-l border-slate-200 dark:border-slate-800 pl-2">
          {currentPair.category}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090e1a] shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-xs">
          {/* Search Bar */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search crypto, forex, gold, stocks..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-sans no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-cyan-500 text-slate-950 shadow-xs"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Pairs List */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 font-mono">
            {filteredPairs.length === 0 ? (
              <div className="p-4 text-center text-slate-400 font-sans text-xs">
                No matching instruments found.
              </div>
            ) : (
              filteredPairs.map(pair => {
                const isSelected = pair.symbol === activeSymbol;
                return (
                  <div
                    key={pair.symbol}
                    onClick={() => {
                      onSelectSymbol(pair.symbol);
                      setIsOpen(false);
                    }}
                    className={`p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer group ${
                      isSelected
                        ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition-colors">
                          {pair.symbol}
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans">{pair.name}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        ${pair.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </span>
                      <span className="text-[10px] text-emerald-500 font-bold font-sans">Live Feed</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
