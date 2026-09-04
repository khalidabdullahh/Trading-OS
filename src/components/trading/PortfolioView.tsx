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
  X,
  Edit2,
  Check,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { StorageAdapter } from "../../services/storage/storageAdapter";
import { TradingAccount } from "../../types/domain";

export const PortfolioView: React.FC = () => {
  const userId = StorageAdapter.getCurrentUserId();
  const [accounts, setAccounts] = useState<TradingAccount[]>(() =>
    StorageAdapter.getTradingAccounts(userId)
  );

  // Add Account Modal
  const [isAddAccountModal, setIsAddAccountModal] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newBroker, setNewBroker] = useState("Binance Futures");
  const [newBalance, setNewBalance] = useState("10000");

  // Edit Balance Modal
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);
  const [customBalanceInput, setCustomBalanceInput] = useState("");
  const [customEquityInput, setCustomEquityInput] = useState("");

  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalEquity = accounts.reduce((acc, a) => acc + a.equity, 0);

  const handleCreateAccount = () => {
    if (!newAccName.trim()) return;
    const initialCapital = parseFloat(newBalance) || 10000;
    const newAcc: TradingAccount = {
      id: `acc_${Date.now()}`,
      userId,
      name: newAccName.trim(),
      broker: newBroker,
      accountType: "LIVE",
      currency: "USD",
      balance: initialCapital,
      equity: initialCapital,
      isDefault: accounts.length === 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...accounts, newAcc];
    setAccounts(updated);
    StorageAdapter.saveTradingAccount(newAcc);
    setIsAddAccountModal(false);
    setNewAccName("");
    setNewBalance("10000");
  };

  const openEditModal = (acc: TradingAccount) => {
    setEditingAccount(acc);
    setCustomBalanceInput(acc.balance.toString());
    setCustomEquityInput(acc.equity.toString());
  };

  const handleSaveBalance = () => {
    if (!editingAccount) return;
    const bal = parseFloat(customBalanceInput) || 0;
    const eq = parseFloat(customEquityInput) || bal;

    const updatedAccount: TradingAccount = {
      ...editingAccount,
      balance: bal,
      equity: eq,
      updatedAt: new Date().toISOString()
    };

    const updatedList = accounts.map(a => a.id === editingAccount.id ? updatedAccount : a);
    setAccounts(updatedList);
    StorageAdapter.saveTradingAccount(updatedAccount);
    setEditingAccount(null);
  };

  const handleSetDefault = (accId: string) => {
    const updated = accounts.map(a => ({
      ...a,
      isDefault: a.id === accId
    }));
    setAccounts(updated);
    updated.forEach(a => StorageAdapter.saveTradingAccount(a));
  };

  const presetAmounts = [1000, 5000, 10000, 25000, 50000, 100000, 250000];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-500" />
              <span>Multi-Account Portfolio & Capital Manager</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              v2.01
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure custom trading capital, realized account balances, and multi-broker liquidity pools.
          </p>
        </div>

        <button
          onClick={() => setIsAddAccountModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Connect New Account</span>
        </button>
      </div>

      {/* Aggregate Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Total Aggregate Capital</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 font-sans">Across {accounts.length} connected trading accounts</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Total Realized Equity</span>
          <p className="text-2xl font-black text-cyan-500">
            ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 font-sans">Available execution buffer</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-1">
          <span className="text-slate-500 font-sans">Risk Center Allocation</span>
          <p className="text-2xl font-black text-emerald-500">100% Fully Buffered</p>
          <p className="text-[10px] text-slate-400 font-sans">Ready for systematic order placement</p>
        </div>
      </div>

      {/* Connected Accounts List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Connected Trading Accounts ({accounts.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-sans">Click "Edit Balance" to customize your funds</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {accounts.map(acc => (
            <div
              key={acc.id}
              className={`p-4 rounded-xl border transition space-y-3 ${
                acc.isDefault
                  ? "border-cyan-500/40 bg-cyan-500/5 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811]"
              }`}
            >
              <div className="flex items-center justify-between font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-100 font-black text-xs">
                    <Wallet className="h-4 w-4 text-cyan-500" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm flex items-center gap-1.5">
                      {acc.name}
                      {acc.isDefault && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                          PRIMARY
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">{acc.broker} • {acc.currency}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(acc)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 hover:text-cyan-400 border border-slate-300 dark:border-slate-700 transition cursor-pointer text-[11px] font-bold"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit Balance</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Cash Balance</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Total Realized Equity</span>
                  <span className="font-bold text-emerald-500 text-sm">
                    ${acc.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {!acc.isDefault && (
                <button
                  onClick={() => handleSetDefault(acc.id)}
                  className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 text-[11px] font-sans font-medium transition cursor-pointer"
                >
                  Set as Primary Execution Account
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Balance & Capital Modal */}
      {editingAccount && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingAccount(null);
          }}
        >
          <div className="min-h-full flex items-center justify-center p-3 sm:p-4 py-6">
            <div
              className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-xs font-sans my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setEditingAccount(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span>Customize Account Balance: {editingAccount.name}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Quick Capital Presets:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {presetAmounts.map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setCustomBalanceInput(amt.toString());
                          setCustomEquityInput(amt.toString());
                        }}
                        className={`py-1.5 rounded-lg border text-[11px] font-mono font-bold transition cursor-pointer ${
                          customBalanceInput === amt.toString()
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        ${amt >= 1000 ? `${amt / 1000}k` : amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Cash Balance ($ USD):</label>
                  <input
                    type="number"
                    step="100"
                    value={customBalanceInput}
                    onChange={e => setCustomBalanceInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-mono text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Total Equity ($ USD):</label>
                  <input
                    type="number"
                    step="100"
                    value={customEquityInput}
                    onChange={e => setCustomEquityInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-mono text-sm font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingAccount(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBalance}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl shadow cursor-pointer transition"
                >
                  Save Capital
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddAccountModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddAccountModal(false);
          }}
        >
          <div className="min-h-full flex items-center justify-center p-3 sm:p-4 py-6">
            <div
              className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-xs font-sans my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAddAccountModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                <Wallet className="h-4 w-4 text-cyan-500" />
                <span>Connect New Trading Account</span>
              </div>

              <div className="space-y-3 font-sans">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Account Label / Prop Firm:</label>
                  <input
                    type="text"
                    value={newAccName}
                    onChange={e => setNewAccName(e.target.value)}
                    placeholder="e.g. FTMO 100K Prop Challenge / Binance Futures"
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Broker / Data Feed:</label>
                  <input
                    type="text"
                    value={newBroker}
                    onChange={e => setNewBroker(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Starting Capital ($ USD):</label>
                  <input
                    type="number"
                    value={newBalance}
                    onChange={e => setNewBalance(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateAccount}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-sans text-xs rounded-xl shadow transition cursor-pointer"
              >
                Add Trading Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
