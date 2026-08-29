/**
 * Trading-OS Quantitative Indicators Engine
 * High-accuracy technical analysis library designed for algorithmic trading
 * Author: Khalid Abdullah (Trading-OS)
 */

const Indicators = {
    /**
     * Simple Moving Average (SMA)
     */
    sma(data, period) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
                continue;
            }
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += data[i - j];
            }
            result.push(sum / period);
        }
        return result;
    },

    /**
     * Exponential Moving Average (EMA)
     */
    ema(data, period) {
        const result = [];
        const multiplier = 2 / (period + 1);
        let firstSma = 0;

        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
                continue;
            }
            if (i === period - 1) {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[j];
                }
                firstSma = sum / period;
                result.push(firstSma);
                continue;
            }
            const currentEma = (data[i] - result[i - 1]) * multiplier + result[i - 1];
            result.push(currentEma);
        }
        return result;
    },

    /**
     * Relative Strength Index (RSI - Wilder's Smoothing)
     */
    rsi(closes, period = 14) {
        const result = [];
        if (closes.length <= period) return closes.map(() => 50);

        let gains = [];
        let losses = [];

        for (let i = 1; i < closes.length; i++) {
            const change = closes[i] - closes[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }

        let avgGain = 0;
        let avgLoss = 0;

        for (let i = 0; i < period; i++) {
            avgGain += gains[i];
            avgLoss += losses[i];
        }
        avgGain /= period;
        avgLoss /= period;

        result.push(null); // index 0 (no delta)
        for (let i = 1; i <= period; i++) {
            if (i < period) {
                result.push(null);
            } else {
                const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                const rsiVal = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
                result.push(rsiVal);
            }
        }

        for (let i = period; i < gains.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

            if (avgLoss === 0) {
                result.push(100);
            } else {
                const rs = avgGain / avgLoss;
                result.push(100 - (100 / (1 + rs)));
            }
        }

        return result;
    },

    /**
     * Moving Average Convergence Divergence (MACD)
     */
    macd(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const fastEma = this.ema(closes, fastPeriod);
        const slowEma = this.ema(closes, slowPeriod);
        const macdLine = [];

        for (let i = 0; i < closes.length; i++) {
            if (fastEma[i] === null || slowEma[i] === null) {
                macdLine.push(null);
            } else {
                macdLine.push(fastEma[i] - slowEma[i]);
            }
        }

        const validMacdIndices = [];
        const validMacdValues = [];
        macdLine.forEach((val, idx) => {
            if (val !== null) {
                validMacdIndices.push(idx);
                validMacdValues.push(val);
            }
        });

        const rawSignal = this.ema(validMacdValues, signalPeriod);
        const signalLine = new Array(closes.length).fill(null);
        const histogram = new Array(closes.length).fill(null);

        validMacdIndices.forEach((origIdx, i) => {
            const sig = rawSignal[i];
            signalLine[origIdx] = sig;
            if (sig !== null && macdLine[origIdx] !== null) {
                histogram[origIdx] = macdLine[origIdx] - sig;
            }
        });

        return { macd: macdLine, signal: signalLine, histogram };
    },

    /**
     * Bollinger Bands
     */
    bollingerBands(closes, period = 20, multiplier = 2.0) {
        const middle = this.sma(closes, period);
        const upper = [];
        const lower = [];
        const percentB = [];

        for (let i = 0; i < closes.length; i++) {
            if (middle[i] === null) {
                upper.push(null);
                lower.push(null);
                percentB.push(null);
                continue;
            }

            let sumSquaredDiff = 0;
            for (let j = 0; j < period; j++) {
                sumSquaredDiff += Math.pow(closes[i - j] - middle[i], 2);
            }
            const stdDev = Math.sqrt(sumSquaredDiff / period);
            const up = middle[i] + multiplier * stdDev;
            const low = middle[i] - multiplier * stdDev;

            upper.push(up);
            lower.push(low);
            percentB.push(up === low ? 0.5 : (closes[i] - low) / (up - low));
        }

        return { upper, middle, lower, percentB };
    },

    /**
     * Average True Range (ATR)
     */
    atr(candles, period = 14) {
        if (!candles || candles.length === 0) return [];
        const tr = [candles[0].high - candles[0].low];
        for (let i = 1; i < candles.length; i++) {
            const h = candles[i].high;
            const l = candles[i].low;
            const prevClose = candles[i - 1].close;
            const trueRange = Math.max(
                h - l,
                Math.abs(h - prevClose),
                Math.abs(l - prevClose)
            );
            tr.push(trueRange);
        }

        const result = [];
        let initialSum = 0;
        for (let i = 0; i < period; i++) {
            if (i < tr.length) {
                initialSum += tr[i];
            }
            result.push(null);
        }
        if (tr.length < period) return result;

        let prevAtr = initialSum / period;
        result[period - 1] = prevAtr;

        for (let i = period; i < tr.length; i++) {
            prevAtr = (prevAtr * (period - 1) + tr[i]) / period;
            result.push(prevAtr);
        }

        return result;
    },

    /**
     * SuperTrend Indicator
     */
    superTrend(candles, period = 10, multiplier = 3.0) {
        const atrValues = this.atr(candles, period);
        const supertrend = [];
        const direction = []; // 1 for Bullish/Long, -1 for Bearish/Short

        let prevUpperBand = 0;
        let prevLowerBand = 0;
        let prevSuperTrend = 0;
        let prevDirection = 1;

        for (let i = 0; i < candles.length; i++) {
            if (atrValues[i] === null) {
                supertrend.push(null);
                direction.push(1);
                continue;
            }

            const hl2 = (candles[i].high + candles[i].low) / 2;
            let upperBand = hl2 + multiplier * atrValues[i];
            let lowerBand = hl2 - multiplier * atrValues[i];

            if (i > 0 && atrValues[i - 1] !== null) {
                if (lowerBand > prevLowerBand || candles[i - 1].close < prevLowerBand) {
                    // lowerBand holds
                } else {
                    lowerBand = prevLowerBand;
                }

                if (upperBand < prevUpperBand || candles[i - 1].close > prevUpperBand) {
                    // upperBand holds
                } else {
                    upperBand = prevUpperBand;
                }
            }

            let currentDir = prevDirection;

            if (prevSuperTrend === prevUpperBand) {
                currentDir = candles[i].close > upperBand ? 1 : -1;
            } else {
                currentDir = candles[i].close < lowerBand ? -1 : 1;
            }

            const currentSt = currentDir === 1 ? lowerBand : upperBand;

            supertrend.push(currentSt);
            direction.push(currentDir);

            prevUpperBand = upperBand;
            prevLowerBand = lowerBand;
            prevSuperTrend = currentSt;
            prevDirection = currentDir;
        }

        return { supertrend, direction };
    },

    /**
     * Stochastic Oscillator
     */
    stochastic(candles, kPeriod = 14, dPeriod = 3, smoothK = 3) {
        const rawK = [];

        for (let i = 0; i < candles.length; i++) {
            if (i < kPeriod - 1) {
                rawK.push(50);
                continue;
            }
            let highest = -Infinity;
            let lowest = Infinity;
            for (let j = 0; j < kPeriod; j++) {
                const c = candles[i - j];
                if (c.high > highest) highest = c.high;
                if (c.low < lowest) lowest = c.low;
            }
            const currentClose = candles[i].close;
            const k = highest === lowest ? 50 : ((currentClose - lowest) / (highest - lowest)) * 100;
            rawK.push(k);
        }

        const k = this.sma(rawK, smoothK);
        const validK = k.map(v => v === null ? 50 : v);
        const d = this.sma(validK, dPeriod);

        return { k, d };
    },

    /**
     * Volume Weighted Average Price (VWAP)
     */
    vwap(candles) {
        if (!candles || candles.length === 0) return [];
        const result = [];
        let cumTypicalVolume = 0;
        let cumVolume = 0;

        for (let i = 0; i < candles.length; i++) {
            const c = candles[i];
            const typicalPrice = (c.high + c.low + c.close) / 3;
            const vol = (c.volume && c.volume > 0) ? c.volume : 1;

            cumTypicalVolume += typicalPrice * vol;
            cumVolume += vol;

            result.push(cumVolume > 0 ? cumTypicalVolume / cumVolume : c.close);
        }
        return result;
    }
};

if (typeof window !== 'undefined') {
    window.Indicators = Indicators;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Indicators;
}
