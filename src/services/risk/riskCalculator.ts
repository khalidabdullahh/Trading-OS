/**
 * Trading-OS v2.0 - Institutional Risk Management & Mathematical Position Sizing Engine
 * Deterministic calculations for position sizing, portfolio exposure, and risk-to-reward ratios
 */

export interface PositionSizeResult {
  units: number;
  positionValueUsd: number;
  riskAmountUsd: number;
  riskPct: number;
  stopDistanceUsd: number;
  stopDistancePct: number;
  leverageRequired: number;
  isValid: boolean;
  validationError?: string;
}

export class RiskCalculator {
  /**
   * Deterministic Position Sizing Calculation
   * Supports: 'percent_equity' | 'fixed_cash' | 'atr_risk'
   */
  static calculatePositionSize({
    accountEquity = 10000,
    riskPct = 1.0,
    entryPrice,
    stopLossPrice,
    model = "percent_equity",
    fixedCashRisk = 100,
    atr = 0,
    atrMultiplier = 1.5
  }: {
    accountEquity: number;
    riskPct: number;
    entryPrice: number;
    stopLossPrice?: number;
    model?: "percent_equity" | "fixed_cash" | "atr_risk";
    fixedCashRisk?: number;
    atr?: number;
    atrMultiplier?: number;
  }): PositionSizeResult {
    // 1. Validate Account Equity
    if (typeof accountEquity !== "number" || isNaN(accountEquity) || accountEquity <= 0) {
      return {
        units: 0,
        positionValueUsd: 0,
        riskAmountUsd: 0,
        riskPct: 0,
        stopDistanceUsd: 0,
        stopDistancePct: 0,
        leverageRequired: 0,
        isValid: false,
        validationError: "Account equity must be a positive number greater than zero."
      };
    }

    // 2. Validate Entry Price
    if (typeof entryPrice !== "number" || isNaN(entryPrice) || entryPrice <= 0) {
      return {
        units: 0,
        positionValueUsd: 0,
        riskAmountUsd: 0,
        riskPct: 0,
        stopDistanceUsd: 0,
        stopDistancePct: 0,
        leverageRequired: 0,
        isValid: false,
        validationError: "Entry price must be a positive number greater than zero."
      };
    }

    // 3. Validate Risk Parameters
    let targetRiskCash = 0;
    let effectiveRiskPct = 0;

    if (model === "fixed_cash") {
      if (typeof fixedCashRisk !== "number" || isNaN(fixedCashRisk) || fixedCashRisk <= 0) {
        return {
          units: 0,
          positionValueUsd: 0,
          riskAmountUsd: 0,
          riskPct: 0,
          stopDistanceUsd: 0,
          stopDistancePct: 0,
          leverageRequired: 0,
          isValid: false,
          validationError: "Fixed cash risk must be greater than zero."
        };
      }
      targetRiskCash = fixedCashRisk;
      effectiveRiskPct = +((targetRiskCash / accountEquity) * 100).toFixed(2);
    } else {
      if (typeof riskPct !== "number" || isNaN(riskPct) || riskPct <= 0 || riskPct > 100) {
        return {
          units: 0,
          positionValueUsd: 0,
          riskAmountUsd: 0,
          riskPct: 0,
          stopDistanceUsd: 0,
          stopDistancePct: 0,
          leverageRequired: 0,
          isValid: false,
          validationError: "Risk percentage must be between 0.01% and 100%."
        };
      }
      effectiveRiskPct = riskPct;
      targetRiskCash = accountEquity * (riskPct / 100);
    }

    // 4. Validate Stop Loss Distance
    let stopDist = 0;
    if (stopLossPrice !== undefined && stopLossPrice !== null && stopLossPrice > 0) {
      stopDist = Math.abs(entryPrice - stopLossPrice);
      if (stopDist === 0) {
        return {
          units: 0,
          positionValueUsd: 0,
          riskAmountUsd: 0,
          riskPct: 0,
          stopDistanceUsd: 0,
          stopDistancePct: 0,
          leverageRequired: 0,
          isValid: false,
          validationError: "Stop loss price cannot be identical to the entry price."
        };
      }
    } else if (atr && typeof atr === "number" && !isNaN(atr) && atr > 0) {
      stopDist = atr * (atrMultiplier > 0 ? atrMultiplier : 1.5);
    } else {
      // Default 1.5% structural buffer if no SL or ATR provided
      stopDist = entryPrice * 0.015;
    }

    if (stopDist <= 0 || isNaN(stopDist)) {
      return {
        units: 0,
        positionValueUsd: 0,
        riskAmountUsd: 0,
        riskPct: 0,
        stopDistanceUsd: 0,
        stopDistancePct: 0,
        leverageRequired: 0,
        isValid: false,
        validationError: "Calculated stop loss distance must be positive."
      };
    }

    const stopDistancePct = +((stopDist / entryPrice) * 100).toFixed(2);
    const units = +(targetRiskCash / stopDist).toFixed(4);
    const positionValueUsd = +(units * entryPrice).toFixed(2);
    const leverageRequired = +(positionValueUsd / accountEquity).toFixed(2);

    return {
      units,
      positionValueUsd,
      riskAmountUsd: +targetRiskCash.toFixed(2),
      riskPct: effectiveRiskPct,
      stopDistanceUsd: +stopDist.toFixed(2),
      stopDistancePct,
      leverageRequired,
      isValid: true
    };
  }

  /**
   * Calculate exact Risk-to-Reward ratio with safe bounds
   */
  static calculateRiskReward(entryPrice: number, stopLoss: number, takeProfit: number, direction: "LONG" | "SHORT" = "LONG"): number {
    if (!entryPrice || !stopLoss || !takeProfit || entryPrice <= 0 || stopLoss <= 0 || takeProfit <= 0) {
      return 0.0;
    }

    let risk = 0;
    let reward = 0;

    if (direction === "LONG") {
      risk = entryPrice - stopLoss;
      reward = takeProfit - entryPrice;
    } else {
      risk = stopLoss - entryPrice;
      reward = entryPrice - takeProfit;
    }

    if (risk <= 0 || reward <= 0 || isNaN(risk) || isNaN(reward)) {
      return 0.0;
    }

    const rr = +(reward / risk).toFixed(2);
    return isFinite(rr) ? rr : 0.0;
  }
}
