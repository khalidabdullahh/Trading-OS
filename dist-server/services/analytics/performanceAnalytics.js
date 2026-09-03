"use strict";
/**
 * Trading-OS v2.0 - Institutional Performance Analytics Engine
 * Computes exact mathematical metrics across trades, sessions, and setups
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceAnalytics = void 0;
class PerformanceAnalytics {
    /**
     * Compute comprehensive performance metrics across a list of trades
     */
    static calculate(trades, initialCapital = 10000) {
        const closedTrades = trades.filter(t => t.status === "CLOSED");
        if (closedTrades.length === 0) {
            return {
                totalTrades: 0,
                winningTrades: 0,
                losingTrades: 0,
                winRate: 0,
                lossRate: 0,
                averageWin: 0,
                averageLoss: 0,
                profitFactor: 0,
                expectancy: 0,
                averageR: 0,
                netPnl: 0,
                netReturnPct: 0,
                maxDrawdown: 0,
                maxDrawdownPct: 0,
                sharpeRatio: 0,
                recoveryFactor: 0,
                longWinRate: 0,
                shortWinRate: 0
            };
        }
        let grossProfit = 0;
        let grossLoss = 0;
        let winCount = 0;
        let lossCount = 0;
        let totalR = 0;
        let rCount = 0;
        let longWins = 0;
        let totalLongs = 0;
        let shortWins = 0;
        let totalShorts = 0;
        let runningCapital = initialCapital;
        let peakCapital = initialCapital;
        let maxDrawdown = 0;
        let maxDrawdownPct = 0;
        for (const t of closedTrades) {
            const pnl = t.netPnl;
            runningCapital += pnl;
            if (runningCapital > peakCapital) {
                peakCapital = runningCapital;
            }
            else {
                const dd = peakCapital - runningCapital;
                const ddPct = (dd / peakCapital) * 100;
                if (dd > maxDrawdown)
                    maxDrawdown = dd;
                if (ddPct > maxDrawdownPct)
                    maxDrawdownPct = ddPct;
            }
            if (pnl > 0) {
                winCount++;
                grossProfit += pnl;
            }
            else if (pnl < 0) {
                lossCount++;
                grossLoss += Math.abs(pnl);
            }
            if (t.rMultiple !== undefined && t.rMultiple !== null) {
                totalR += t.rMultiple;
                rCount++;
            }
            if (t.direction === "LONG") {
                totalLongs++;
                if (pnl > 0)
                    longWins++;
            }
            else if (t.direction === "SHORT") {
                totalShorts++;
                if (pnl > 0)
                    shortWins++;
            }
        }
        const totalTrades = closedTrades.length;
        const winRate = +((winCount / totalTrades) * 100).toFixed(2);
        const lossRate = +((lossCount / totalTrades) * 100).toFixed(2);
        const averageWin = winCount > 0 ? +(grossProfit / winCount).toFixed(2) : 0;
        const averageLoss = lossCount > 0 ? +(grossLoss / lossCount).toFixed(2) : 0;
        // Profit Factor: Gross Profit / Gross Loss (0 if no loss, or 0 if no profit)
        const profitFactor = grossLoss > 0 ? +(grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? +(grossProfit).toFixed(2) : 0.0);
        // Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss)
        const winProb = winCount / totalTrades;
        const lossProb = lossCount / totalTrades;
        const expectancy = +(winProb * averageWin - lossProb * averageLoss).toFixed(2);
        const averageR = rCount > 0 ? +(totalR / rCount).toFixed(2) : 0;
        const netPnl = +(grossProfit - grossLoss).toFixed(2);
        const validCapital = typeof initialCapital === "number" && initialCapital > 0 ? initialCapital : 10000;
        const netReturnPct = +((netPnl / validCapital) * 100).toFixed(2);
        const recoveryFactor = maxDrawdown > 0 ? +(netPnl / maxDrawdown).toFixed(2) : 0.0;
        // Sharpe Ratio calculation requiring at least 2 distinct observations
        let sharpeRatio = 0.0;
        if (closedTrades.length >= 2) {
            const returns = closedTrades.map(t => t.netPnlPct || 0);
            const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
            const variance = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / (returns.length - 1);
            const stdDev = Math.sqrt(variance);
            if (stdDev > 0.0001) {
                const annualSharpe = (meanReturn / stdDev) * Math.sqrt(252);
                sharpeRatio = isFinite(annualSharpe) ? +annualSharpe.toFixed(2) : 0.0;
            }
        }
        const longWinRate = totalLongs > 0 ? +((longWins / totalLongs) * 100).toFixed(2) : 0;
        const shortWinRate = totalShorts > 0 ? +((shortWins / totalShorts) * 100).toFixed(2) : 0;
        return {
            totalTrades,
            winningTrades: winCount,
            losingTrades: lossCount,
            winRate,
            lossRate,
            averageWin,
            averageLoss,
            profitFactor,
            expectancy,
            averageR,
            netPnl,
            netReturnPct: isFinite(netReturnPct) ? netReturnPct : 0.0,
            maxDrawdown: +maxDrawdown.toFixed(2),
            maxDrawdownPct: isFinite(maxDrawdownPct) ? +maxDrawdownPct.toFixed(2) : 0.0,
            sharpeRatio,
            recoveryFactor,
            longWinRate,
            shortWinRate
        };
    }
    /**
     * Performance breakdown by session (London, New York, Asian)
     */
    static breakdownBySession(trades) {
        const sessions = ["London", "New York", "Asian", "Overlap"];
        const breakdown = {};
        for (const sess of sessions) {
            const filtered = trades.filter(t => t.session?.toLowerCase() === sess.toLowerCase());
            const wins = filtered.filter(t => t.netPnl > 0).length;
            const pnl = filtered.reduce((acc, t) => acc + t.netPnl, 0);
            breakdown[sess] = {
                trades: filtered.length,
                winRate: filtered.length > 0 ? +((wins / filtered.length) * 100).toFixed(1) : 0,
                netPnl: +pnl.toFixed(2)
            };
        }
        return breakdown;
    }
}
exports.PerformanceAnalytics = PerformanceAnalytics;
