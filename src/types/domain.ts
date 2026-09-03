/**
 * Trading-OS v2.0 - Core Domain Models & Entity Types
 */

import { StrategyAST } from "./strategy";

export type SubscriptionTier = "FREE" | "PRO" | "ELITE";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  country?: string;
  experience?: "Beginner" | "Intermediate" | "Advanced" | "Institutional";
}

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  provider?: string;
}

export interface TradingPreferences {
  id: string;
  userId: string;
  defaultCurrency: string;
  timezone: string;
  theme: "dark" | "light";
  defaultRiskModel: "percent_equity" | "fixed_cash" | "atr_risk";
  defaultRiskPct: number;
  defaultStopLossPct: number;
  defaultTakeProfitPct: number;
  chartLayout?: Record<string, any>;
}

export interface TradingAccount {
  id: string;
  userId: string;
  name: string;
  broker?: string;
  accountType: "DEMO" | "LIVE" | "PROP";
  currency: string;
  balance: number;
  equity: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MarketCategory = "CRYPTO" | "FOREX" | "INDICES" | "STOCKS" | "COMMODITIES";

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  category: MarketCategory;
  exchange?: string;
  basePrice: number;
  currency: string;
  isActive: boolean;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  items: WatchlistItem[];
}

export interface WatchlistItem {
  id: string;
  watchlistId: string;
  instrumentId: string;
  symbol: string;
  name: string;
  category: MarketCategory;
  price: number;
  change24h: number;
  change24hPct: number;
  volume24h: number;
  rsi?: number;
  atr?: number;
  trend?: "BULLISH" | "BEARISH" | "NEUTRAL";
  sortOrder: number;
}

export type TradeDirection = "LONG" | "SHORT";
export type TradeStatus = "OPEN" | "CLOSED" | "CANCELED";

export interface Trade {
  id: string;
  userId: string;
  accountId: string;
  instrumentId?: string;
  symbol: string;
  direction: TradeDirection;
  status: TradeStatus;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  fee: number;
  netPnl: number;
  netPnlPct: number;
  rMultiple?: number;
  session?: "London" | "New York" | "Asian" | "Overlap";
  setupType?: string;
  strategyId?: string;
  entryTime: string;
  exitTime?: string;
  exitReason?: string;
  ruleAdherence: boolean;
  emotionState?: "Calm" | "FOMO" | "Revenge" | "Hesitant" | "Greedy";
  notes?: string;
  screenshotUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  tradeId?: string;
  title: string;
  date: string;
  marketContext?: string;
  psychology?: string;
  mistakes?: string;
  lessons?: string;
  rating?: number; // 1-5 execution quality
  content: string;
  screenshots?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TradingPlan {
  id: string;
  userId: string;
  title: string;
  isActive: boolean;
  maxDailyLossPct: number;
  maxRiskPerTradePct: number;
  maxTradesPerDay: number;
  allowedSessions: string[];
  allowedMarkets: string[];
  entryCriteria: string[];
  exitCriteria: string[];
  forbiddenRules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RiskSettings {
  id: string;
  userId: string;
  maxAccountRiskPct: number;
  dailyLossLimitPct: number;
  maxOpenPositions: number;
  trailingStopDefault: number;
  breakEvenThreshold: number;
  enforceStrictRisk: boolean;
}

export interface PortfolioPosition {
  id: string;
  userId: string;
  accountId: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  stopLoss?: number;
  takeProfit?: number;
  openedAt: string;
  updatedAt: string;
}

export interface RuleViolation {
  id: string;
  tradeId: string;
  rule: string;
  observedBehavior: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  evidence: string;
  suggestedImprovement: string;
  timestamp: string;
}

export interface UserInsight {
  id: string;
  userId: string;
  category: "SESSION" | "RISK" | "BEHAVIOR" | "STRATEGY";
  title: string;
  content: string;
  evidence?: Record<string, any>;
  confidence: number;
  createdAt: string;
}

export interface PsychologyPattern {
  id: string;
  name: "Revenge Trading" | "FOMO Chase" | "Premature Exit" | "Overtrading" | "Stop Moving";
  description: string;
  frequency: number;
  costImpactUsd: number;
  triggerContext: string;
  remedyAction: string;
}

export interface AlertRule {
  id: string;
  userId: string;
  type: "PRICE" | "INDICATOR" | "STRATEGY" | "RISK" | "DRAWDOWN" | "ECONOMIC";
  symbol?: string;
  title: string;
  message: string;
  isActive: boolean;
  conditions: Record<string, any>;
  lastTriggered?: string;
  createdAt: string;
}

export interface EconomicEvent {
  id: string;
  event: string;
  country: string;
  currency: string;
  date: string;
  impact: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  forecast?: string;
  previous?: string;
  actual?: string;
  bias?: string;
  summary?: string;
  cryptoImpact?: string;
  goldImpact?: string;
  forexImpact?: string;
  tradingRule?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url?: string;
  publishedAt: string;
  category: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  aiAnalysis?: string;
  symbols: string[];
}

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  lossRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  expectancy: number;
  averageR: number;
  netPnl: number;
  netReturnPct: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  recoveryFactor: number;
  longWinRate: number;
  shortWinRate: number;
}
