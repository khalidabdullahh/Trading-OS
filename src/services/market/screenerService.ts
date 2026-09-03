/**
 * Trading-OS v2.0 - Quantitative Market Screener Service
 * Multi-condition scanner supporting structured quantitative filters
 */

import { MarketDataProvider } from "./marketDataProvider";
import Indicators from "../../../js/indicators.js";

export interface ScreenerFilter {
  category?: string;
  rsiMin?: number;
  rsiMax?: number;
  priceVsEma200?: "above" | "below" | "any";
  trend?: "BULLISH" | "BEARISH" | "any";
  minVolume24h?: number;
}

export interface ScreenerResult {
  symbol: string;
  name: string;
  category: string;
  price: number;
  change24hPct: number;
  volume24h: number;
  rsi: number;
  ema200: number;
  priceVsEma: "ABOVE" | "BELOW";
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  atr: number;
}

export class ScreenerService {
  /**
   * Run multi-asset screener scan across registered instruments
   */
  static async scan(filters: ScreenerFilter = {}): Promise<ScreenerResult[]> {
    const results: ScreenerResult[] = [];
    const instruments = MarketDataProvider.INSTRUMENTS;

    for (const inst of instruments) {
      if (filters.category && filters.category !== "ALL" && inst.category !== filters.category) {
        continue;
      }

      try {
        const res = await MarketDataProvider.fetchCandles(inst.symbol, "15m", 220);
        const candles = res.data;
        if (!candles || candles.length < 50) continue;

        const closes = candles.map(c => c.close);
        const currentPrice = closes[closes.length - 1];
        const prevPrice = closes[0];
        const change24hPct = +(((currentPrice - prevPrice) / prevPrice) * 100).toFixed(2);

        // Technical Indicators
        const rsiVals = Indicators.rsi(closes, 14);
        const currentRsi = +(rsiVals[rsiVals.length - 1] || 50).toFixed(1);

        const ema200Vals = Indicators.ema(closes, Math.min(200, closes.length - 1));
        const currentEma200 = +(ema200Vals[ema200Vals.length - 1] || currentPrice).toFixed(2);
        const priceVsEma: "ABOVE" | "BELOW" = currentPrice >= currentEma200 ? "ABOVE" : "BELOW";

        const atrVals = Indicators.atr(candles, 14);
        const currentAtr = +(atrVals[atrVals.length - 1] || 0).toFixed(2);

        const trend: "BULLISH" | "BEARISH" | "NEUTRAL" =
          currentRsi > 52 && currentPrice > currentEma200
            ? "BULLISH"
            : currentRsi < 48 && currentPrice < currentEma200
            ? "BEARISH"
            : "NEUTRAL";

        const totalVol = candles.slice(-24).reduce((acc, c) => acc + (c.volume || 0), 0);

        // Apply Filters
        if (filters.rsiMin !== undefined && currentRsi < filters.rsiMin) continue;
        if (filters.rsiMax !== undefined && currentRsi > filters.rsiMax) continue;
        if (filters.priceVsEma200 && filters.priceVsEma200 !== "any") {
          if (filters.priceVsEma200 === "above" && priceVsEma !== "ABOVE") continue;
          if (filters.priceVsEma200 === "below" && priceVsEma !== "BELOW") continue;
        }
        if (filters.trend && filters.trend !== "any" && trend !== filters.trend) continue;

        results.push({
          symbol: inst.symbol,
          name: inst.name,
          category: inst.category,
          price: currentPrice,
          change24hPct,
          volume24h: totalVol,
          rsi: currentRsi,
          ema200: currentEma200,
          priceVsEma,
          trend,
          atr: currentAtr
        });
      } catch (e) {
        console.warn(`Screener error for ${inst.symbol}:`, e);
      }
    }

    return results;
  }
}
