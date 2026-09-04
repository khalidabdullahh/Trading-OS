/**
 * Trading-OS v2.0 - Authenticated API Client
 * Centralized client-side gateway for all server API requests with JWT Bearer Token
 */

import { Trade, TradingPlan, RiskSettings, JournalEntry, TradingAccount } from "../../types/domain";
import { StrategyAST } from "../../types/strategy";
import { StorageAdapter } from "../storage/storageAdapter";

export class ApiClient {
  private static TOKEN_KEY = "trading_os_auth_token";

  static getToken(): string {
    try {
      return localStorage.getItem(this.TOKEN_KEY) || "";
    } catch {
      return "";
    }
  }

  static setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch {}
  }

  static clearToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch {}
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const resp = await fetch(endpoint, {
        ...options,
        headers
      });

      if (resp.status === 401) {
        console.warn("[Trading-OS API] Unauthorized request to", endpoint);
      }

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${resp.status}: ${resp.statusText}`);
      }

      return await resp.json();
    } catch (err: any) {
      console.warn(`[Trading-OS API Client] Server request to ${endpoint} failed:`, err.message);
      return null;
    }
  }

  // =========================================================================
  // 1. AUTH
  // =========================================================================
  static async login(email: string, password = "password123") {
    const res = await this.request<{ success: boolean; token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (res && res.token) {
      this.setToken(res.token);
      StorageAdapter.setCurrentUserId(res.user.id);
      return res.user;
    }
    return null;
  }

  static async register(email: string, password = "password123", fullName?: string) {
    const res = await this.request<{ success: boolean; token: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName })
    });

    if (res && res.token) {
      this.setToken(res.token);
      StorageAdapter.setCurrentUserId(res.user.id);
      return res.user;
    }
    return null;
  }

  static async getAuthConfig(): Promise<{ googleAuthEnabled: boolean; googleClientId: string | null }> {
    const res = await this.request<{ googleAuthEnabled: boolean; googleClientId: string | null }>("/api/auth/config");
    return res || { googleAuthEnabled: false, googleClientId: null };
  }

  static async verifyGoogleCredential(credential: string) {
    const res = await this.request<{ success: boolean; token: string; user: any }>("/api/auth/google/verify", {
      method: "POST",
      body: JSON.stringify({ credential })
    });

    if (res && res.token) {
      this.setToken(res.token);
      StorageAdapter.setCurrentUserId(res.user.id);
      return res.user;
    }
    return null;
  }

  // =========================================================================
  // 2. TRADES
  // =========================================================================
  static async getTrades(userId = StorageAdapter.getCurrentUserId() || "guest"): Promise<Trade[]> {
    const res = await this.request<{ success: boolean; trades: Trade[] }>("/api/trades");
    if (res && res.trades) {
      StorageAdapter.saveTrades(res.trades, userId);
      return res.trades;
    }
    return StorageAdapter.getTrades(userId);
  }

  static async createTrade(tradeData: Omit<Trade, "id" | "userId" | "createdAt" | "updatedAt">, userId = StorageAdapter.getCurrentUserId() || "guest"): Promise<Trade> {
    const res = await this.request<{ success: boolean; trade: Trade }>("/api/trades", {
      method: "POST",
      body: JSON.stringify(tradeData)
    });

    if (res && res.trade) {
      const current = StorageAdapter.getTrades(userId);
      StorageAdapter.saveTrades([res.trade, ...current], userId);
      return res.trade;
    }

    const fullTrade: Trade = {
      ...tradeData,
      id: `trd_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    StorageAdapter.addTrade(fullTrade, userId);
    return fullTrade;
  }

  // =========================================================================
  // 3. STRATEGIES
  // =========================================================================
  static async getStrategies(userId = "usr_demo_trader"): Promise<StrategyAST[]> {
    const res = await this.request<{ success: boolean; strategies: StrategyAST[] }>("/api/strategies");
    if (res && res.strategies) {
      res.strategies.forEach(s => StorageAdapter.saveStrategy(s, userId));
      return res.strategies;
    }
    return StorageAdapter.getStrategies(userId);
  }

  static async saveStrategy(strategy: StrategyAST, userId = "usr_demo_trader"): Promise<StrategyAST> {
    const res = await this.request<{ success: boolean; strategy: StrategyAST }>("/api/strategies", {
      method: "POST",
      body: JSON.stringify(strategy)
    });

    if (res && res.strategy) {
      StorageAdapter.saveStrategy(res.strategy, userId);
      return res.strategy;
    }
    StorageAdapter.saveStrategy(strategy, userId);
    return strategy;
  }

  // =========================================================================
  // 4. TRADING PLAN
  // =========================================================================
  static async getTradingPlan(userId = "usr_demo_trader"): Promise<TradingPlan> {
    const res = await this.request<{ success: boolean; plan: TradingPlan }>("/api/trading-plan");
    if (res && res.plan) {
      StorageAdapter.saveTradingPlan(res.plan);
      return res.plan;
    }
    return StorageAdapter.getTradingPlan(userId);
  }

  static async updateTradingPlan(planUpdates: Partial<TradingPlan>, userId = "usr_demo_trader"): Promise<TradingPlan> {
    const res = await this.request<{ success: boolean; plan: TradingPlan }>("/api/trading-plan", {
      method: "PUT",
      body: JSON.stringify(planUpdates)
    });

    if (res && res.plan) {
      StorageAdapter.saveTradingPlan(res.plan);
      return res.plan;
    }

    const current = StorageAdapter.getTradingPlan(userId);
    const updated: TradingPlan = {
      ...current,
      ...planUpdates,
      userId,
      updatedAt: new Date().toISOString()
    };
    StorageAdapter.saveTradingPlan(updated);
    return updated;
  }

  // =========================================================================
  // 5. RISK SETTINGS
  // =========================================================================
  static async getRiskSettings(userId = "usr_demo_trader"): Promise<RiskSettings> {
    const res = await this.request<{ success: boolean; riskSettings: RiskSettings }>("/api/risk-settings");
    if (res && res.riskSettings) {
      StorageAdapter.saveRiskSettings(res.riskSettings);
      return res.riskSettings;
    }
    return StorageAdapter.getRiskSettings(userId);
  }

  static async updateRiskSettings(settingsUpdates: Partial<RiskSettings>, userId = "usr_demo_trader"): Promise<RiskSettings> {
    const res = await this.request<{ success: boolean; riskSettings: RiskSettings }>("/api/risk-settings", {
      method: "PUT",
      body: JSON.stringify(settingsUpdates)
    });

    if (res && res.riskSettings) {
      StorageAdapter.saveRiskSettings(res.riskSettings);
      return res.riskSettings;
    }

    const current = StorageAdapter.getRiskSettings(userId);
    const updated: RiskSettings = {
      ...current,
      ...settingsUpdates,
      userId
    };
    StorageAdapter.saveRiskSettings(updated);
    return updated;
  }

  // =========================================================================
  // 6. AI REASONING PROXY
  // =========================================================================
  static async queryAIAnalyst(prompt: string): Promise<string | null> {
    const res = await this.request<{ success: boolean; response: string }>("/api/ai/analyst", {
      method: "POST",
      body: JSON.stringify({ prompt })
    });
    return res?.response || null;
  }

  // =========================================================================
  // 7. SUBSCRIPTIONS & CRYPTO PAYMENTS
  // =========================================================================
  static async getSubscription() {
    const res = await this.request<{ success: boolean; subscription: any }>("/api/subscription");
    return res?.subscription || { tier: "FREE", status: "ACTIVE" };
  }

  static async verifyCryptoPayment(method: string, txId: string, tier = "PRO") {
    const res = await this.request<{ success: boolean; message: string; subscription: any }>("/api/payments/verify-crypto", {
      method: "POST",
      body: JSON.stringify({ method, txId, tier })
    });
    return res;
  }
}
