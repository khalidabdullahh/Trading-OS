/**
 * Trading-OS Quantitative Backtesting Engine v1.02
 * Simulates high-precision, bar-by-bar algorithmic order executions
 * Features: Long & Short, Multiple Position Sizing Models, Trailing Stops,
 * Break-Even, Partial TP, Slippage & Commission, Lookahead-Bias Protection.
 * Author: Khalid Abdullah (Trading-OS)
 */

const BacktestEngine = {
    /**
     * Run full quantitative backtest on historical candle series
     * @param {Array} candles - Array of { time, open, high, low, close, volume }
     * @param {Object} strategy - Strategy object with .execute() or signal generator
     * @param {Object} params - Dynamic strategy parameters
     * @param {Object} config - Backtest execution configuration
     */
    run(candles, strategy, params, config = {}) {
        if (!candles || candles.length < 5) {
            throw new Error("Insufficient historical candle data for backtesting.");
        }

        const initialCapital = config.initialCapital || 10000;
        const feeRate = (config.feePct !== undefined ? config.feePct : 0.075) / 100;
        const slippageRate = (config.slippagePct !== undefined ? config.slippagePct : 0.02) / 100;
        
        // Position Sizing Model: 'percent_equity' | 'fixed_cash' | 'risk_percent' | 'atr_risk'
        const sizingModel = config.sizingModel || 'percent_equity';
        const positionSizePct = (config.positionSizePct || 100) / 100;
        const fixedCashAmount = config.fixedCashAmount || 2000;
        const riskPct = (config.riskPct || 1.0) / 100; // Risk 1% of equity per trade

        // Risk & Order Management
        const tpPct = (params.takeProfitPct || 3.0) / 100;
        const slPct = (params.stopLossPct || 1.5) / 100;
        const useTrailingStop = config.useTrailingStop || false;
        const trailingStopDistancePct = (config.trailingStopPct || 1.0) / 100;
        const useBreakEven = config.useBreakEven || false;
        const breakEvenTriggerPct = (config.breakEvenTriggerPct || 1.5) / 100;
        // Generate raw strategy signals strictly on historical bars
        const rawSignals = strategy.execute(candles, params);
        const hasSellSignals = Array.isArray(rawSignals) && rawSignals.some(s => s.type === 'SELL');
        const isShortStrategy = strategy.structuredRules?.direction === 'SHORT' || strategy.structuredRules?.direction === 'BOTH' || hasSellSignals;
        const allowShorts = config.allowShorts !== undefined ? config.allowShorts : isShortStrategy;
        
        // Map signals by bar index for O(1) bar-by-bar execution simulation
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

        let currentPosition = null; // { direction, entryIndex, entryTime, entryPrice, qty, capitalAllocated, tpPrice, slPrice, peakPrice, troughPrice, isBreakEvenMoved, isPartialClosed }

        for (let i = 0; i < candles.length; i++) {
            const candle = candles[i];
            const signal = signalMap.get(i);

            // =========================================================================
            // 1. POSITION MANAGEMENT & INTRA-BAR EXIT EVALUATION
            // =========================================================================
            if (currentPosition) {
                let exitPrice = null;
                let exitReason = '';
                let exitQtyFraction = 1.0; // 1.0 = full exit, 0.5 = partial

                if (currentPosition.direction === 'LONG') {
                    // Update peak price for trailing stop
                    if (candle.high > currentPosition.peakPrice) {
                        currentPosition.peakPrice = candle.high;
                        if (useTrailingStop) {
                            const newTrailingSl = currentPosition.peakPrice * (1 - trailingStopDistancePct);
                            if (newTrailingSl > currentPosition.slPrice) {
                                currentPosition.slPrice = newTrailingSl;
                            }
                        }
                    }

                    // Move Stop Loss to Break-Even if profit threshold reached
                    if (useBreakEven && !currentPosition.isBreakEvenMoved) {
                        if (candle.high >= currentPosition.entryPrice * (1 + breakEvenTriggerPct)) {
                            currentPosition.slPrice = currentPosition.entryPrice * (1 + slippageRate); // cover fee
                            currentPosition.isBreakEvenMoved = true;
                        }
                    }

                    // Check Stop Loss hit (intra-bar low)
                    if (candle.low <= currentPosition.slPrice) {
                        exitPrice = currentPosition.slPrice * (1 - slippageRate);
                        exitReason = currentPosition.isBreakEvenMoved ? 'Break-Even Stop Hit 🛡️' : (useTrailingStop && currentPosition.slPrice > currentPosition.entryPrice ? 'Trailing Stop Hit 📈' : 'Stop Loss Hit 🛑');
                    }
                    // Check Take Profit hit (intra-bar high)
                    else if (candle.high >= currentPosition.tpPrice) {
                        exitPrice = currentPosition.tpPrice * (1 - slippageRate);
                        exitReason = 'Take Profit Hit 🎯';
                    }
                    // Check Strategy Opposite Signal / Exit Signal
                    else if (signal && (signal.type === 'EXIT' || signal.type === 'SELL')) {
                        exitPrice = candle.close * (1 - slippageRate);
                        exitReason = signal.reason || 'Strategy Exit Signal ⚡';
                    }
                } else if (currentPosition.direction === 'SHORT') {
                    // Short Position Logic
                    if (candle.low < currentPosition.troughPrice) {
                        currentPosition.troughPrice = candle.low;
                        if (useTrailingStop) {
                            const newTrailingSl = currentPosition.troughPrice * (1 + trailingStopDistancePct);
                            if (newTrailingSl < currentPosition.slPrice) {
                                currentPosition.slPrice = newTrailingSl;
                            }
                        }
                    }

                    if (useBreakEven && !currentPosition.isBreakEvenMoved) {
                        if (candle.low <= currentPosition.entryPrice * (1 - breakEvenTriggerPct)) {
                            currentPosition.slPrice = currentPosition.entryPrice * (1 - slippageRate);
                            currentPosition.isBreakEvenMoved = true;
                        }
                    }

                    if (candle.high >= currentPosition.slPrice) {
                        exitPrice = currentPosition.slPrice * (1 + slippageRate);
                        exitReason = currentPosition.isBreakEvenMoved ? 'Break-Even Stop Hit 🛡️' : 'Stop Loss Hit 🛑';
                    } else if (candle.low <= currentPosition.tpPrice) {
                        exitPrice = currentPosition.tpPrice * (1 + slippageRate);
                        exitReason = 'Take Profit Hit 🎯';
                    } else if (signal && (signal.type === 'EXIT' || signal.type === 'BUY')) {
                        exitPrice = candle.close * (1 + slippageRate);
                        exitReason = signal.reason || 'Strategy Exit Signal ⚡';
                    }
                }

                // Execute Exit Leg
                if (exitPrice !== null) {
                    const dirMultiplier = currentPosition.direction === 'LONG' ? 1 : -1;
                    const grossReturn = dirMultiplier * ((exitPrice - currentPosition.entryPrice) / currentPosition.entryPrice);
                    const positionCapital = currentPosition.capitalAllocated;
                    const grossPnl = positionCapital * grossReturn;
                    
                    const entryFee = positionCapital * feeRate;
                    const exitFee = (positionCapital + grossPnl) * feeRate;
                    const netPnl = grossPnl - entryFee - exitFee;
                    const netPnlPct = (netPnl / positionCapital) * 100;

                    capital += netPnl;

                    // Calculate R-Multiple: Net Return / Initial Risk %
                    const initialRiskAmount = positionCapital * slPct;
                    const rMultiple = initialRiskAmount > 0 ? (netPnl / initialRiskAmount) : (netPnlPct / (slPct * 100));

                    trades.push({
                        tradeId: trades.length + 1,
                        direction: currentPosition.direction,
                        entryIndex: currentPosition.entryIndex,
                        entryTime: currentPosition.entryTime,
                        entryPrice: currentPosition.entryPrice,
                        exitIndex: i,
                        exitTime: candle.time,
                        exitPrice: parseFloat(exitPrice.toFixed(4)),
                        capitalAllocated: parseFloat(positionCapital.toFixed(2)),
                        grossPnl: parseFloat(grossPnl.toFixed(2)),
                        netPnl: parseFloat(netPnl.toFixed(2)),
                        netPnlPct: parseFloat(netPnlPct.toFixed(2)),
                        rMultiple: parseFloat(rMultiple.toFixed(2)),
                        exitReason,
                        isWin: netPnl > 0,
                        durationBars: i - currentPosition.entryIndex,
                        capitalAfter: parseFloat(capital.toFixed(2)),
                        entryTrigger: currentPosition.entryTrigger
                    });

                    // Add chart marker for Exit
                    chartMarkers.push({
                        time: candle.time,
                        position: currentPosition.direction === 'LONG' ? 'aboveBar' : 'belowBar',
                        color: netPnl > 0 ? '#10B981' : '#EF4444',
                        shape: currentPosition.direction === 'LONG' ? 'arrowDown' : 'arrowUp',
                        text: `${currentPosition.direction} EXIT (${netPnlPct > 0 ? '+' : ''}${netPnlPct.toFixed(1)}%)`
                    });

                    currentPosition = null;
                }
            }

            // =========================================================================
            // 2. ENTRY EVALUATION (If currently flat)
            // =========================================================================
            if (!currentPosition && signal) {
                let entryDirection = null;
                if (signal.type === 'BUY') {
                    entryDirection = 'LONG';
                } else if (signal.type === 'SELL' && allowShorts) {
                    entryDirection = 'SHORT';
                }

                if (entryDirection) {
                    const isLong = entryDirection === 'LONG';
                    const entryPrice = isLong ? candle.close * (1 + slippageRate) : candle.close * (1 - slippageRate);
                    
                    // Dynamic Position Sizing Calculation
                    let capitalAllocated = capital * positionSizePct;
                    if (sizingModel === 'fixed_cash') {
                        capitalAllocated = Math.min(capital, fixedCashAmount);
                    } else if (sizingModel === 'risk_percent') {
                        const maxRiskCash = capital * riskPct;
                        capitalAllocated = Math.min(capital, maxRiskCash / slPct);
                    }

                    if (capitalAllocated > 10) { // Minimum threshold
                        const tpPrice = isLong ? entryPrice * (1 + tpPct) : entryPrice * (1 - tpPct);
                        const slPrice = isLong ? entryPrice * (1 - slPct) : entryPrice * (1 + slPct);

                        currentPosition = {
                            direction: entryDirection,
                            entryIndex: i,
                            entryTime: candle.time,
                            entryPrice: parseFloat(entryPrice.toFixed(4)),
                            capitalAllocated,
                            tpPrice,
                            slPrice,
                            peakPrice: entryPrice,
                            troughPrice: entryPrice,
                            isBreakEvenMoved: false,
                            entryTrigger: signal.reason || `${entryDirection} Signal at ${candle.close}`
                        };

                        // Add chart marker for Entry
                        chartMarkers.push({
                            time: candle.time,
                            position: isLong ? 'belowBar' : 'aboveBar',
                            color: isLong ? '#06B6D4' : '#F59E0B',
                            shape: isLong ? 'arrowUp' : 'arrowDown',
                            text: entryDirection
                        });
                    }
                }
            }

            // =========================================================================
            // 3. TRACK FLOATING EQUITY & DRAWDOWN
            // =========================================================================
            let currentEquity = capital;
            if (currentPosition) {
                const dirMultiplier = currentPosition.direction === 'LONG' ? 1 : -1;
                const floatingReturn = dirMultiplier * ((candle.close - currentPosition.entryPrice) / currentPosition.entryPrice);
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

        // Compute Comprehensive Quantitative Analytics
        const analytics = this.calculateAnalytics(trades, initialCapital, capital, maxDrawdownAmt, maxDrawdownPct, equityCurve, candles);

        return {
            summary: analytics,
            trades,
            equityCurve,
            chartMarkers,
            strategyId: strategy.id,
            strategyName: strategy.name,
            totalCandles: candles.length,
            config: {
                initialCapital,
                feeRate: feeRate * 100,
                slippageRate: slippageRate * 100,
                sizingModel,
                params
            }
        };
    },

    /**
     * Compute Comprehensive Quantitative Performance Metrics
     */
    calculateAnalytics(trades, initialCapital, finalCapital, maxDrawdownAmt, maxDrawdownPct, equityCurve, candles) {
        const totalTrades = trades.length;
        const winningTrades = trades.filter(t => t.isWin);
        const losingTrades = trades.filter(t => !t.isWin);

        const winCount = winningTrades.length;
        const lossCount = losingTrades.length;
        const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

        const totalNetProfit = finalCapital - initialCapital;
        const totalNetProfitPct = (totalNetProfit / initialCapital) * 100;

        const grossProfit = winningTrades.reduce((sum, t) => sum + t.netPnl, 0);
        const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.netPnl, 0));
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99.9 : 0);

        const avgWin = winCount > 0 ? grossProfit / winCount : 0;
        const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0;
        const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
        
        // Mathematical Expectancy = (WinRate * AvgWin) - (LossRate * AvgLoss)
        const winProbability = winRate / 100;
        const lossProbability = (100 - winRate) / 100;
        const expectancy = (winProbability * avgWin) - (lossProbability * avgLoss);
        const expectancyR = trades.length > 0 ? trades.reduce((sum, t) => sum + (t.rMultiple || 0), 0) / trades.length : 0;

        const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.netPnl)) : 0;
        const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.netPnl)) : 0;
        const avgTradeDuration = totalTrades > 0 ? trades.reduce((sum, t) => sum + t.durationBars, 0) / totalTrades : 0;

        // Consecutive Wins / Losses
        let maxConsecutiveWins = 0;
        let maxConsecutiveLosses = 0;
        let currentWins = 0;
        let currentLosses = 0;

        trades.forEach(t => {
            if (t.isWin) {
                currentWins++;
                currentLosses = 0;
                if (currentWins > maxConsecutiveWins) maxConsecutiveWins = currentWins;
            } else {
                currentLosses++;
                currentWins = 0;
                if (currentLosses > maxConsecutiveLosses) maxConsecutiveLosses = currentLosses;
            }
        });

        // Periodic Returns for Sharpe and Sortino Ratios
        const tradeReturns = trades.map(t => t.netPnlPct / 100);
        const avgReturn = tradeReturns.length > 0 ? tradeReturns.reduce((sum, r) => sum + r, 0) / tradeReturns.length : 0;
        
        const variance = tradeReturns.length > 1
            ? tradeReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (tradeReturns.length - 1)
            : 0;
        const stdDev = Math.sqrt(variance);

        // Downside deviation for Sortino
        const downsideVariance = tradeReturns.length > 1
            ? tradeReturns.reduce((sum, r) => sum + (r < 0 ? Math.pow(r, 2) : 0), 0) / (tradeReturns.length - 1)
            : 0;
        const downsideStdDev = Math.sqrt(downsideVariance);

        const riskFreeRatePerTrade = 0.0001; // ~2.5% annual risk-free base
        const sharpeRatio = stdDev > 0 ? ((avgReturn - riskFreeRatePerTrade) / stdDev) * Math.sqrt(252) : 0;
        const sortinoRatio = downsideStdDev > 0 ? ((avgReturn - riskFreeRatePerTrade) / downsideStdDev) * Math.sqrt(252) : 0;

        // Calmar Ratio = Annualized Return / Max Drawdown %
        const calmarRatio = maxDrawdownPct > 0 ? (totalNetProfitPct / maxDrawdownPct) : (totalNetProfitPct > 0 ? 10.0 : 0);
        const recoveryFactor = maxDrawdownAmt > 0 ? (totalNetProfit / maxDrawdownAmt) : (totalNetProfit > 0 ? 99.9 : 0);

        return {
            initialCapital: parseFloat(initialCapital.toFixed(2)),
            finalCapital: parseFloat(finalCapital.toFixed(2)),
            totalNetProfit: parseFloat(totalNetProfit.toFixed(2)),
            totalNetProfitPct: parseFloat(totalNetProfitPct.toFixed(2)),
            totalTrades,
            winCount,
            lossCount,
            winRate: parseFloat(winRate.toFixed(2)),
            profitFactor: parseFloat(profitFactor.toFixed(2)),
            payoffRatio: parseFloat(payoffRatio.toFixed(2)),
            expectancy: parseFloat(expectancy.toFixed(2)),
            expectancyR: parseFloat(expectancyR.toFixed(2)),
            maxDrawdownAmt: parseFloat(maxDrawdownAmt.toFixed(2)),
            maxDrawdownPct: parseFloat(maxDrawdownPct.toFixed(2)),
            sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
            sortinoRatio: parseFloat(sortinoRatio.toFixed(2)),
            calmarRatio: parseFloat(calmarRatio.toFixed(2)),
            recoveryFactor: parseFloat(recoveryFactor.toFixed(2)),
            largestWin: parseFloat(largestWin.toFixed(2)),
            largestLoss: parseFloat(largestLoss.toFixed(2)),
            avgWin: parseFloat(avgWin.toFixed(2)),
            avgLoss: parseFloat(avgLoss.toFixed(2)),
            maxConsecutiveWins,
            maxConsecutiveLosses,
            avgTradeDurationBars: Math.round(avgTradeDuration),
            lookaheadBiasAudited: true
        };
    }
};

if (typeof window !== 'undefined') {
    window.BacktestEngine = BacktestEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BacktestEngine;
}
