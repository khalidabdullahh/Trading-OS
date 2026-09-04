import React, { useState, useRef } from "react";
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
  Camera,
  Trash2,
  Sparkles,
  Cpu,
  Server,
  Key
} from "lucide-react";
import { StorageAdapter } from "../../services/storage/storageAdapter";
import { ApiClient } from "../../services/api/apiClient";
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
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setProfile((prev) => ({ ...prev, avatarUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfile((prev) => ({ ...prev, avatarUrl: undefined }));
  };

  const handleSave = async () => {
    StorageAdapter.saveProfile(profile);
    StorageAdapter.saveTradingPreferences(preferences);
    StorageAdapter.saveSubscription(subscription);

    // Update active user in storage
    const users = StorageAdapter.getUsers();
    const existing = users.find((u) => u.id === userId);
    if (existing) {
      existing.fullName = profile.fullName;
      StorageAdapter.saveUser(existing);
    }

    // Broadcast instant profile update to sidebar, header, and mobile menus
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trading_os_profile_updated", { detail: profile }));
    }

    // Sync with Neon PostgreSQL in the background
    ApiClient.updateProfile({
      userId,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      experience: profile.experience,
      country: profile.country
    }).catch((err) => console.warn("Background profile sync error:", err));

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isSuperAdmin =
    profile.fullName?.toLowerCase().includes("seamafridi") ||
    profile.fullName?.toLowerCase().includes("khalid") ||
    userId.includes("seamafridi") ||
    userId.includes("khalid");

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="h-5 w-5 text-cyan-500" />
              <span>Terminal Settings & User Account</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              v2.01
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your trader profile, photo, execution defaults, and server intelligence settings.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer active:scale-95 font-sans"
        >
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{saved ? "Changes Saved ✓" : "Save All Configurations"}</span>
        </button>
      </div>

      {/* Grid: Profile & Risk Defaults */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile Card with Photo Upload */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4 font-sans">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-cyan-500" />
              <span>Trader Profile & Identification</span>
            </span>
            {isSuperAdmin && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-400 border border-amber-400/50">
                👑 SUPER ADMIN
              </span>
            )}
          </div>

          {/* Photo Upload Section */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800/60">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl overflow-hidden shadow-md border-2 border-cyan-500/40">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile.fullName?.charAt(0)?.toUpperCase() || "T"}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition cursor-pointer text-white"
                title="Upload custom photo"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">Profile Picture</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Upload JPG, PNG or WebP image (up to 5MB)
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30 text-[11px] font-bold cursor-pointer transition"
                >
                  Upload Photo
                </button>
                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-[11px] cursor-pointer transition"
                    title="Remove photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Full Trader Name:</label>
              <input
                type="text"
                value={profile.fullName}
                placeholder="e.g. Khalid Abdullah"
                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Trader Bio / Strategy Style:</label>
              <input
                type="text"
                value={profile.bio || ""}
                placeholder="e.g. Systematic Quant Trader & Momentum Breakout Specialist"
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
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
                <option value="Institutional">Institutional / Prop Desk Manager</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trading Preferences Card */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4 font-sans">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-500" />
            <span>Default Risk & Execution Preferences</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Default Account Base Currency:</label>
              <input
                type="text"
                value={preferences.defaultCurrency}
                onChange={e => setPreferences({ ...preferences, defaultCurrency: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Default Risk Per Trade (% of Equity):</label>
              <input
                type="number"
                step="0.1"
                value={preferences.defaultRiskPct || 1.0}
                onChange={e => setPreferences({ ...preferences, defaultRiskPct: parseFloat(e.target.value) || 1.0 })}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Default Stop Loss Buffer (%):</label>
              <input
                type="number"
                step="0.1"
                value={preferences.defaultStopLossPct}
                onChange={e => setPreferences({ ...preferences, defaultStopLossPct: parseFloat(e.target.value) || 1.5 })}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Default Take Profit Target (%):</label>
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

      {/* Subscription Tiering & Server Intelligence Status */}
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
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                {subscription.tier === "ELITE" ? "💎 Elite Institutional Access" : "⚡ Pro Trader Entitlement"}
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Full deterministic Strategy AST Compiler, Context-Aware Macro AI Analyst, Multi-Market Screener, and automated Pine Script v5 code exporter.
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

        {/* Server-Side AI Intelligence Engine Status */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-4 font-sans">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-500" />
              <span>Server-Side AI Intelligence Engine</span>
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ONLINE
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">AI Compiler Architecture</span>
                <span className="font-mono text-[11px] text-cyan-400 font-bold">Gemini 2.0 Pro / Flash</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                The AI Reasoning Engine is pre-configured and managed securely by the Trading OS server infrastructure. End-users receive instant deterministic natural language AST compilation without needing personal API keys.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans">Compiler Latency</span>
                <span className="font-bold text-emerald-400">~280ms Average</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans">AST Type Safety</span>
                <span className="font-bold text-cyan-400">100% Deterministic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
