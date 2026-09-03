import React, { useState, useEffect } from "react";
import {
  Sliders,
  Play,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  Zap
} from "lucide-react";
import { ScreenerService, ScreenerResult, ScreenerFilter } from "../../services/market/screenerService";

interface ScreenerViewProps {
  onSelectSymbol: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

export const ScreenerView: React.FC<ScreenerViewProps> = ({
  onSelectSymbol,
  onOpenChart
}) => {
  const [category, setCategory] = useState<string>("ALL");
  const [rsiFilter, setRsiFilter] = useState<"all" | "oversold" | "overbought">("all");
  const [emaFilter, setEmaFilter] = useState<"any" | "above" | "below">("any");
  const [trendFilter, setTrendFilter] = useState<"any" | "BULLISH" | "BEARISH">("any");

  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScreenerResult[]>([]);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const filters: ScreenerFilter = {
        category,
        priceVsEma200: emaFilter,
        trend: trendFilter
      };

      if (rsiFilter === "oversold") filters.rsiMax = 35;
      else if (rsiFilter === "overbought") filters.rsiMin = 65;

      const scanResults = await ScreenerService.scan(filters);
      setResults(scanResults);
    } catch (e) {
      console.error("Screener execution error:", e);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    handleRunScan();
  }, [category, rsiFilter, emaFilter, trendFilter]);

  return (
    <div className="space-y-6">
      {/* Top Filter Header */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-cyan-500" />
              <span>Quantitative Multi-Asset Screener</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scan across global asset classes for momentum confluences, oversold RSI bounces, and 200 EMA trend alignment.
            </p>
          </div>

          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Scanning..." : "Execute Scan"}</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Asset Category */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
              Asset Category:
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="ALL">All Asset Classes</option>
              <option value="CRYPTO">🪙 Crypto (Binance)</option>
              <option value="FOREX">💱 Forex Majors & Crosses</option>
              <option value="INDICES">📈 Global Stock Indices</option>
              <option value="STOCKS">🏢 Blue-Chip US Stocks</option>
              <option value="COMMODITIES">🏆 Metals & Energy</option>
            </select>
          </div>

          {/* RSI Condition */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
              RSI (14) Condition:
            </label>
            <select
              value={rsiFilter}
              onChange={e => setRsiFilter(e.target.value as any)}
              className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="all">Any RSI Level</option>
              <option value="oversold">🟢 Oversold (RSI &lt; 35)</option>
              <option value="overbought">🔴 Overbought (RSI &gt; 65)</option>
            </select>
          </div>

          {/* Price vs 200 EMA */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
              Price vs 200 EMA:
            </label>
            <select
              value={emaFilter}
              onChange={e => setEmaFilter(e.target.value as any)}
              className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="any">Any Position</option>
              <option value="above">🟢 Price &gt; 200 EMA (Bullish Macro)</option>
              <option value="below">🔴 Price &lt; 200 EMA (Bearish Macro)</option>
            </select>
          </div>

          {/* Trend Bias */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
              Momentum Trend:
            </label>
            <select
              value={trendFilter}
              onChange={e => setTrendFilter(e.target.value as any)}
              className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="any">Any Trend</option>
              <option value="BULLISH">🟢 Bullish Momentum</option>
              <option value="BEARISH">🔴 Bearish Momentum</option>
            </select>
          </div>
        </div>
      </div>

      {/* Screener Results Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Scanned Opportunities ({results.length} Matches)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">15m Interval Resolution</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Symbol</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">24h Change</th>
                <th className="p-3">RSI (14)</th>
                <th className="p-3">200 EMA</th>
                <th className="p-3">Trend</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono text-xs">
              {results.length > 0 ? (
                results.map(r => {
                  const isUp = r.change24hPct >= 0;
                  return (
                    <tr
                      key={r.symbol}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{r.symbol}</span>
                        <span className="text-[11px] text-slate-400 font-sans font-normal hidden sm:inline">
                          {r.name}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {r.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                        ${r.price.toFixed(r.price < 2 ? 4 : 2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            isUp ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                          <span>{isUp ? "+" : ""}{r.change24hPct.toFixed(2)}%</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${r.rsi > 65 ? "text-rose-400" : (r.rsi < 35 ? "text-emerald-400" : "text-slate-300")}`}>
                          {r.rsi}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">
                        ${r.ema200} ({r.priceVsEma})
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.trend === "BULLISH"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : r.trend === "BEARISH"
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          }`}
                        >
                          {r.trend}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            onSelectSymbol(r.symbol);
                            onOpenChart(r.symbol);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-600 dark:text-cyan-400 text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>Open Chart</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    {isScanning ? "Scanning global markets..." : "No instruments match the selected screener filters."}
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
