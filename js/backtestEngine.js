/**
 * Trading-OS Quantitative Backtesting Engine
 * Simulates high-precision, bar-by-bar algorithmic order executions
 * Author: Khalid Abdullah (Trading-OS)
 */

const BacktestEngine = {
    /**
     * Run full backtest on candle series
     */
    run(candles, strategy, params, config = {}) {
        const initialCapital = config.initialCapital || 10000;
        const feeRate = (config.feePct !== undefined ? config.feePct : 0.075) / 100;
        const slippageRate = (config.slippagePct !== undefined ? config.slippagePct : 0.02) / 100;
        const positionSizePct = (config.positionSizePct || 100) / 100;

        const tpPct = (params.takeProfitPct || 3.0) / 100;
        const slPct = (params.stopLossPct || 1.5) / 100;

        // Generate raw strategy signals
        const rawSignals = strategy.execute(candles, params);
        
        // Map signals by bar index for O(1) lookup
        const signalMap = new Map();
        rawSignals.forEach(sig => {
            signalMap.set(sig.index, sig);
        });

        let capital = initialCapital;
        let peakCapital = initialCapital;
        let maxDrawdownAmt = 0;
        let maxDrawdownPct = 0;

        const trades = [];
        const equityCurve = [];
        const chartMarkers = [];

        let currentPosition = null; // { entryIndex, entryTime, entryPrice, qty, tpPrice, slPrice }

        for (let i = 0; i < candles.length; i++) {
            const candle = candles[i];
            const signal = signalMap.get(i);

            // 1. If currently in position, check if intra-bar TP or SL is triggered first
            if (currentPosition) {
                let exitPrice = null;
                let exitReason = '';

                // Check Stop Loss hit
                if (candle.low <= currentPosition.slPrice) {
                    exitPrice = currentPosition.slPrice * (1 - slippageRate);
                    exitReason = 'Stop Loss Hit 🛑';
                }
                // Check Take Profit hit
                else if (candle.high >= currentPosition.tpPrice) {
                    exitPrice = currentPosition.tpPrice * (1 - slippageRate);
                    exitReason = 'Take Profit Hit 🎯';
                }
                // Check Strategy Exit Signal
                else if (signal && signal.type === 'EXIT') {
                    exitPrice = candle.close * (1 - slippageRate);
                    exitReason = signal.reason || 'Strategy Exit Signal ⚡';
                }

                // If exit triggered, close the position
                if (exitPrice !== null) {
                    const grossReturn = (exitPrice - currentPosition.entryPrice) / currentPosition.entryPrice;
                    const positionCapital = currentPosition.capitalAllocated;
                    const grossPnl = positionCapital * grossReturn;
                    
                    const entryFee = positionCapital * feeRate;
                    const exitFee = (positionCapital + grossPnl) * feeRate;
                    const netPnl = grossPnl - entryFee - exitFee;
                    const netPnlPct = (netPnl / positionCapital) * 100;

                    capital += netPnl;

                    trades.push({
                        tradeId: trades.length + 1,
                        type: 'LONG',
                        entryIndex: currentPosition.entryIndex,
                        entryTime: currentPosition.entryTime,
                        entryPrice: currentPosition.entryPrice,
                        exitIndex: i,
                        exitTime: candle.time,
                        exitPrice: parseFloat(exitPrice.toFixed(4)),
                        capitalAllocated: positionCapital,
                        netPnl: parseFloat(netPnl.toFixed(2)),
                        netPnlPct: parseFloat(netPnlPct.toFixed(2)),
                        exitReason,
                        isWin: netPnl > 0,
                        durationBars: i - currentPosition.entryIndex,
                        capitalAfter: parseFloat(capital.toFixed(2))
                    });

                    // Add chart marker for Exit
                    chartMarkers.push({
                        time: candle.time,
                        position: 'aboveBar',
                        color: netPnl > 0 ? '#10B981' : '#EF4444',
                        shape: 'arrowDown',
                        text: `EXIT (${netPnlPct > 0 ? '+' : ''}${netPnlPct.toFixed(1)}%)`
                    });

                    currentPosition = null;
                }
            }

            // 2. Check for New Entry if flat
            if (!currentPosition && signal && signal.type === 'BUY') {
                const entryPrice = candle.close * (1 + slippageRate);
                const capitalAllocated = capital * positionSizePct;
                const tpPrice = entryPrice * (1 + tpPct);
                const slPrice = entryPrice * (1 - slPct);

                currentPosition = {
                    entryIndex: i,
                    entryTime: candle.time,
                    entryPrice: parseFloat(entryPrice.toFixed(4)),
                    capitalAllocated,
                    tpPrice,
                    slPrice
                };

                // Add chart marker for Buy
                chartMarkers.push({
                    time: candle.time,
                    position: 'belowBar',
                    color: '#06B6D4',
                    shape: 'arrowUp',
                    text: 'BUY'
                });
            }

            // Calculate current floating capital for equity curve
            let currentEquity = capital;
            if (currentPosition) {
                const floatingReturn = (candle.close - currentPosition.entryPrice) / currentPosition.entryPrice;
                currentEquity = capital + (currentPosition.capitalAllocated * floatingReturn);
            }

            if (currentEquity > peakCapital) {
                peakCapital = currentEquity;
            }
            const currentDd = peakCapital - currentEquity;
            const currentDdPct = peakCapital > 0 ? (currentDd / peakCapital) * 100 : 0;

            if (currentDd > maxDrawdownAmt) maxDrawdownAmt = currentDd;
            if (currentDdPct > maxDrawdownPct) maxDrawdownPct = currentDdPct;

            equityCurve.push({
                time: candle.time,
                value: parseFloat(currentEquity.toFixed(2)),
                drawdownPct: parseFloat(currentDdPct.toFixed(2))
            });
        }

        // Close any remaining open position at last bar price
        if (currentPosition) {
            const lastCandle = candles[candles.length - 1];
            const exitPrice = lastCandle.close;
            const grossReturn = (exitPrice - currentPosition.entryPrice) / currentPosition.entryPrice;
            const positionCapital = currentPosition.capitalAllocated;
            const grossPnl = positionCapital * grossReturn;
            const entryFee = positionCapital * feeRate;
            const exitFee = (positionCapital + grossPnl) * feeRate;
            const netPnl = grossPnl - entryFee - exitFee;
            const netPnlPct = (netPnl / positionCapital) * 100;

            capital += netPnl;

            trades.push({
                tradeId: trades.length + 1,
                type: 'LONG',
                entryIndex: currentPosition.entryIndex,
                entryTime: currentPosition.entryTime,
                entryPrice: currentPosition.entryPrice,
                exitIndex: candles.length - 1,
                exitTime: lastCandle.time,
                exitPrice: parseFloat(exitPrice.toFixed(4)),
                capitalAllocated: positionCapital,
                netPnl: parseFloat(netPnl.toFixed(2)),
                netPnlPct: parseFloat(netPnlPct.toFixed(2)),
                exitReason: 'Backtest End Session Close',
                isWin: netPnl > 0,
                durationBars: candles.length - 1 - currentPosition.entryIndex,
                capitalAfter: parseFloat(capital.toFixed(2))
            });
        }

        // Calculate Summary Metrics
        const totalTrades = trades.length;
        const winningTrades = trades.filter(t => t.isWin);
        const losingTrades = trades.filter(t => !t.isWin);

        const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
        const totalNetProfit = capital - initialCapital;
        const totalNetProfitPct = (totalNetProfit / initialCapital) * 100;

        const grossProfit = winningTrades.reduce((acc, t) => acc + t.netPnl, 0);
        const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.netPnl, 0));
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99.9 : 1.0);

        const avgTradePct = totalTrades > 0 ? trades.reduce((acc, t) => acc + t.netPnlPct, 0) / totalTrades : 0;
        const avgWinPct = winningTrades.length > 0 ? winningTrades.reduce((acc, t) => acc + t.netPnlPct, 0) / winningTrades.length : 0;
        const avgLossPct = losingTrades.length > 0 ? losingTrades.reduce((acc, t) => acc + t.netPnlPct, 0) / losingTrades.length : 0;

        // Sharpe Ratio Estimation
        let sharpeRatio = 0;
        if (trades.length > 2) {
            const returns = trades.map(t => t.netPnlPct);
            const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
            const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
            const stdDev = Math.sqrt(variance);
            sharpeRatio = stdDev > 0 ? (mean / stdDev) * Math.sqrt(252) : 0;
        }

        return {
            summary: {
                initialCapital,
                finalCapital: parseFloat(capital.toFixed(2)),
                netProfit: parseFloat(totalNetProfit.toFixed(2)),
                netProfitPct: parseFloat(totalNetProfitPct.toFixed(2)),
                winRate: parseFloat(winRate.toFixed(1)),
                profitFactor: parseFloat(profitFactor.toFixed(2)),
                maxDrawdownPct: parseFloat(maxDrawdownPct.toFixed(2)),
                maxDrawdownAmt: parseFloat(maxDrawdownAmt.toFixed(2)),
                totalTrades,
                winningTrades: winningTrades.length,
                losingTrades: losingTrades.length,
                avgTradePct: parseFloat(avgTradePct.toFixed(2)),
                avgWinPct: parseFloat(avgWinPct.toFixed(2)),
                avgLossPct: parseFloat(avgLossPct.toFixed(2)),
                sharpeRatio: parseFloat(sharpeRatio.toFixed(2))
            },
            trades,
            equityCurve,
            chartMarkers
        };
    }
};

if (typeof window !== 'undefined') {
    window.BacktestEngine = BacktestEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BacktestEngine;
}
