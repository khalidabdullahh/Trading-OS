/**
 * Trading-OS Monte Carlo & Robustness Lab Engine v1.02
 * Simulates thousands of randomized trade sequence paths and market stress variations
 * Author: Khalid Abdullah (Trading-OS)
 */

const RobustnessEngine = {
    /**
     * Run Monte Carlo Simulation on executed trade series
     * @param {Array} trades - Array of trade objects from BacktestEngine
     * @param {number} initialCapital - Starting equity (default 10000)
     * @param {number} iterations - Number of simulations (default 1000)
     */
    runMonteCarlo(trades, initialCapital = 10000, iterations = 1000) {
        if (!trades || trades.length < 3) {
            return {
                available: false,
                reason: "Insufficient trade sample size (minimum 3 trades required for Monte Carlo analysis)."
            };
        }

        const tradeReturns = trades.map(t => t.netPnlPct / 100);
        const simulationResults = [];
        const numTrades = trades.length;

        // Run Monte Carlo Iterations
        for (let iter = 0; iter < iterations; iter++) {
            let simCapital = initialCapital;
            let simPeak = initialCapital;
            let simMaxDdPct = 0;
            const simCurve = [simCapital];

            for (let t = 0; t < numTrades; t++) {
                // Bootstrap resampling with replacement + random market slippage perturbation (±15%)
                const randomIndex = Math.floor(Math.random() * numTrades);
                const noise = 1 + ((Math.random() - 0.5) * 0.30); // 0.85 to 1.15 multiplier
                const tradeReturn = tradeReturns[randomIndex] * noise;

                simCapital += (simCapital * tradeReturn);
                if (simCapital < 0) simCapital = 0; // Ruin floor

                if (simCapital > simPeak) simPeak = simCapital;
                const currentDd = simPeak > 0 ? ((simPeak - simCapital) / simPeak) * 100 : 0;
                if (currentDd > simMaxDdPct) simMaxDdPct = currentDd;

                simCurve.push(parseFloat(simCapital.toFixed(2)));
            }

            const netReturnPct = ((simCapital - initialCapital) / initialCapital) * 100;

            simulationResults.push({
                finalCapital: simCapital,
                netReturnPct,
                maxDrawdownPct: simMaxDdPct,
                curve: simCurve
            });
        }

        // Sort results to extract quantiles
        const sortedByReturn = [...simulationResults].sort((a, b) => a.netReturnPct - b.netReturnPct);
        const sortedByDrawdown = [...simulationResults].sort((a, b) => a.maxDrawdownPct - b.maxDrawdownPct);

        const getPercentile = (arr, p) => arr[Math.floor(arr.length * (p / 100))];

        const worst5Return = getPercentile(sortedByReturn, 5).netReturnPct;
        const medianReturn = getPercentile(sortedByReturn, 50).netReturnPct;
        const best5Return = getPercentile(sortedByReturn, 95).netReturnPct;

        const medianDrawdown = getPercentile(sortedByDrawdown, 50).maxDrawdownPct;
        const worst5Drawdown = getPercentile(sortedByDrawdown, 95).maxDrawdownPct; // 95th percentile of drawdown = worst 5%

        // Probability of Profit (% of runs with positive return)
        const profitableRuns = simulationResults.filter(r => r.netReturnPct > 0).length;
        const probProfitPct = (profitableRuns / iterations) * 100;

        // Probability of Ruin (% of runs with drawdown > 50%)
        const ruinedRuns = simulationResults.filter(r => r.maxDrawdownPct >= 50.0).length;
        const probRuinPct = (ruinedRuns / iterations) * 100;

        // Generate Aggregate Fan Chart Paths (Trade index 0..N)
        const fanChart = [];
        for (let step = 0; step <= numTrades; step++) {
            const stepValues = simulationResults.map(r => r.curve[step]).sort((a, b) => a - b);
            fanChart.push({
                tradeStep: step,
                p5: getPercentile(stepValues, 5),
                p25: getPercentile(stepValues, 25),
                median: getPercentile(stepValues, 50),
                p75: getPercentile(stepValues, 75),
                p95: getPercentile(stepValues, 95)
            });
        }

        return {
            available: true,
            iterations,
            numTrades,
            metrics: {
                medianReturnPct: parseFloat(medianReturn.toFixed(2)),
                worst5ReturnPct: parseFloat(worst5Return.toFixed(2)),
                best5ReturnPct: parseFloat(best5Return.toFixed(2)),
                medianDrawdownPct: parseFloat(medianDrawdown.toFixed(2)),
                worst5DrawdownPct: parseFloat(worst5Drawdown.toFixed(2)),
                probabilityOfProfitPct: parseFloat(probProfitPct.toFixed(1)),
                probabilityOfRuinPct: parseFloat(probRuinPct.toFixed(2))
            },
            fanChart
        };
    }
};

if (typeof window !== 'undefined') {
    window.RobustnessEngine = RobustnessEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RobustnessEngine;
}
