import React, { useState } from "react";
import {
  Package,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Wallet,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  X
} from "lucide-react";
import { StorageAdapter } from "../../services/storage/storageAdapter";
import { TradingAccount } from "../../types/domain";

export const PortfolioView: React.FC = () => {
  const userId = StorageAdapter.getCurrentUserId();
  const [accounts, setAccounts] = useState<TradingAccount[]>(() =>
    StorageAdapter.getTradingAccounts(userId)
  );
  const [isAddAccountModal, setIsAddAccountModal] = useState(false);

  // New Account Form
  const [newAccName, setNewAccName] = useState("");
  const [newBroker, setNewBroker] = useState("Binance / Institutional");
  const [newBalance, setNewBalance] = useState("10000");

  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalEquity = accounts.reduce((acc, a) => acc + a.equity, 0);

  const handleCreateAccount = () => {
    if (!newAccName.trim()) return;
    const newAcc: TradingAccount = {
      id: `acc_${Date.now()}`,
      userId,
      name: newAccName.trim(),
      broker: newBroker,
      accountType: "LIVE",
      currency: "USD",
      balance: parseFloat(newBalance) || 10000,
      equity: parseFloat(newBalance) || 10000,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...accounts, newAcc];
    setAccounts(updated);
    StorageAdapter.saveTradingAccount(newAcc);
    setIsAddAccountModal(false);
    setNewAccName("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="h-5 w-5 text-cyan-500" />
            <span>Institutional Portfolio & Multi-Account Manager</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time capital balance, margin utilization, and cross-account position aggregation.
          </p>
        </div>

        <button
          onClick={() => setIsAddAccountModal(true)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Connect New Account</span>
        </button>
      </div>

      {/* Aggregate Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Total Aggregate Balance</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 font-sans">Across {accounts.length} connected accounts</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Total Realized Equity</span>
          <p className="text-2xl font-black text-cyan-500">
            ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 font-sans">Free capital buffer available</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Portfolio Allocation Bias</span>
          <p className="text-2xl font-black text-emerald-500">60% Crypto / 40% FX</p>
          <p className="text-[10px] text-slate-400 font-sans">Cross-asset diversified</p>
        </div>
      </div>

      {/* Connected Accounts List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Connected Trading Accounts ({accounts.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {accounts.map(acc => (
            <div
              key={acc.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-3"
            >
              <div className="flex items-center justify-between font-sans">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">{acc.name}</span>
                  <span className="text-[11px] text-slate-400">{acc.broker}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  {acc.accountType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Cash Balance</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${acc.balance.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Total Equity</span>
                  <span className="font-bold text-emerald-500">${acc.equity.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-xs font-mono">
            <button
              onClick={() => setIsAddAccountModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2 font-sans font-bold text-slate-900 dark:text-slate-100 text-sm">
              <Wallet className="h-4 w-4 text-cyan-500" />
              <span>Connect Trading Account</span>
            </div>

            <div className="space-y-3 font-sans">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Account Label:</label>
                <input
                  type="text"
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  placeholder="e.g. Prop Firm Evaluation 100K"
                  className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Broker / Exchange Feed:</label>
                <input
                  type="text"
                  value={newBroker}
                  onChange={e => setNewBroker(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Starting Balance ($):</label>
                <input
                  type="number"
                  value={newBalance}
                  onChange={e => setNewBalance(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleCreateAccount}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-sans text-xs rounded-xl shadow transition cursor-pointer"
            >
              Add Trading Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
