/**
 * Trading-OS Market Regime Classifier & Performance Segregation Engine v1.02
 * Identifies macro & micro market regimes (Trending, Ranging, High/Low Volatility)
 * and measures strategy edge across distinct market environments
 * Author: Khalid Abdullah (Trading-OS)
 */

const RegimeEngine = {
    /**
     * Classify market regimes across candle series and segregate trade performance
     * @param {Array} candles - Historical candle series
     * @param {Array} trades - Array of executed trades
     */
    analyzeRegimes(candles, trades) {
        if (!candles || candles.length < 50) {
            throw new Error("Regime analysis requires at least 50 historical candles.");
        }

        const closes = candles.map(c => c.close);
        const ema20 = Indicators.ema(closes, 20);
        const ema50 = Indicators.ema(closes, 50);
        const atr14 = Indicators.atr(candles, 14);

        // Calculate 50-period Average ATR for volatility expansion/compression detection
        const validAtrs = atr14.filter(a => a !== null);
        const avgAtr = validAtrs.reduce((sum, a) => sum + a, 0) / (validAtrs.length || 1);

        // Bar-by-bar regime mapping
        const barRegimes = new Array(candles.length).fill('RANGING');

        for (let i = 0; i < candles.length; i++) {
            if (ema20[i] === null || ema50[i] === null || atr14[i] === null) {
                barRegimes[i] = 'UNCLASSIFIED';
                continue;
            }

            const isHighVol = atr14[i] >= (avgAtr * 1.35);
            const isLowVol = atr14[i] <= (avgAtr * 0.70);

            const isBullTrend = closes[i] > ema50[i] && ema20[i] > ema50[i];
            const isBearTrend = closes[i] < ema50[i] && ema20[i] < ema50[i];

            if (isHighVol) {
                barRegimes[i] = 'HIGH_VOLATILITY';
            } else if (isLowVol) {
                barRegimes[i] = 'LOW_VOLATILITY';
            } else if (isBullTrend) {
                barRegimes[i] = 'BULL_TREND';
            } else if (isBearTrend) {
                barRegimes[i] = 'BEAR_TREND';
            } else {
                barRegimes[i] = 'RANGING';
            }
        }

        // Segregate Trades by Regime
        const regimeBuckets = {
            'BULL_TREND': { name: 'Bullish Trending', badge: '📈 Bull Trend', color: 'emerald', trades: [] },
            'BEAR_TREND': { name: 'Bearish Trending', badge: '📉 Bear Trend', color: 'rose', trades: [] },
            'RANGING': { name: 'Ranging / Mean-Reverting', badge: '↔️ Ranging', color: 'amber', trades: [] },
            'HIGH_VOLATILITY': { name: 'High Volatility Shock', badge: '⚡ High Vol', color: 'purple', trades: [] },
            'LOW_VOLATILITY': { name: 'Low Volatility Squeeze', badge: '🧊 Low Vol', color: 'cyan', trades: [] }
        };

        trades.forEach(trade => {
            const entryRegime = barRegimes[trade.entryIndex] || 'RANGING';
            if (regimeBuckets[entryRegime]) {
                regimeBuckets[entryRegime].trades.push(trade);
            } else {
                regimeBuckets['RANGING'].trades.push(trade);
            }
        });

        // Compute Metrics per Regime
        const regimeStats = Object.keys(regimeBuckets).map(key => {
            const bucket = regimeBuckets[key];
            const tCount = bucket.trades.length;
            const wins = bucket.trades.filter(t => t.isWin).length;
            const winRate = tCount > 0 ? (wins / tCount) * 100 : 0;
            
            const netProfit = bucket.trades.reduce((sum, t) => sum + t.netPnl, 0);
            const grossWin = bucket.trades.filter(t => t.isWin).reduce((sum, t) => sum + t.netPnl, 0);
            const grossLoss = Math.abs(bucket.trades.filter(t => !t.isWin).reduce((sum, t) => sum + t.netPnl, 0));
            const profitFactor = grossLoss > 0 ? (grossWin / grossLoss) : (grossWin > 0 ? 99.9 : 0);

            return {
                key,
                name: bucket.name,
                badge: bucket.badge,
                color: bucket.color,
                tradeCount: tCount,
                winRate: parseFloat(winRate.toFixed(1)),
                netProfit: parseFloat(netProfit.toFixed(2)),
                profitFactor: parseFloat(profitFactor.toFixed(2)),
                tradesSharePct: trades.length > 0 ? parseFloat(((tCount / trades.length) * 100).toFixed(1)) : 0
            };
        });

        // Find Best and Worst Performing Regimes
        const activeRegimes = regimeStats.filter(r => r.tradeCount > 0);
        let bestRegime = activeRegimes.length > 0 ? [...activeRegimes].sort((a, b) => b.netProfit - a.netProfit)[0] : null;
        let worstRegime = activeRegimes.length > 0 ? [...activeRegimes].sort((a, b) => a.netProfit - b.netProfit)[0] : null;

        let regimeInsight = 'Strategy performance is evenly distributed across market regimes.';
        if (bestRegime && worstRegime && bestRegime.key !== worstRegime.key) {
            regimeInsight = `Strategy generates strong alpha in ${bestRegime.name} (${bestRegime.winRate}% win rate, PF ${bestRegime.profitFactor}), but experiences headwinds in ${worstRegime.name} (${worstRegime.winRate}% win rate).`;
        }

        return {
            regimeStats,
            bestRegime,
            worstRegime,
            regimeInsight,
            barRegimes
        };
    }
};

if (typeof window !== 'undefined') {
    window.RegimeEngine = RegimeEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegimeEngine;
}
