/**
 * Trading-OS Walk-Forward & Out-of-Sample (OOS) Validation Engine v1.02
 * Evaluates strategy persistence across unseen market regimes to detect curve-fitting
 * Author: Khalid Abdullah (Trading-OS)
 */

const WalkForwardEngine = {
    /**
     * Run Walk-Forward / Out-of-Sample Analysis
     * @param {Array} candles - Full historical candle series
     * @param {Object} strategy - Strategy instance
     * @param {Object} params - Strategy parameters
     * @param {Object} config - { trainRatio: 0.60, valRatio: 0.20, testRatio: 0.20 }
     */
    runAnalysis(candles, strategy, params, config = {}) {
        if (!candles || candles.length < 50) {
            throw new Error("Walk-Forward testing requires at least 50 historical candles.");
        }

        const trainRatio = config.trainRatio || 0.60;
        const testRatio = 1.0 - trainRatio;

        const splitIndex = Math.floor(candles.length * trainRatio);

        const inSampleCandles = candles.slice(0, splitIndex);
        const outOfSampleCandles = candles.slice(splitIndex);

        // Run In-Sample (Training) Backtest
        const inSampleResult = BacktestEngine.run(inSampleCandles, strategy, params, config);

        // Run Out-of-Sample (Testing / Unseen) Backtest
        const outOfSampleResult = BacktestEngine.run(outOfSampleCandles, strategy, params, config);

        // Calculate Walk-Forward Efficiency (WFE)
        const isReturn = inSampleResult.summary.totalNetProfitPct;
        const oosReturn = outOfSampleResult.summary.totalNetProfitPct;

        const isPf = inSampleResult.summary.profitFactor;
        const oosPf = outOfSampleResult.summary.profitFactor;

        // WFE % = (OOS Return / In-Sample Return) scaled for equal duration
        const isDuration = inSampleCandles.length;
        const oosDuration = outOfSampleCandles.length;
        const annualizedIsReturn = isDuration > 0 ? (isReturn / isDuration) : 0;
        const annualizedOosReturn = oosDuration > 0 ? (oosReturn / oosDuration) : 0;

        let wfePct = 0;
        if (annualizedIsReturn > 0) {
            wfePct = (annualizedOosReturn / annualizedIsReturn) * 100;
        } else if (annualizedIsReturn <= 0 && annualizedOosReturn > 0) {
            wfePct = 100; // OOS performed better
        }

        // Degradation %: measures loss of edge on unseen data
        const pfDegradation = isPf > 0 ? Math.max(0, ((isPf - oosPf) / isPf) * 100) : 0;

        // Robustness Status Classification
        let verdict = 'Robust Persistence';
        let badgeColor = 'emerald';
        let explanation = 'Strategy maintained strong performance on out-of-sample unseen data with minimal degradation.';

        if (wfePct < 40 || oosReturn < 0) {
            verdict = 'Overfitted / High Degradation';
            badgeColor = 'rose';
            explanation = 'Strategy suffered severe performance loss on unseen data, indicating potential curve-fitting.';
        } else if (wfePct < 70 || pfDegradation > 30) {
            verdict = 'Moderate Robustness';
            badgeColor = 'amber';
            explanation = 'Strategy showed acceptable persistence but experienced moderate edge decay on unseen data.';
        }

        return {
            inSample: {
                candlesCount: inSampleCandles.length,
                startTime: inSampleCandles[0].time,
                endTime: inSampleCandles[inSampleCandles.length - 1].time,
                summary: inSampleResult.summary,
                tradesCount: inSampleResult.trades.length,
                equityCurve: inSampleResult.equityCurve
            },
            outOfSample: {
                candlesCount: outOfSampleCandles.length,
                startTime: outOfSampleCandles[0].time,
                endTime: outOfSampleCandles[outOfSampleCandles.length - 1].time,
                summary: outOfSampleResult.summary,
                tradesCount: outOfSampleResult.trades.length,
                equityCurve: outOfSampleResult.equityCurve
            },
            metrics: {
                wfePct: parseFloat(wfePct.toFixed(1)),
                pfDegradationPct: parseFloat(pfDegradation.toFixed(1)),
                verdict,
                badgeColor,
                explanation
            },
            splitTime: outOfSampleCandles[0].time
        };
    }
};

if (typeof window !== 'undefined') {
    window.WalkForwardEngine = WalkForwardEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WalkForwardEngine;
}
