/**
 * Trading-OS v2.0 - Universal Storage & User-Isolated Data Layer
 * Handles Multi-User Isolation, CRUD Operations, and Persistence
 */

import {
  User,
  UserProfile,
  UserSubscription,
  TradingPreferences,
  TradingAccount,
  Watchlist,
  WatchlistItem,
  Trade,
  JournalEntry,
  TradingPlan,
  RiskSettings,
  PortfolioPosition,
  AlertRule,
  UserInsight,
  PsychologyPattern,
  EconomicEvent,
  NewsArticle,
  PerformanceMetrics
} from "../../types/domain";
import { StrategyAST } from "../../types/strategy";

export class StorageAdapter {
  private static STORAGE_PREFIX = "trading_os_v2_";

  /**
   * Helper to retrieve partitioned key for a specific user
   */
  private static getKey(userId: string, entity: string): string {
    return `${this.STORAGE_PREFIX}${userId}_${entity}`;
  }

  private static getGlobalKey(entity: string): string {
    return `${this.STORAGE_PREFIX}global_${entity}`;
  }

  // =========================================================================
  // 1. USER & AUTHENTICATION REPOSITORY
  // =========================================================================
  static getUsers(): User[] {
    try {
      const data = localStorage.getItem(this.getGlobalKey("users"));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveUser(user: User): void {
    const users = this.getUsers().filter(u => u.id !== user.id && u.email !== user.email);
    users.push(user);
    localStorage.setItem(this.getGlobalKey("users"), JSON.stringify(users));
  }

  static getCurrentUserId(): string {
    try {
      return localStorage.getItem(`${this.STORAGE_PREFIX}current_user_id`) || "usr_demo_trader";
    } catch {
      return "usr_demo_trader";
    }
  }

  static setCurrentUserId(userId: string): void {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}current_user_id`, userId);
    } catch {}
  }

  // =========================================================================
  // 2. PROFILE & PREFERENCES
  // =========================================================================
  static getProfile(userId: string = this.getCurrentUserId()): UserProfile {
    try {
      const data = localStorage.getItem(this.getKey(userId, "profile"));
      if (data) return JSON.parse(data);
    } catch {}

    const defaultProfile: UserProfile = {
      id: `prof_${userId}`,
      userId,
      fullName: "Khalid Abdullah",
      country: "Global / Interbank",
      experience: "Advanced",
      bio: "Quantitative Systems & Algorithmic Momentum Trader"
    };
    this.saveProfile(defaultProfile);
    return defaultProfile;
  }

  static saveProfile(profile: UserProfile): void {
    localStorage.setItem(this.getKey(profile.userId, "profile"), JSON.stringify(profile));
  }

  static getTradingPreferences(userId: string = this.getCurrentUserId()): TradingPreferences {
    try {
      const data = localStorage.getItem(this.getKey(userId, "preferences"));
      if (data) return JSON.parse(data);
    } catch {}

    const defaultPref: TradingPreferences = {
      id: `pref_${userId}`,
      userId,
      defaultCurrency: "USD",
      timezone: "UTC",
      theme: "dark",
      defaultRiskModel: "percent_equity",
      defaultRiskPct: 1.0,
      defaultStopLossPct: 1.5,
      defaultTakeProfitPct: 3.0
    };
    this.saveTradingPreferences(defaultPref);
    return defaultPref;
  }

  static saveTradingPreferences(pref: TradingPreferences): void {
    localStorage.setItem(this.getKey(pref.userId, "preferences"), JSON.stringify(pref));
  }

  // =========================================================================
  // 3. SUBSCRIPTION & ENTITLEMENTS
  // =========================================================================
  static getSubscription(userId: string = this.getCurrentUserId()): UserSubscription {
    try {
      const data = localStorage.getItem(this.getKey(userId, "subscription"));
      if (data) return JSON.parse(data);
    } catch {}

    const defaultSub: UserSubscription = {
      id: `sub_${userId}`,
      userId,
      tier: "PRO", // Default unlocked for master terminal workstation
      status: "ACTIVE",
      currentPeriodStart: new Date().toISOString(),
      cancelAtPeriodEnd: false,
      provider: "Direct"
    };
    this.saveSubscription(defaultSub);
    return defaultSub;
  }

  static saveSubscription(sub: UserSubscription): void {
    localStorage.setItem(this.getKey(sub.userId, "subscription"), JSON.stringify(sub));
  }

  // =========================================================================
  // 4. TRADING ACCOUNTS & PORTFOLIO
  // =========================================================================
  static getTradingAccounts(userId: string = this.getCurrentUserId()): TradingAccount[] {
    try {
      const data = localStorage.getItem(this.getKey(userId, "accounts"));
      if (data) return JSON.parse(data);
    } catch {}

    const defaultAccount: TradingAccount = {
      id: `acc_${userId}_primary`,
      userId,
      name: "Main Quant Execution Account",
      broker: "Institutional Interbank Feed",
      accountType: "LIVE",
      currency: "USD",
      balance: 10000.0,
      equity: 10000.0,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(this.getKey(userId, "accounts"), JSON.stringify([defaultAccount]));
    } catch {}
    return [defaultAccount];
  }

  static saveTradingAccount(account: TradingAccount): void {
    let list: TradingAccount[] = [];
    try {
      const data = localStorage.getItem(this.getKey(account.userId, "accounts"));
      if (data) list = JSON.parse(data);
    } catch {}
    list = list.filter(a => a.id !== account.id);
    list.push(account);
    try {
      localStorage.setItem(this.getKey(account.userId, "accounts"), JSON.stringify(list));
    } catch {}
  }

  // =========================================================================
  // 5. TRADING PLAN (CONSTITUTION)
  // =========================================================================
  static getTradingPlan(userId: string = this.getCurrentUserId()): TradingPlan {
    try {
      const data = localStorage.getItem(this.getKey(userId, "trading_plan"));
      if (data) return JSON.parse(data);
    } catch {}

    const defaultPlan: TradingPlan = {
      id: `plan_${userId}`,
      userId,
      title: "Trading-OS Master Trading Constitution",
      isActive: true,
      maxDailyLossPct: 3.0,
      maxRiskPerTradePct: 1.0,
      maxTradesPerDay: 4,
      allowedSessions: ["London", "New York", "London / NY Overlap"],
      allowedMarkets: ["Crypto", "Forex", "Indices", "Commodities"],
      entryCriteria: [
        "Multiple Timeframe Confirmation (Higher timeframe trend alignment)",
        "Quantitative Trigger Condition verified by Strategy AST",
        "Minimum 1:2.0 Risk-to-Reward Ratio"
      ],
      exitCriteria: [
        "Strict Stop Loss hit (zero manual moving of SL in losing direction)",
        "Target profit reached or trailing stop triggered"
      ],
      forbiddenRules: [
        "No revenge trading after a stop loss execution",
        "No trading outside authorized market sessions",
        "No opening positions exceeding 1.0% account risk",
        "Never increase position size to recover drawdown"
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveTradingPlan(defaultPlan);
    return defaultPlan;
  }

  static saveTradingPlan(plan: TradingPlan): void {
    localStorage.setItem(this.getKey(plan.userId, "trading_plan"), JSON.stringify(plan));
  }

  // =========================================================================
  // 6. RISK SETTINGS
  // =========================================================================
  static getRiskSettings(userId: string = this.getCurrentUserId()): RiskSettings {
    try {
      const data = localStorage.getItem(this.getKey(userId, "risk_settings"));
      if (data) return JSON.parse(data);
    } catch {}

    const defaultRisk: RiskSettings = {
      id: `risk_${userId}`,
      userId,
      maxAccountRiskPct: 6.0,
      dailyLossLimitPct: 3.0,
      maxOpenPositions: 3,
      trailingStopDefault: 1.0,
      breakEvenThreshold: 1.5,
      enforceStrictRisk: true
    };
    this.saveRiskSettings(defaultRisk);
    return defaultRisk;
  }

  static saveRiskSettings(settings: RiskSettings): void {
    localStorage.setItem(this.getKey(settings.userId, "risk_settings"), JSON.stringify(settings));
  }

  // =========================================================================
  // 7. TRADES & TRADE LOG
  // =========================================================================
  static getTrades(userId: string = this.getCurrentUserId()): Trade[] {
    try {
      const data = localStorage.getItem(this.getKey(userId, "trades"));
      if (data) return JSON.parse(data);
    } catch {}

    // Initial institutional sample trades for realistic analytics
    const sampleTrades: Trade[] = [
      {
        id: "trd_001",
        userId,
        accountId: `acc_${userId}_primary`,
        symbol: "BTCUSDT",
        direction: "LONG",
        status: "CLOSED",
        entryPrice: 63800.0,
        exitPrice: 65714.0,
        quantity: 0.15,
        stopLoss: 62843.0,
        takeProfit: 65714.0,
        fee: 7.2,
        netPnl: 279.9,
        netPnlPct: 3.0,
        rMultiple: 2.0,
        session: "London",
        setupType: "3-Candle Confirmation",
        entryTime: new Date(Date.now() - 86400000 * 3).toISOString(),
        exitTime: new Date(Date.now() - 86400000 * 3 + 7200000).toISOString(),
        exitReason: "Take Profit Target Reached 🎯",
        ruleAdherence: true,
        emotionState: "Calm",
        notes: "Clean London session continuation breakout. AST trigger matched perfectly.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "trd_002",
        userId,
        accountId: `acc_${userId}_primary`,
        symbol: "EURUSD",
        direction: "SHORT",
        status: "CLOSED",
        entryPrice: 1.092,
        exitPrice: 1.0865,
        quantity: 100000,
        stopLoss: 1.0945,
        takeProfit: 1.0865,
        fee: 3.5,
        netPnl: 546.5,
        netPnlPct: 5.03,
        rMultiple: 2.2,
        session: "New York",
        setupType: "MACD Cross Below Signal",
        entryTime: new Date(Date.now() - 86400000 * 2).toISOString(),
        exitTime: new Date(Date.now() - 86400000 * 2 + 14400000).toISOString(),
        exitReason: "Take Profit Target Reached 🎯",
        ruleAdherence: true,
        emotionState: "Calm",
        notes: "ECB rate divergence confirmation. Exited at lower support band.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "trd_003",
        userId,
        accountId: `acc_${userId}_primary`,
        symbol: "XAUUSD",
        direction: "LONG",
        status: "CLOSED",
        entryPrice: 2495.0,
        exitPrice: 2470.0,
        quantity: 10.0,
        stopLoss: 2470.0,
        takeProfit: 2545.0,
        fee: 5.0,
        netPnl: -255.0,
        netPnlPct: -1.0,
        rMultiple: -1.0,
        session: "Asian",
        setupType: "Swing Support Bounce",
        entryTime: new Date(Date.now() - 86400000).toISOString(),
        exitTime: new Date(Date.now() - 86400000 + 3600000).toISOString(),
        exitReason: "Stop Loss Hit 🛑",
        ruleAdherence: true,
        emotionState: "Calm",
        notes: "Gold rejected swing support during Asian session. SL honored strictly.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.saveTrades(sampleTrades, userId);
    return sampleTrades;
  }

  static saveTrades(trades: Trade[], userId: string = this.getCurrentUserId()): void {
    localStorage.setItem(this.getKey(userId, "trades"), JSON.stringify(trades));
  }

  static addTrade(trade: Trade, userId: string = this.getCurrentUserId()): void {
    const list = this.getTrades(userId);
    list.unshift(trade);
    this.saveTrades(list, userId);
  }

  static updateTrade(trade: Trade, userId: string = this.getCurrentUserId()): void {
    const list = this.getTrades(userId).map(t => (t.id === trade.id ? trade : t));
    this.saveTrades(list, userId);
  }

  static deleteTrade(tradeId: string, userId: string = this.getCurrentUserId()): void {
    const list = this.getTrades(userId).filter(t => t.id !== tradeId);
    this.saveTrades(list, userId);
  }

  // =========================================================================
  // 8. TRADE JOURNAL
  // =========================================================================
  static getJournalEntries(userId: string = this.getCurrentUserId()): JournalEntry[] {
    try {
      const data = localStorage.getItem(this.getKey(userId, "journal"));
      if (data) return JSON.parse(data);
    } catch {}

    const sampleJournal: JournalEntry[] = [
      {
        id: "jnl_001",
        userId,
        tradeId: "trd_001",
        title: "Bitcoin 3-Candle Long Execution Review",
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        marketContext: "London session opening liquidity sweep, strong spot buyer delta",
        psychology: "Patient and disciplined. Waited for candle 3 close before entering.",
        mistakes: "None on execution. Could have trailed stop closer to high.",
        lessons: "Candle structure offsets (t-2 bull, t-1 bull, t-0 bear) provide high-probability continuation.",
        rating: 5,
        content: "High-conviction quantitative setup. Managed risk strictly at 1% of account equity.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "jnl_002",
        userId,
        tradeId: "trd_003",
        title: "Gold Asian Session Support Invalidation",
        date: new Date(Date.now() - 86400000).toISOString(),
        marketContext: "Subdued Asian market volume, lack of institutional follow-through",
        psychology: "Felt mild frustration that Asian session lacked momentum, but respected stop.",
        mistakes: "Entered during Asian session which is restricted in Trading Plan.",
        lessons: "Honor Trading Plan restriction: Only trade London and New York sessions.",
        rating: 3,
        content: "Rule violation detected: Trading outside authorized session. Small 1% loss contained.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.saveJournalEntries(sampleJournal, userId);
    return sampleJournal;
  }

  static saveJournalEntries(entries: JournalEntry[], userId: string = this.getCurrentUserId()): void {
    localStorage.setItem(this.getKey(userId, "journal"), JSON.stringify(entries));
  }

  static addJournalEntry(entry: JournalEntry, userId: string = this.getCurrentUserId()): void {
    const list = this.getJournalEntries(userId);
    list.unshift(entry);
    this.saveJournalEntries(list, userId);
  }

  // =========================================================================
  // 9. WATCHLISTS
  // =========================================================================
  static getWatchlists(userId: string = this.getCurrentUserId()): Watchlist[] {
    try {
      const data = localStorage.getItem(this.getKey(userId, "watchlists"));
      if (data) return JSON.parse(data);
    } catch {}

    const defaultWatchlist: Watchlist = {
      id: `wl_${userId}_main`,
      userId,
      name: "Institutional Multi-Asset Watchlist",
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        { id: "wli_1", watchlistId: `wl_${userId}_main`, instrumentId: "BTCUSDT", symbol: "BTCUSDT", name: "Bitcoin / USDT", category: "CRYPTO", price: 64200.0, change24h: 1250.0, change24hPct: 1.98, volume24h: 38400000, rsi: 58.4, atr: 1420.0, trend: "BULLISH", sortOrder: 0 },
        { id: "wli_2", watchlistId: `wl_${userId}_main`, instrumentId: "ETHUSDT", symbol: "ETHUSDT", name: "Ethereum / USDT", category: "CRYPTO", price: 3450.0, change24h: 65.0, change24hPct: 1.92, volume24h: 18200000, rsi: 54.1, atr: 85.0, trend: "BULLISH", sortOrder: 1 },
        { id: "wli_3", watchlistId: `wl_${userId}_main`, instrumentId: "EURUSD", symbol: "EURUSD", name: "EUR / USD", category: "FOREX", price: 1.0885, change24h: -0.0025, change24hPct: -0.23, volume24h: 94000000, rsi: 46.2, atr: 0.0055, trend: "NEUTRAL", sortOrder: 2 },
        { id: "wli_4", watchlistId: `wl_${userId}_main`, instrumentId: "XAUUSD", symbol: "XAUUSD", name: "Gold Spot", category: "COMMODITIES", price: 2510.0, change24h: 18.5, change24hPct: 0.74, volume24h: 42000000, rsi: 62.8, atr: 24.5, trend: "BULLISH", sortOrder: 3 },
        { id: "wli_5", watchlistId: `wl_${userId}_main`, instrumentId: "NAS100", symbol: "NAS100", name: "Nasdaq 100", category: "INDICES", price: 19780.0, change24h: 145.0, change24hPct: 0.74, volume24h: 68000000, rsi: 61.2, atr: 210.0, trend: "BULLISH", sortOrder: 4 },
        { id: "wli_6", watchlistId: `wl_${userId}_main`, instrumentId: "NVDA", symbol: "NVDA", name: "NVIDIA Corp.", category: "STOCKS", price: 128.5, change24h: 3.2, change24hPct: 2.55, volume24h: 85000000, rsi: 67.5, atr: 4.8, trend: "BULLISH", sortOrder: 5 }
      ]
    };

    this.saveWatchlists([defaultWatchlist], userId);
    return [defaultWatchlist];
  }

  static saveWatchlists(watchlists: Watchlist[], userId: string = this.getCurrentUserId()): void {
    localStorage.setItem(this.getKey(userId, "watchlists"), JSON.stringify(watchlists));
  }

  // =========================================================================
  // 10. SAVED STRATEGIES
  // =========================================================================
  static getStrategies(userId: string = this.getCurrentUserId()): StrategyAST[] {
    try {
      const data = localStorage.getItem(this.getKey(userId, "strategies"));
      if (data) return JSON.parse(data);
    } catch {}

    return [];
  }

  static saveStrategy(ast: StrategyAST, userId: string = this.getCurrentUserId()): void {
    const list = this.getStrategies(userId).filter(s => s.id !== ast.id);
    list.unshift(ast);
    localStorage.setItem(this.getKey(userId, "strategies"), JSON.stringify(list));
  }

  // =========================================================================
  // 11. ALERTS
  // =========================================================================
  static getAlerts(userId: string = this.getCurrentUserId()): AlertRule[] {
    try {
      const data = localStorage.getItem(this.getKey(userId, "alerts"));
      if (data) return JSON.parse(data);
    } catch {}

    const defaultAlerts: AlertRule[] = [
      {
        id: "alt_001",
        userId,
        type: "PRICE",
        symbol: "BTCUSDT",
        title: "Bitcoin Breakout Alert",
        message: "BTC price crossed above $65,000 resistance level.",
        isActive: true,
        conditions: { price: 65000, operator: ">" },
        createdAt: new Date().toISOString()
      },
      {
        id: "alt_002",
        userId,
        type: "RISK",
        title: "Daily Drawdown Warning",
        message: "Account drawdown reached 2.5% of daily 3.0% limit.",
        isActive: true,
        conditions: { drawdownPct: 2.5 },
        createdAt: new Date().toISOString()
      }
    ];

    this.saveAlerts(defaultAlerts, userId);
    return defaultAlerts;
  }

  static saveAlerts(alerts: AlertRule[], userId: string = this.getCurrentUserId()): void {
    localStorage.setItem(this.getKey(userId, "alerts"), JSON.stringify(alerts));
  }

  static addAlert(alert: AlertRule, userId: string = this.getCurrentUserId()): void {
    const list = this.getAlerts(userId);
    list.unshift(alert);
    this.saveAlerts(list, userId);
  }
}
