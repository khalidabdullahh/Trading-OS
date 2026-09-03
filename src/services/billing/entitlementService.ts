/**
 * Trading-OS v2.0 - SaaS Entitlement, Plan Gating & Usage Tracking
 * Strictly enforces feature access and quota limits
 */

import { SubscriptionTier } from "../../types/domain";
import { StorageAdapter } from "../storage/storageAdapter";

export interface FeatureAccess {
  hasAccess: boolean;
  tierRequired: SubscriptionTier;
  reason?: string;
}

export class EntitlementService {
  private static TIER_LEVELS: Record<SubscriptionTier, number> = {
    FREE: 1,
    PRO: 2,
    ELITE: 3
  };

  /**
   * Check whether current user tier has access to a specific feature
   */
  static checkAccess(feature: "STRATEGY_BUILDER" | "NATURAL_LANGUAGE_AI" | "FULL_JOURNAL" | "AI_ANALYST" | "RISK_CENTER" | "ADVANCED_SCREENER" | "PINE_EXPORT"): FeatureAccess {
    const sub = StorageAdapter.getSubscription();
    const currentLevel = this.TIER_LEVELS[sub.tier] || 1;

    switch (feature) {
      case "STRATEGY_BUILDER":
      case "RISK_CENTER":
      case "FULL_JOURNAL":
      case "ADVANCED_SCREENER":
        return { hasAccess: currentLevel >= this.TIER_LEVELS.FREE, tierRequired: "FREE" };

      case "NATURAL_LANGUAGE_AI":
      case "AI_ANALYST":
      case "PINE_EXPORT":
        if (currentLevel >= this.TIER_LEVELS.PRO) {
          return { hasAccess: true, tierRequired: "PRO" };
        }
        return {
          hasAccess: false,
          tierRequired: "PRO",
          reason: "Pro tier or higher is required for AI Copilot, AI Analyst, and Automated Export capabilities."
        };

      default:
        return { hasAccess: true, tierRequired: "FREE" };
    }
  }

  /**
   * Track feature usage
   */
  static trackUsage(feature: string, costUsd = 0.0): void {
    try {
      const key = `trading_os_usage_${StorageAdapter.getCurrentUserId()}`;
      const records = JSON.parse(localStorage.getItem(key) || "[]");
      records.push({
        feature,
        costUsd,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(records.slice(-200)));
    } catch {}
  }
}
