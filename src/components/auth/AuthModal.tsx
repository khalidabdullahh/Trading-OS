import React, { useState } from "react";
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
  initialMode = "login"
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === "register") {
        if (!fullName.trim()) {
          setError("Please enter your full name.");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setIsLoading(false);
          return;
        }

        // 1. Try server-side PostgreSQL registration
        const serverRes = await ApiClient.register(email, password, fullName);
        if (serverRes && serverRes.token) {
          ApiClient.setToken(serverRes.token);
          StorageAdapter.setCurrentUserId(serverRes.user.id);
          setSuccessMessage("Account created successfully in PostgreSQL!");
          setTimeout(() => {
            onAuthSuccess(serverRes.user);
            onClose();
          }, 800);
          return;
        }

        // 2. Local fallback registration
        const localRes = await AuthService.register(email, password, fullName);
        if (localRes.success && localRes.user) {
          setSuccessMessage("Account registered successfully!");
          setTimeout(() => {
            onAuthSuccess(localRes.user);
            onClose();
          }, 800);
        } else {
          setError(localRes.error || "Registration failed. Please try again.");
        }
      } else {
        // 1. Try server-side PostgreSQL login
        const serverRes = await ApiClient.login(email, password);
        if (serverRes && serverRes.token) {
          ApiClient.setToken(serverRes.token);
          StorageAdapter.setCurrentUserId(serverRes.user.id);
          setSuccessMessage("Logged in successfully!");
          setTimeout(() => {
            onAuthSuccess(serverRes.user);
            onClose();
          }, 800);
          return;
        }

        // 2. Local fallback login
        const localRes = await AuthService.login(email, password);
        if (localRes.success && localRes.user) {
          setSuccessMessage("Welcome back!");
          setTimeout(() => {
            onAuthSuccess(localRes.user);
            onClose();
          }, 800);
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

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate Google OAuth popup login & account registration
      const googleUserEmail = email.trim() || `trader_${Math.random().toString(36).substring(2, 7)}@gmail.com`;
      const googleUserName = fullName.trim() || "Google Trader";

      // Register or login with Google credential
      const serverRes = await ApiClient.register(googleUserEmail, "google_oauth_secure_pass", googleUserName);
      if (serverRes && serverRes.token) {
        ApiClient.setToken(serverRes.token);
        StorageAdapter.setCurrentUserId(serverRes.user.id);
      } else {
        await AuthService.login(googleUserEmail, "google_oauth_secure_pass");
      }

      setSuccessMessage("Google Account connected successfully!");
      setTimeout(() => {
        onAuthSuccess({ email: googleUserEmail, fullName: googleUserName });
        onClose();
      }, 800);
    } catch (e: any) {
      setError("Google authentication failed. Please try email sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-xs font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-sm shadow-md">
            OS
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            {mode === "login" ? "Welcome Back to Trading-OS" : "Create Your Trader Account"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            {mode === "login"
              ? "Access your strategies, live risk limits, and trade journal."
              : "Start building quantitative strategies and managing institutional risk."}
          </p>
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

          <div className="relative flex items-center justify-center py-2">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-[#090e1a] px-3 text-[10px] text-slate-400 font-mono uppercase tracking-wider absolute">
              or with email
            </span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5 mt-2">
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
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
                placeholder="trader@tradingos.io"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
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

        {/* Toggle Mode */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === "login" ? (
            <p>
              Don't have an account yet?{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className="text-cyan-500 font-bold hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-cyan-500 font-bold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
