import React, { useState } from "react";
import {
  DollarSign,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  FileText,
  CheckCircle2,
  X,
  Sparkles
} from "lucide-react";
import { StorageAdapter } from "../../services/storage/storageAdapter";
import { CSVService } from "../../services/trading/csvService";
import { Trade, JournalEntry } from "../../types/domain";

export const TradeJournalView: React.FC = () => {
  const userId = StorageAdapter.getCurrentUserId();
  const [trades, setTrades] = useState<Trade[]>(() => StorageAdapter.getTrades(userId));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() =>
    StorageAdapter.getJournalEntries(userId)
  );
  const [filterSession, setFilterSession] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Trade Form State
  const [newSymbol, setNewSymbol] = useState("BTCUSDT");
  const [newDirection, setNewDirection] = useState<"LONG" | "SHORT">("LONG");
  const [newEntryPrice, setNewEntryPrice] = useState("64000");
  const [newExitPrice, setNewExitPrice] = useState("65920");
  const [newQuantity, setNewQuantity] = useState("0.15");
  const [newSession, setNewSession] = useState<"London" | "New York" | "Asian">("London");
  const [newSetup, setNewSetup] = useState("3-Candle Confirmation");
  const [newNotes, setNewNotes] = useState("");

  const handleExportCSV = () => {
    const csv = CSVService.exportTradesToCSV(trades);
    CSVService.downloadCSV(csv, `trading_os_trades_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (!text) return;

      const res = CSVService.parseTradesCSV(text, userId, `acc_${userId}_primary`);
      if (res.success && res.trades.length > 0) {
        const merged = [...res.trades, ...trades];
        setTrades(merged);
        StorageAdapter.saveTrades(merged, userId);
      }
    };
    reader.readAsText(file);
  };

  const handleCreateTrade = () => {
    const entry = parseFloat(newEntryPrice) || 0;
    const exit = parseFloat(newExitPrice) || entry;
    const qty = parseFloat(newQuantity) || 1.0;

    const pnl = newDirection === "LONG" ? (exit - entry) * qty : (entry - exit) * qty;
    const pnlPct = +(((exit - entry) / entry) * 100).toFixed(2);

    const trade: Trade = {
      id: `trd_${Date.now()}`,
      userId,
      accountId: `acc_${userId}_primary`,
      symbol: newSymbol.toUpperCase(),
      direction: newDirection,
      status: "CLOSED",
      entryPrice: entry,
      exitPrice: exit,
      quantity: qty,
      fee: 4.5,
      netPnl: +pnl.toFixed(2),
      netPnlPct: newDirection === "LONG" ? pnlPct : -pnlPct,
      rMultiple: pnl > 0 ? 2.0 : -1.0,
      session: newSession,
      setupType: newSetup,
      entryTime: new Date().toISOString(),
      exitTime: new Date().toISOString(),
      exitReason: pnl > 0 ? "Target Profit Reached 🎯" : "Stop Loss Hit 🛑",
      ruleAdherence: true,
      emotionState: "Calm",
      notes: newNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [trade, ...trades];
    setTrades(updated);
    StorageAdapter.saveTrades(updated, userId);
    setIsAddModalOpen(false);
  };

  const handleDeleteTrade = (id: string) => {
    const updated = trades.filter(t => t.id !== id);
    setTrades(updated);
    StorageAdapter.saveTrades(updated, userId);
  };

  const filteredTrades = trades.filter(t => {
    if (filterSession !== "ALL" && t.session?.toLowerCase() !== filterSession.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-cyan-500" />
            <span>Institutional Trade Journal & Execution Log</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record, audit, and analyze every historical execution with session tags, psychology, and rule compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Log New Trade</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Export Trades as CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <label className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer">
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
        </div>
      </div>

      {/* Trades Table Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Historical Executions ({filteredTrades.length} Trades)
          </span>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Session:</span>
            <select
              value={filterSession}
              onChange={e => setFilterSession(e.target.value)}
              className="p-1 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none text-slate-900 dark:text-slate-100 font-mono"
            >
              <option value="ALL">All Sessions</option>
              <option value="London">London</option>
              <option value="New York">New York</option>
              <option value="Asian">Asian</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Trade ID</th>
                <th className="p-3">Symbol</th>
                <th className="p-3">Direction</th>
                <th className="p-3">Entry</th>
                <th className="p-3">Exit</th>
                <th className="p-3">Net PnL ($)</th>
                <th className="p-3">R:R</th>
                <th className="p-3">Session</th>
                <th className="p-3">Setup</th>
                <th className="p-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono text-xs">
              {filteredTrades.length > 0 ? (
                filteredTrades.map(t => {
                  const isUp = t.netPnl >= 0;
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-3 text-slate-400">{t.id}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{t.symbol}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.direction === "LONG"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {t.direction}
                        </span>
                      </td>
                      <td className="p-3">${t.entryPrice?.toFixed(2)}</td>
                      <td className="p-3">${t.exitPrice?.toFixed(2)}</td>
                      <td
                        className={`p-3 font-bold ${
                          isUp ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {isUp ? "+" : ""}${t.netPnl.toFixed(2)} ({isUp ? "+" : ""}{t.netPnlPct.toFixed(2)}%)
                      </td>
                      <td className="p-3 text-cyan-500 font-bold">
                        {t.rMultiple ? `${t.rMultiple}R` : "1.5R"}
                      </td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-300">
                          {t.session || "London"}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-400 text-[11px]">{t.setupType || "AST Trigger"}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteTrade(t.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                    No trades recorded yet. Click "Log New Trade" or run a strategy simulation!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Trade Entry Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="min-h-full flex items-center justify-center p-3 sm:p-4 py-6">
            <div
              className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-xs font-mono my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2 font-sans font-bold text-slate-900 dark:text-slate-100 text-sm">
              <DollarSign className="h-4 w-4 text-cyan-500" />
              <span>Record Trade Execution in Journal</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-sans text-slate-500 dark:text-slate-400 mb-1">Symbol:</label>
                <input
                  type="text"
                  value={newSymbol}
                  onChange={e => setNewSymbol(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-slate-500 dark:text-slate-400 mb-1">Direction:</label>
                  <select
                    value={newDirection}
                    onChange={e => setNewDirection(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="LONG">LONG (Buy)</option>
                    <option value="SHORT">SHORT (Sell)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-slate-500 dark:text-slate-400 mb-1">Session:</label>
                  <select
                    value={newSession}
                    onChange={e => setNewSession(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="London">London</option>
                    <option value="New York">New York</option>
                    <option value="Asian">Asian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-slate-500 dark:text-slate-400 mb-1">Entry Price ($):</label>
                  <input
                    type="number"
                    value={newEntryPrice}
                    onChange={e => setNewEntryPrice(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-sans text-slate-500 dark:text-slate-400 mb-1">Exit Price ($):</label>
                  <input
                    type="number"
                    value={newExitPrice}
                    onChange={e => setNewExitPrice(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-slate-500 dark:text-slate-400 mb-1">Setup Tag / Strategy:</label>
                <input
                  type="text"
                  value={newSetup}
                  onChange={e => setNewSetup(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block font-sans text-slate-500 dark:text-slate-400 mb-1">Journal Notes:</label>
                <textarea
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="Describe your market context and emotion..."
                  className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-sans"
                />
              </div>
            </div>

            <button
              onClick={handleCreateTrade}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-sans text-xs rounded-xl shadow transition cursor-pointer"
            >
              Save Trade to Journal
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
