import React, { useState } from "react";
import {
  Activity,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Layers
} from "lucide-react";
import { StorageAdapter } from "../../services/storage/storageAdapter";
import { MarketDataProvider } from "../../services/market/marketDataProvider";
import { Watchlist, WatchlistItem } from "../../types/domain";

interface WatchlistsViewProps {
  onSelectSymbol: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

export const WatchlistsView: React.FC<WatchlistsViewProps> = ({
  onSelectSymbol,
  onOpenChart
}) => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>(() => StorageAdapter.getWatchlists());
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>(
    watchlists[0]?.id || "wl_main"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];

  const handleAddSymbol = (symbol: string) => {
    const inst = MarketDataProvider.INSTRUMENTS.find(i => i.symbol === symbol);
    if (!inst || !activeWatchlist) return;

    if (activeWatchlist.items.some(it => it.symbol === symbol)) return;

    const newItem: WatchlistItem = {
      id: `wli_${Date.now()}`,
      watchlistId: activeWatchlist.id,
      instrumentId: inst.id,
      symbol: inst.symbol,
      name: inst.name,
      category: inst.category,
      price: inst.basePrice,
      change24h: +(inst.basePrice * 0.015).toFixed(2),
      change24hPct: 1.5,
      volume24h: 45000000,
      rsi: 54.0,
      atr: +(inst.basePrice * 0.02).toFixed(2),
      trend: "BULLISH",
      sortOrder: activeWatchlist.items.length
    };

    const updated = watchlists.map(w => {
      if (w.id === activeWatchlist.id) {
        return { ...w, items: [...w.items, newItem] };
      }
      return w;
    });

    setWatchlists(updated);
    StorageAdapter.saveWatchlists(updated);
  };

  const handleRemoveItem = (itemId: string) => {
    if (!activeWatchlist) return;
    const updated = watchlists.map(w => {
      if (w.id === activeWatchlist.id) {
        return { ...w, items: w.items.filter(it => it.id !== itemId) };
      }
      return w;
    });
    setWatchlists(updated);
    StorageAdapter.saveWatchlists(updated);
  };

  const filteredInstruments = MarketDataProvider.INSTRUMENTS.filter(
    i =>
      i.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-500" />
            <span>Multi-Asset Institutional Watchlists</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time market monitors across Crypto, Forex, Indices, Commodities, and Blue-Chip US Stocks.
          </p>
        </div>

        {/* Search Quick Add */}
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search & Add Symbol..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-slate-100 font-mono"
          />

          {searchQuery && (
            <div className="absolute left-0 right-0 top-11 bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 p-1 space-y-0.5 max-h-56 overflow-y-auto font-mono text-xs">
              {filteredInstruments.map(inst => (
                <button
                  key={inst.symbol}
                  onClick={() => {
                    handleAddSymbol(inst.symbol);
                    setSearchQuery("");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-500 flex items-center justify-between transition cursor-pointer text-left"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{inst.symbol}</span>
                    <span className="text-[10px] text-slate-400 font-sans">{inst.name}</span>
                  </div>
                  <Plus className="h-3.5 w-3.5 text-cyan-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Watchlist Table Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Symbol</th>
                <th className="p-3">Asset Class</th>
                <th className="p-3">Last Price</th>
                <th className="p-3">24h Change</th>
                <th className="p-3">RSI (14)</th>
                <th className="p-3">ATR</th>
                <th className="p-3">Trend Bias</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono text-xs">
              {activeWatchlist?.items && activeWatchlist.items.length > 0 ? (
                activeWatchlist.items.map(item => {
                  const isUp = item.change24hPct >= 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{item.symbol}</span>
                        <span className="text-[11px] text-slate-400 font-sans font-normal hidden sm:inline">
                          {item.name}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                        ${item.price.toFixed(item.price < 2 ? 4 : 2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            isUp ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                          <span>{isUp ? "+" : ""}{item.change24hPct.toFixed(2)}%</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        <span className={item.rsi && item.rsi > 70 ? "text-rose-400 font-bold" : (item.rsi && item.rsi < 30 ? "text-emerald-400 font-bold" : "")}>
                          {item.rsi || 50.0}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">
                        {item.atr || 0.0}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.trend === "BULLISH"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : item.trend === "BEARISH"
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          }`}
                        >
                          {item.trend || "NEUTRAL"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              onSelectSymbol(item.symbol);
                              onOpenChart(item.symbol);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-600 dark:text-cyan-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span>Chart</span>
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Remove from watchlist"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    No instruments in this watchlist. Search and add symbols above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
