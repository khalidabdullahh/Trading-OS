import React, { useState } from "react";
import {
  Settings,
  User as UserIcon,
  ShieldCheck,
  CreditCard,
  Sliders,
  CheckCircle2,
  Lock,
  Globe,
  Save,
  Key
} from "lucide-react";
import { StorageAdapter } from "../../services/storage/storageAdapter";
import { StrategyCompiler } from "../../services/strategyCompiler";
import { UserProfile, TradingPreferences, UserSubscription } from "../../types/domain";

export const SettingsView: React.FC = () => {
  const userId = StorageAdapter.getCurrentUserId();
  const [profile, setProfile] = useState<UserProfile>(() => StorageAdapter.getProfile(userId));
  const [preferences, setPreferences] = useState<TradingPreferences>(() =>
    StorageAdapter.getTradingPreferences(userId)
  );
  const [subscription, setSubscription] = useState<UserSubscription>(() =>
    StorageAdapter.getSubscription(userId)
  );
  const [apiKey, setApiKey] = useState(() => StrategyCompiler.getApiKey());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    StorageAdapter.saveProfile(profile);
    StorageAdapter.saveTradingPreferences(preferences);
    StorageAdapter.saveSubscription(subscription);
    if (apiKey) StrategyCompiler.setApiKey(apiKey);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="h-5 w-5 text-cyan-500" />
            <span>Terminal Settings, User Profile & Subscription</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure system preferences, user authorization, risk defaults, and API integrations.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer active:scale-95 font-sans"
        >
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{saved ? "Settings Saved ✓" : "Save All Configurations"}</span>
        </button>
      </div>

      {/* Grid: Profile & Risk Defaults */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile Card */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4 font-sans">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-cyan-500" />
            <span>User Profile & Identification</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Full Trader Name:</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Country / Region:</label>
              <input
                type="text"
                value={profile.country || ""}
                onChange={e => setProfile({ ...profile, country: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Trading Experience Tier:</label>
              <select
                value={profile.experience || "Intermediate"}
                onChange={e => setProfile({ ...profile, experience: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="Beginner">Beginner (&lt; 1 Year)</option>
                <option value="Intermediate">Intermediate (1 - 3 Years)</option>
                <option value="Advanced">Advanced (3 - 5 Years)</option>
                <option value="Institutional">Institutional / Prop Desk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trading Preferences Card */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4 font-sans">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-500" />
            <span>Default Sizing & Risk Preferences</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Default Account Currency:</label>
              <input
                type="text"
                value={preferences.defaultCurrency}
                onChange={e => setPreferences({ ...preferences, defaultCurrency: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Default Stop Loss (%):</label>
              <input
                type="number"
                step="0.1"
                value={preferences.defaultStopLossPct}
                onChange={e => setPreferences({ ...preferences, defaultStopLossPct: parseFloat(e.target.value) || 1.5 })}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Default Take Profit (%):</label>
              <input
                type="number"
                step="0.1"
                value={preferences.defaultTakeProfitPct}
                onChange={e => setPreferences({ ...preferences, defaultTakeProfitPct: parseFloat(e.target.value) || 3.0 })}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Tiering & API Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Plan Card */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4 font-sans">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <span>SaaS Subscription Plan</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono font-bold text-[10px]">
              {subscription.tier} ACTIVE
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Pro License Entitlement</span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Full access to Natural Language Strategy Compiler, Context-Aware AI Analyst, Rule Violation Engine, and Pine Script Exporter.
              </p>
            </div>

            <div className="flex gap-2">
              {(["FREE", "PRO", "ELITE"] as const).map(tier => (
                <button
                  key={tier}
                  onClick={() => setSubscription({ ...subscription, tier })}
                  className={`flex-1 py-2 rounded-xl border font-bold text-xs transition cursor-pointer ${
                    subscription.tier === tier
                      ? "bg-cyan-500 text-slate-950 border-cyan-500 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* API Keys Card */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4 font-sans">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Key className="h-4 w-4 text-amber-500" />
            <span>AI Provider & Server Keys</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">
                Google Gemini 1.5 Flash API Key:
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used for deterministic structured JSON Strategy AST compilation and AI reasoning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
