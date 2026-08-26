/**
 * Trading-OS Algorithmic Strategy Registry & Pine Script v5 Transpiler
 * Author: Khalid Abdullah (Trading-OS)
 */

const StrategyRegistry = [
    {
        id: 'ema_scalp',
        name: '⚡ Dynamic EMA Ribbon Trend Scalper',
        category: 'Trend Following',
        badge: 'High Frequency',
        priceUSD: 9,
        priceBDT: 999,
        description: 'Multi-EMA momentum scalper with dynamic 200 EMA trend filter and ATR-based trailing stop. Highly effective for 5m and 15m crypto scalping.',
        defaultParams: {
            fastEma: 9,
            slowEma: 21,
            trendEma: 200,
            takeProfitPct: 2.5,
            stopLossPct: 1.2
        },
        paramConfig: [
            { key: 'fastEma', label: 'Fast EMA Length', type: 'number', min: 3, max: 50, step: 1 },
            { key: 'slowEma', label: 'Slow EMA Length', type: 'number', min: 10, max: 100, step: 1 },
            { key: 'trendEma', label: 'Trend Filter EMA', type: 'number', min: 50, max: 300, step: 10 },
            { key: 'takeProfitPct', label: 'Take Profit (%)', type: 'number', min: 0.5, max: 15, step: 0.1 },
            { key: 'stopLossPct', label: 'Stop Loss (%)', type: 'number', min: 0.3, max: 10, step: 0.1 }
        ],
        execute(candles, params) {
            const closes = candles.map(c => c.close);
            const fast = Indicators.ema(closes, params.fastEma);
            const slow = Indicators.ema(closes, params.slowEma);
            const trend = Indicators.ema(closes, params.trendEma);

            const signals = []; // { index, type: 'BUY' | 'SELL' | 'EXIT', price, reason }

            for (let i = 1; i < candles.length; i++) {
                if (fast[i] === null || slow[i] === null || trend[i] === null) continue;
                if (fast[i - 1] === null || slow[i - 1] === null) continue;

                // Long Entry: Fast EMA crosses ABOVE Slow EMA & Close is above Trend Filter
                const isCrossUp = fast[i - 1] <= slow[i - 1] && fast[i] > slow[i];
                const isAboveTrend = closes[i] > trend[i];

                if (isCrossUp && isAboveTrend) {
                    signals.push({
                        index: i,
                        time: candles[i].time,
                        type: 'BUY',
                        price: candles[i].close,
                        reason: `Fast EMA(${params.fastEma}) crossed Slow EMA(${params.slowEma}) above Trend EMA(${params.trendEma})`
                    });
                }

                // Short / Exit condition: Fast crosses below Slow
                const isCrossDown = fast[i - 1] >= slow[i - 1] && fast[i] < slow[i];
                if (isCrossDown) {
                    signals.push({
                        index: i,
                        time: candles[i].time,
                        type: 'EXIT',
                        price: candles[i].close,
                        reason: `Fast EMA crossed below Slow EMA`
                    });
                }
            }
            return signals;
        },
        generatePineScript(params, symbol = 'BTCUSDT', timeframe = '15m') {
            return `//@version=5
// =============================================================================
// Strategy: Dynamic EMA Ribbon Trend Scalper
// Author: Khalid Abdullah | Trading-OS Platform
// Repository: https://github.com/khalidabdullahh/Trading-OS
// Target Pair: ${symbol} | Timeframe: ${timeframe}
// =============================================================================
strategy("Trading-OS: EMA Ribbon Trend Scalper [v5]", overlay=true, initial_capital=1000, default_qty_type=strategy.percent_of_equity, default_qty_value=100, commission_type=strategy.commission.percent, commission_value=0.075)

// --- Inputs ---
fastLen   = input.int(${params.fastEma}, "Fast EMA Length", minval=1, group="Indicator Parameters")
slowLen   = input.int(${params.slowEma}, "Slow EMA Length", minval=1, group="Indicator Parameters")
trendLen  = input.int(${params.trendEma}, "Trend Filter EMA", minval=1, group="Indicator Parameters")
tpPercent = input.float(${params.takeProfitPct}, "Take Profit (%)", minval=0.1, step=0.1, group="Risk Management")
slPercent = input.float(${params.stopLossPct}, "Stop Loss (%)", minval=0.1, step=0.1, group="Risk Management")

// --- Indicator Calculations ---
fastEma  = ta.ema(close, fastLen)
slowEma  = ta.ema(close, slowLen)
trendEma = ta.ema(close, trendLen)

// --- Plot Indicators ---
plot(fastEma,  "Fast EMA",  color=color.green,  linewidth=2)
plot(slowEma,  "Slow EMA",  color=color.orange, linewidth=2)
plot(trendEma, "Trend EMA", color=color.blue,   linewidth=3)

// --- Entry / Exit Conditions ---
bullishCross = ta.crossover(fastEma, slowEma)
aboveTrend   = close > trendEma
bearishCross = ta.crossunder(fastEma, slowEma)

longCondition = bullishCross and aboveTrend

// --- Strategy Execution ---
if (longCondition)
    strategy.entry("Long", strategy.long, comment="BUY Signal")
    
if (bearishCross and strategy.position_size > 0)
    strategy.close("Long", comment="EMA Cross Exit")

// --- TP / SL Brackets ---
longTP = strategy.position_avg_price * (1 + tpPercent / 100)
longSL = strategy.position_avg_price * (1 - slPercent / 100)

if (strategy.position_size > 0)
    strategy.exit("TP/SL Exit", from_entry="Long", limit=longTP, stop=longSL)

// --- Visual Alerts ---
plotshape(longCondition, title="Long Alert", location=location.belowbar, color=color.green, style=shape.triangleup, size=size.small, text="BUY")
`;
        }
    },

    {
        id: 'smart_money_rsi',
        name: '💎 Smart Money RSI & MACD Divergence Hunter',
        category: 'Momentum & Reversal',
        badge: 'Institutional Alpha',
        priceUSD: 9,
        priceBDT: 999,
        description: 'Identifies high-conviction liquidity sweeps and momentum shift traps using smoothed Wilder RSI oversold zones with MACD bullish histogram expansions.',
        defaultParams: {
            rsiLength: 14,
            rsiOversold: 32,
            rsiOverbought: 68,
            macdFast: 12,
            macdSlow: 26,
            macdSignal: 9,
            takeProfitPct: 3.5,
            stopLossPct: 1.5
        },
        paramConfig: [
            { key: 'rsiLength', label: 'RSI Period', type: 'number', min: 5, max: 30, step: 1 },
            { key: 'rsiOversold', label: 'RSI Oversold Level', type: 'number', min: 15, max: 40, step: 1 },
            { key: 'rsiOverbought', label: 'RSI Overbought Level', type: 'number', min: 60, max: 85, step: 1 },
            { key: 'takeProfitPct', label: 'Take Profit (%)', type: 'number', min: 1, max: 20, step: 0.1 },
            { key: 'stopLossPct', label: 'Stop Loss (%)', type: 'number', min: 0.5, max: 10, step: 0.1 }
        ],
        execute(candles, params) {
            const closes = candles.map(c => c.close);
            const rsi = Indicators.rsi(closes, params.rsiLength);
            const macdObj = Indicators.macd(closes, params.macdFast, params.macdSlow, params.macdSignal);

            const signals = [];

            for (let i = 2; i < candles.length; i++) {
                if (rsi[i] === null || macdObj.histogram[i] === null) continue;
                if (rsi[i - 1] === null || macdObj.histogram[i - 1] === null) continue;

                // Long Entry: RSI was oversold within last 3 bars & MACD Histogram flips positive
                const wasOversold = (rsi[i - 1] < params.rsiOversold || rsi[i - 2] < params.rsiOversold);
                const macdFlipGreen = macdObj.histogram[i - 1] <= 0 && macdObj.histogram[i] > 0;

                if (wasOversold && macdFlipGreen) {
                    signals.push({
                        index: i,
                        time: candles[i].time,
                        type: 'BUY',
                        price: candles[i].close,
                        reason: `RSI Oversold (${rsi[i].toFixed(1)}) + MACD Histogram Positive Flip`
                    });
                }

                // Exit condition: RSI hits Overbought or MACD flips negative
                const isOverbought = rsi[i] >= params.rsiOverbought;
                const macdFlipRed = macdObj.histogram[i - 1] >= 0 && macdObj.histogram[i] < 0;

                if (isOverbought || macdFlipRed) {
                    signals.push({
                        index: i,
                        time: candles[i].time,
                        type: 'EXIT',
                        price: candles[i].close,
                        reason: `RSI Overbought or MACD Momentum Exhaustion`
                    });
                }
            }
            return signals;
        },
        generatePineScript(params, symbol = 'BTCUSDT', timeframe = '15m') {
            return `//@version=5
// =============================================================================
// Strategy: Smart Money RSI & MACD Divergence Hunter
// Author: Khalid Abdullah | Trading-OS Platform
// Repository: https://github.com/khalidabdullahh/Trading-OS
// Target Pair: ${symbol} | Timeframe: ${timeframe}
// =============================================================================
strategy("Trading-OS: Smart Money RSI-MACD Hunter [v5]", overlay=true, initial_capital=1000, default_qty_type=strategy.percent_of_equity, default_qty_value=100, commission_type=strategy.commission.percent, commission_value=0.075)

// --- Inputs ---
rsiLen   = input.int(${params.rsiLength}, "RSI Length", minval=1, group="RSI Settings")
rsiOS    = input.int(${params.rsiOversold}, "RSI Oversold Threshold", minval=1, maxval=50, group="RSI Settings")
rsiOB    = input.int(${params.rsiOverbought}, "RSI Overbought Threshold", minval=50, maxval=100, group="RSI Settings")
fastLen  = input.int(12, "MACD Fast Length", minval=1, group="MACD Settings")
slowLen  = input.int(26, "MACD Slow Length", minval=1, group="MACD Settings")
sigLen   = input.int(9, "MACD Signal Length", minval=1, group="MACD Settings")
tpPct    = input.float(${params.takeProfitPct}, "Take Profit (%)", minval=0.1, step=0.1, group="Risk Management")
slPct    = input.float(${params.stopLossPct}, "Stop Loss (%)", minval=0.1, step=0.1, group="Risk Management")

// --- Indicator Calculations ---
rsiVal = ta.rsi(close, rsiLen)
[macdLine, signalLine, hist] = ta.macd(close, fastLen, slowLen, sigLen)

// --- Signal Triggers ---
wasOversold    = (rsiVal[1] < rsiOS) or (rsiVal[2] < rsiOS)
macdFlipBull   = ta.crossover(hist, 0)
longSignal     = wasOversold and macdFlipBull
exitSignal     = (rsiVal > rsiOB) or ta.crossunder(hist, 0)

// --- Strategy Orders ---
if (longSignal)
    strategy.entry("Long", strategy.long, comment="RSI+MACD Sweep")

if (exitSignal and strategy.position_size > 0)
    strategy.close("Long", comment="Reversal Exhaustion")

longTP = strategy.position_avg_price * (1 + tpPct / 100)
longSL = strategy.position_avg_price * (1 - slPct / 100)

if (strategy.position_size > 0)
    strategy.exit("Bracket Exit", from_entry="Long", limit=longTP, stop=longSL)

plotshape(longSignal, title="Buy Signal", location=location.belowbar, color=color.aqua, style=shape.labelup, size=size.small, text="ALPHA BUY")
`;
        }
    },

    {
        id: 'supertrend_breakout',
        name: '🚀 SuperTrend ATR Volatility Breakout Pro',
        category: 'Volatility Breakout',
        badge: 'High Win Rate',
        priceUSD: 9,
        priceBDT: 999,
        description: 'Adaptive ATR volatility expansion engine that rides multi-candle trends while locking in profits with dynamic step-trailing bands.',
        defaultParams: {
            atrPeriod: 10,
            atrMultiplier: 3.0,
            volumeThreshold: 1.2,
            takeProfitPct: 4.0,
            stopLossPct: 1.8
        },
        paramConfig: [
            { key: 'atrPeriod', label: 'ATR Period', type: 'number', min: 5, max: 30, step: 1 },
            { key: 'atrMultiplier', label: 'ATR Multiplier', type: 'number', min: 1.0, max: 6.0, step: 0.1 },
            { key: 'takeProfitPct', label: 'Take Profit (%)', type: 'number', min: 1.0, max: 20, step: 0.1 },
            { key: 'stopLossPct', label: 'Stop Loss (%)', type: 'number', min: 0.5, max: 10, step: 0.1 }
        ],
        execute(candles, params) {
            const stObj = Indicators.superTrend(candles, params.atrPeriod, params.atrMultiplier);
            const signals = [];

            for (let i = 1; i < candles.length; i++) {
                if (stObj.direction[i] === null || stObj.direction[i - 1] === null) continue;

                // Flip from Bearish (-1) to Bullish (1)
                if (stObj.direction[i - 1] === -1 && stObj.direction[i] === 1) {
                    signals.push({
                        index: i,
                        time: candles[i].time,
                        type: 'BUY',
                        price: candles[i].close,
                        reason: `SuperTrend Bullish Flip (ATR: ${params.atrPeriod}, Mult: ${params.atrMultiplier})`
                    });
                }

                // Flip from Bullish (1) to Bearish (-1)
                if (stObj.direction[i - 1] === 1 && stObj.direction[i] === -1) {
                    signals.push({
                        index: i,
                        time: candles[i].time,
                        type: 'EXIT',
                        price: candles[i].close,
                        reason: `SuperTrend Bearish Flip`
                    });
                }
            }
            return signals;
        },
        generatePineScript(params, symbol = 'BTCUSDT', timeframe = '15m') {
            return `//@version=5
// =============================================================================
// Strategy: SuperTrend ATR Volatility Breakout Pro
// Author: Khalid Abdullah | Trading-OS Platform
// Repository: https://github.com/khalidabdullahh/Trading-OS
// Target Pair: ${symbol} | Timeframe: ${timeframe}
// =============================================================================
strategy("Trading-OS: SuperTrend Volatility Breakout [v5]", overlay=true, initial_capital=1000, default_qty_type=strategy.percent_of_equity, default_qty_value=100, commission_type=strategy.commission.percent, commission_value=0.075)

// --- Inputs ---
atrPeriod = input.int(${params.atrPeriod}, "ATR Length", minval=1, group="SuperTrend Engine")
factor    = input.float(${params.atrMultiplier}, "ATR Multiplier", minval=0.1, step=0.1, group="SuperTrend Engine")
tpPct     = input.float(${params.takeProfitPct}, "Take Profit (%)", minval=0.1, step=0.1, group="Risk Control")
slPct     = input.float(${params.stopLossPct}, "Stop Loss (%)", minval=0.1, step=0.1, group="Risk Control")

// --- Calculations ---
[superTrendVal, dir] = ta.supertrend(factor, atrPeriod)

// --- Plotting ---
bodyColor = dir < 0 ? color.new(color.green, 20) : color.new(color.red, 20)
plot(superTrendVal, "SuperTrend Line", color=bodyColor, linewidth=2)

// --- Strategy Triggers ---
buyCondition  = ta.crossover(close, superTrendVal)
exitCondition = ta.crossunder(close, superTrendVal)

if (buyCondition)
    strategy.entry("Long", strategy.long, comment="ST Bullish Breakout")

if (exitCondition and strategy.position_size > 0)
    strategy.close("Long", comment="ST Trailing Stop")

longTP = strategy.position_avg_price * (1 + tpPct / 100)
longSL = strategy.position_avg_price * (1 - slPct / 100)

if (strategy.position_size > 0)
    strategy.exit("Bracket", from_entry="Long", limit=longTP, stop=longSL)

plotshape(buyCondition, title="Buy Signal", location=location.belowbar, color=color.green, style=shape.arrowup, size=size.normal, text="SUPERTREND")
`;
        }
    },

    {
        id: 'bollinger_stoch_reversion',
        name: '🎯 Bollinger Band Mean Reversion & Stochastic Trap',
        category: 'Mean Reversion',
        badge: 'Range Trader',
        priceUSD: 9,
        priceBDT: 999,
        description: 'Catches extreme deviation bottoms when price pierces below the Lower Bollinger Band while Stochastic Oscillator crosses upward in oversold territory.',
        defaultParams: {
            bbLength: 20,
            bbMult: 2.0,
            stochK: 14,
            stochD: 3,
            takeProfitPct: 2.8,
            stopLossPct: 1.4
        },
        paramConfig: [
            { key: 'bbLength', label: 'Bollinger Period', type: 'number', min: 10, max: 50, step: 1 },
            { key: 'bbMult', label: 'Bollinger StdDev Multiplier', type: 'number', min: 1.0, max: 3.5, step: 0.1 },
            { key: 'takeProfitPct', label: 'Take Profit (%)', type: 'number', min: 0.5, max: 15, step: 0.1 },
            { key: 'stopLossPct', label: 'Stop Loss (%)', type: 'number', min: 0.5, max: 10, step: 0.1 }
        ],
        execute(candles, params) {
            const closes = candles.map(c => c.close);
            const bb = Indicators.bollingerBands(closes, params.bbLength, params.bbMult);
            const stoch = Indicators.stochastic(candles, params.stochK, params.stochD);
            const signals = [];

            for (let i = 1; i < candles.length; i++) {
                if (bb.lower[i] === null || stoch.k[i] === null || stoch.d[i] === null) continue;
                if (stoch.k[i - 1] === null || stoch.d[i - 1] === null) continue;

                // Long Entry: Low penetrated Lower BB & Stoch %K crosses above %D under 25
                const bbLowerTouch = candles[i].low <= bb.lower[i] || candles[i - 1].low <= bb.lower[i - 1];
                const stochCrossUp = stoch.k[i - 1] <= stoch.d[i - 1] && stoch.k[i] > stoch.d[i];
                const stochOversold = stoch.k[i] < 30;

                if (bbLowerTouch && stochCrossUp && stochOversold) {
                    signals.push({
                        index: i,
                        time: candles[i].time,
                        type: 'BUY',
                        price: candles[i].close,
                        reason: `Lower Bollinger Pierced + Stoch Bullish Crossover (${stoch.k[i].toFixed(1)})`
                    });
                }

                // Exit condition: Price touches Upper Band or Mid Band target
                if (candles[i].high >= bb.upper[i]) {
                    signals.push({
                        index: i,
                        time: candles[i].time,
                        type: 'EXIT',
                        price: candles[i].close,
                        reason: `Upper Bollinger Band Reached`
                    });
                }
            }
            return signals;
        },
        generatePineScript(params, symbol = 'BTCUSDT', timeframe = '15m') {
            return `//@version=5
// =============================================================================
// Strategy: Bollinger Band Mean Reversion & Stochastic Trap
// Author: Khalid Abdullah | Trading-OS Platform
// Repository: https://github.com/khalidabdullahh/Trading-OS
// Target Pair: ${symbol} | Timeframe: ${timeframe}
// =============================================================================
strategy("Trading-OS: Bollinger Mean Reversion [v5]", overlay=true, initial_capital=1000, default_qty_type=strategy.percent_of_equity, default_qty_value=100, commission_type=strategy.commission.percent, commission_value=0.075)

// --- Inputs ---
bbLen  = input.int(${params.bbLength}, "Bollinger Period", minval=1, group="Bollinger Bands")
bbMult = input.float(${params.bbMult}, "StdDev Multiplier", minval=0.1, step=0.1, group="Bollinger Bands")
stochK = input.int(14, "%K Length", minval=1, group="Stochastic")
stochD = input.int(3, "%D Smoothing", minval=1, group="Stochastic")
tpPct  = input.float(${params.takeProfitPct}, "Take Profit (%)", minval=0.1, step=0.1, group="Risk Controls")
slPct  = input.float(${params.stopLossPct}, "Stop Loss (%)", minval=0.1, step=0.1, group="Risk Controls")

// --- Calculations ---
[middle, upper, lower] = ta.bb(close, bbLen, bbMult)
k = ta.sma(ta.stoch(close, high, low, stochK), 3)
d = ta.sma(k, stochD)

// --- Plots ---
plot(upper, "Upper Band", color=color.red, linewidth=1)
plot(middle, "Middle Band", color=color.gray, linewidth=1)
plot(lower, "Lower Band", color=color.green, linewidth=1)

// --- Logic ---
touchLower  = low <= lower or low[1] <= lower[1]
stochCross  = ta.crossover(k, d) and k < 30
entrySignal = touchLower and stochCross
exitSignal  = high >= upper

if (entrySignal)
    strategy.entry("Long", strategy.long, comment="BB Dip Buy")

if (exitSignal and strategy.position_size > 0)
    strategy.close("Long", comment="Upper BB Exit")

longTP = strategy.position_avg_price * (1 + tpPct / 100)
longSL = strategy.position_avg_price * (1 - slPct / 100)

if (strategy.position_size > 0)
    strategy.exit("Bracket", from_entry="Long", limit=longTP, stop=longSL)

plotshape(entrySignal, title="Buy Signal", location=location.belowbar, color=color.yellow, style=shape.diamond, size=size.normal, text="BB BUY")
`;
        }
    }
];

if (typeof window !== 'undefined') {
    window.StrategyRegistry = StrategyRegistry;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StrategyRegistry;
}
