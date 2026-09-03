import React, { useState } from "react";
import {
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Globe,
  Sliders,
  Sparkles,
  Lock,
  Plus,
  Trash2
} from "lucide-react";
import { StorageAdapter } from "../../services/storage/storageAdapter";
import { TradingPlan } from "../../types/domain";

export const TradingPlanView: React.FC = () => {
  const [plan, setPlan] = useState<TradingPlan>(() => StorageAdapter.getTradingPlan());
  const [saved, setSaved] = useState(false);

  const [newForbiddenRule, setNewForbiddenRule] = useState("");
  const [newEntryCriterion, setNewEntryCriterion] = useState("");

  const handleSave = () => {
    StorageAdapter.saveTradingPlan(plan);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleSession = (session: string) => {
    const current = plan.allowedSessions || [];
    const updated = current.includes(session)
      ? current.filter(s => s !== session)
      : [...current, session];
    setPlan({ ...plan, allowedSessions: updated });
  };

  const toggleMarket = (market: string) => {
    const current = plan.allowedMarkets || [];
    const updated = current.includes(market)
      ? current.filter(m => m !== market)
      : [...current, market];
    setPlan({ ...plan, allowedMarkets: updated });
  };

  const handleAddForbidden = () => {
    if (!newForbiddenRule.trim()) return;
    setPlan({
      ...plan,
      forbiddenRules: [...(plan.forbiddenRules || []), newForbiddenRule.trim()]
    });
    setNewForbiddenRule("");
  };

  const handleRemoveForbidden = (idx: number) => {
    const updated = [...(plan.forbiddenRules || [])];
    updated.splice(idx, 1);
    setPlan({ ...plan, forbiddenRules: updated });
  };

  const handleAddEntryCrit = () => {
    if (!newEntryCriterion.trim()) return;
    setPlan({
      ...plan,
      entryCriteria: [...(plan.entryCriteria || []), newEntryCriterion.trim()]
    });
    setNewEntryCriterion("");
  };

  const handleRemoveEntryCrit = (idx: number) => {
    const updated = [...(plan.entryCriteria || [])];
    updated.splice(idx, 1);
    setPlan({ ...plan, entryCriteria: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-500" />
              <span>Personal Trading Constitution & Plan</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
              ACTIVE ENFORCEMENT
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your foundational risk boundaries, authorized sessions, and non-negotiable rules audited by the Rule Violation Engine.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{saved ? "Constitution Saved ✓" : "Save Trading Plan"}</span>
        </button>
      </div>

      {/* Grid of Constitution Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Card 1: Core Mathematical Risk Rules */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
            <Sliders className="h-4 w-4 text-cyan-500" />
            <span>1. Core Mathematical Risk Limits</span>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Maximum Risk Per Trade:
                </label>
                <span className="font-mono font-bold text-cyan-500">{plan.maxRiskPerTradePct}%</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="3.0"
                step="0.25"
                value={plan.maxRiskPerTradePct}
                onChange={e => setPlan({ ...plan, maxRiskPerTradePct: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Institutional standard: 1.0% account equity maximum.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Maximum Daily Loss Threshold:
                </label>
                <span className="font-mono font-bold text-rose-500">{plan.maxDailyLossPct}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.5"
                value={plan.maxDailyLossPct}
                onChange={e => setPlan({ ...plan, maxDailyLossPct: parseFloat(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Automatic system flag if daily loss exceeds this limit.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Maximum Executions Per Day:
                </label>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{plan.maxTradesPerDay} Trades</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={plan.maxTradesPerDay}
                onChange={e => setPlan({ ...plan, maxTradesPerDay: parseInt(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Prevents overtrading and fatigue during high volatility.</p>
            </div>
          </div>
        </div>

        {/* Card 2: Authorized Sessions & Markets */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
            <Clock className="h-4 w-4 text-cyan-500" />
            <span>2. Authorized Market Sessions & Asset Classes</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Authorized Trading Sessions:
              </label>
              <div className="grid grid-cols-2 gap-2 font-mono">
                {["London", "New York", "London / NY Overlap", "Asian"].map(sess => {
                  const isChecked = plan.allowedSessions?.includes(sess);
                  return (
                    <button
                      key={sess}
                      onClick={() => toggleSession(sess)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isChecked
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-500 font-bold"
                          : "bg-slate-50 dark:bg-[#050811] border-slate-200 dark:border-slate-800 text-slate-400"
                      }`}
                    >
                      <span>{sess}</span>
                      {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Allowed Asset Classes:
              </label>
              <div className="grid grid-cols-2 gap-2 font-mono">
                {["Crypto", "Forex", "Indices", "Commodities"].map(mkt => {
                  const isChecked = plan.allowedMarkets?.includes(mkt);
                  return (
                    <button
                      key={mkt}
                      onClick={() => toggleMarket(mkt)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isChecked
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500 font-bold"
                          : "bg-slate-50 dark:bg-[#050811] border-slate-200 dark:border-slate-800 text-slate-400"
                      }`}
                    >
                      <span>{mkt}</span>
                      {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Non-Negotiable Entry Criteria */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span>3. Mandatory Entry & Execution Criteria</span>
          </div>

          <div className="space-y-2">
            {plan.entryCriteria?.map((crit, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{crit}</span>
                </div>
                <button
                  onClick={() => handleRemoveEntryCrit(idx)}
                  className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newEntryCriterion}
                onChange={e => setNewEntryCriterion(e.target.value)}
                placeholder="e.g. Wait for 5-minute candle close confirmation..."
                className="flex-1 p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={handleAddEntryCrit}
                className="px-3 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Strictly Forbidden Behaviors */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2 font-bold text-rose-500">
            <AlertTriangle className="h-4 w-4" />
            <span>4. Strictly Forbidden Psychological Behaviors</span>
          </div>

          <div className="space-y-2">
            {plan.forbiddenRules?.map((rule, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{rule}</span>
                </div>
                <button
                  onClick={() => handleRemoveForbidden(idx)}
                  className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newForbiddenRule}
                onChange={e => setNewForbiddenRule(e.target.value)}
                placeholder="e.g. Never move stop loss in losing direction..."
                className="flex-1 p-2 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={handleAddForbidden}
                className="px-3 py-2 bg-rose-500 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
