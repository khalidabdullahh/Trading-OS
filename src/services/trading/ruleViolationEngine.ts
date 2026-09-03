/**
 * Trading-OS v2.0 - Rule Violation Engine
 * Compares executed trades against Trading Plan Constitution & Risk Settings
 */

import { Trade, TradingPlan, RiskSettings, RuleViolation } from "../../types/domain";

export class RuleViolationEngine {
  /**
   * Audit all trades against active Trading Plan and Risk constraints
   */
  static auditTrades(trades: Trade[], plan: TradingPlan, risk: RiskSettings, accountEquity = 10000): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const sortedTrades = [...trades].sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());

    for (let i = 0; i < sortedTrades.length; i++) {
      const trade = sortedTrades[i];

      // 1. Check Session Authorization
      if (trade.session && plan.allowedSessions && plan.allowedSessions.length > 0) {
        const isAllowed = plan.allowedSessions.some(
          s => s.toLowerCase().includes(trade.session!.toLowerCase()) || trade.session!.toLowerCase().includes(s.toLowerCase())
        );

        if (!isAllowed) {
          violations.push({
            id: `viol_sess_${trade.id}`,
            tradeId: trade.id,
            rule: "Allowed Trading Sessions Restriction",
            observedBehavior: `Executed trade during '${trade.session}' session on ${trade.symbol}.`,
            severity: "MEDIUM",
            evidence: `Trading Plan authorizes: [${plan.allowedSessions.join(", ")}]. Executed in ${trade.session}.`,
            suggestedImprovement: `Restrict trade execution strictly to ${plan.allowedSessions.join(" or ")} to maintain structural edge.`,
            timestamp: trade.entryTime
          });
        }
      }

      // 2. Check Missing Stop Loss
      if (!trade.stopLoss || trade.stopLoss <= 0) {
        violations.push({
          id: `viol_sl_${trade.id}`,
          tradeId: trade.id,
          rule: "Mandatory Stop Loss Requirement",
          observedBehavior: `Trade on ${trade.symbol} was opened without a hard stop loss order.`,
          severity: "CRITICAL",
          evidence: `Stop Loss was omitted. Risk of catastrophic drawdown.`,
          suggestedImprovement: "Never enter an order without pre-defining a structural stop loss.",
          timestamp: trade.entryTime
        });
      }

      // 3. Check Risk Per Trade Violations (> Max Risk %)
      if (trade.stopLoss && trade.entryPrice > 0) {
        const stopDist = Math.abs(trade.entryPrice - trade.stopLoss);
        const tradeRiskCash = stopDist * trade.quantity;
        const tradeRiskPct = (tradeRiskCash / (accountEquity || 10000)) * 100;

        if (tradeRiskPct > (plan.maxRiskPerTradePct || 1.0) * 1.25) {
          violations.push({
            id: `viol_risk_${trade.id}`,
            tradeId: trade.id,
            rule: `Maximum Risk Per Trade Limit (${plan.maxRiskPerTradePct}%)`,
            observedBehavior: `Position size resulted in ${tradeRiskPct.toFixed(2)}% account risk ($${tradeRiskCash.toFixed(2)}).`,
            severity: "HIGH",
            evidence: `Risk on trade (${tradeRiskPct.toFixed(2)}%) exceeded plan limit (${plan.maxRiskPerTradePct}%).`,
            suggestedImprovement: "Use the Risk Center position size calculator before placing orders.",
            timestamp: trade.entryTime
          });
        }
      }

      // 4. Check Revenge Trading Pattern (Trade entered < 15 mins after losing trade)
      if (i > 0) {
        const prevTrade = sortedTrades[i - 1];
        if (prevTrade.netPnl < 0 && prevTrade.exitTime) {
          const exitTimePrev = new Date(prevTrade.exitTime).getTime();
          const entryTimeCurr = new Date(trade.entryTime).getTime();
          const diffMinutes = (entryTimeCurr - exitTimePrev) / (1000 * 60);

          if (diffMinutes >= 0 && diffMinutes < 15) {
            violations.push({
              id: `viol_revenge_${trade.id}`,
              tradeId: trade.id,
              rule: "Anti-Revenge Trading Buffer Rule",
              observedBehavior: `Entered new position on ${trade.symbol} only ${Math.round(diffMinutes)} minutes after a stop loss.`,
              severity: "HIGH",
              evidence: `Rapid consecutive execution following loss on ${prevTrade.symbol}.`,
              suggestedImprovement: "Enforce a mandatory 30-minute cooling off period following a losing trade.",
              timestamp: trade.entryTime
            });
          }
        }
      }
    }

    return violations;
  }
}
