import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { AuthService } from "../../services/auth/authService";
import { ApiClient } from "../../services/api/apiClient";
import { StorageAdapter } from "../../services/storage/storageAdapter";
import { TradingOSLogo } from "../brand/TradingOSLogo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  initialMode?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = "register"
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setMode(initialMode);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      try {
        window.history.pushState({ modal: "auth" }, "");
      } catch (e) {}

      const handlePopState = () => {
        onClose();
      };
      window.addEventListener("popstate", handlePopState);

      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const isAdminEmail = cleanEmail.includes("seamafridi") || cleanEmail.includes("khalid");

      if (mode === "register") {
        if (!fullName.trim() && !isAdminEmail) {
          setError("Please enter your full name.");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setIsLoading(false);
          return;
        }

        const nameToSave = fullName.trim() || (isAdminEmail ? "Khalid Abdullah (Super Admin)" : cleanEmail.split("@")[0]);

        // 1. Try server-side PostgreSQL registration
        try {
          const serverRes = await ApiClient.register(cleanEmail, password, nameToSave);
          if (serverRes && serverRes.token) {
            ApiClient.setToken(serverRes.token);
            StorageAdapter.setCurrentUserId(serverRes.user.id);
            setSuccessMessage(isAdminEmail ? "👑 Super Admin Verified in Neon PostgreSQL!" : "Account created successfully!");
            setTimeout(() => {
              onAuthSuccess(serverRes.user);
              onClose();
            }, 700);
            return;
          }
        } catch (serverErr) {
          // Fallback to local storage auth
        }

        // 2. Local fallback registration
        const localRes = await AuthService.register(cleanEmail, password, nameToSave);
        if (localRes.success && localRes.user) {
          setSuccessMessage(isAdminEmail ? "👑 Welcome Super Admin!" : "Account registered successfully!");
          setTimeout(() => {
            onAuthSuccess(localRes.user);
            onClose();
          }, 700);
        } else {
          setError(localRes.error || "Registration failed. Please try again.");
        }
      } else {
        // Login Flow
        try {
          const serverRes = await ApiClient.login(cleanEmail, password);
          if (serverRes && serverRes.token) {
            ApiClient.setToken(serverRes.token);
            StorageAdapter.setCurrentUserId(serverRes.user.id);
            setSuccessMessage(isAdminEmail ? "👑 Super Admin Access Granted!" : "Logged in successfully!");
            setTimeout(() => {
              onAuthSuccess(serverRes.user);
              onClose();
            }, 700);
            return;
          }
        } catch (serverErr) {
          // Fallback to local storage auth
        }

        const localRes = await AuthService.login(cleanEmail, password);
        if (localRes.success && localRes.user) {
          setSuccessMessage(isAdminEmail ? "👑 Welcome Super Admin!" : "Welcome back!");
          setTimeout(() => {
            onAuthSuccess(localRes.user);
            onClose();
          }, 700);
        } else {
          setError(localRes.error || "Invalid email or password.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Direct Google OAuth 2.0 Authorization Code Redirect Flow
    // Guarantees Google Accounts selection screen opens directly across all browsers (Safari, Chrome, iOS)
    window.location.href = `/api/auth/google?returnUrl=${encodeURIComponent(window.location.pathname)}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 py-6">
        <div
          className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-xs font-sans my-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-5">
          <div className="flex justify-center">
            <TradingOSLogo className="w-12 h-12" glow={true} />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            {mode === "login" ? "Sign In to Trading-OS" : "Create Trader Account"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            {mode === "login"
              ? "Access your saved strategies, active trading accounts, and trade journal."
              : "Register for free access to charts, backtesting, and systematic risk management."}
          </p>
        </div>

        {/* Tabs: Create Account vs Sign In */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-[#050811] p-1 border border-slate-200 dark:border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
              mode === "register"
                ? "bg-white dark:bg-[#090e1a] text-cyan-500 dark:text-cyan-400 shadow-xs"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
              mode === "login"
                ? "bg-white dark:bg-[#090e1a] text-cyan-500 dark:text-cyan-400 shadow-xs"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center py-1.5">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-[#090e1a] px-3 text-[10px] text-slate-400 font-mono uppercase tracking-wider absolute">
              or with email
            </span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3 mt-2">
          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative">
                <UserIcon className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Khalid Abdullah"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  required={mode === "register"}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. khalid@tradingos.io"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
          >
            {isLoading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                <span>{mode === "login" ? "Sign In to Terminal" : "Create Free Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  </div>
);
};
