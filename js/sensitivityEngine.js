/**
 * Trading-OS Parameter Sensitivity Explorer v1.02
 * Evaluates parameter stability regions to differentiate robust plateaus from fragile curve-fitted spikes
 * Author: Khalid Abdullah (Trading-OS)
 */

const SensitivityEngine = {
    /**
     * Run 2D Parameter Sensitivity Matrix
     * @param {Array} candles - Historical candle series
     * @param {Object} strategy - Strategy instance
     * @param {Object} baseParams - Current base parameters
     * @param {Object} param1Config - { key: 'takeProfitPct', label: 'Take Profit %', min: 1.5, max: 5.0, steps: 5 }
     * @param {Object} param2Config - { key: 'stopLossPct', label: 'Stop Loss %', min: 0.8, max: 2.8, steps: 5 }
     */
    run2DSensitivity(candles, strategy, baseParams, param1Config, param2Config) {
        if (!candles || candles.length < 30) {
            throw new Error("Sensitivity analysis requires historical candles.");
        }

        const p1Key = param1Config?.key || 'takeProfitPct';
        const p1Label = param1Config?.label || 'Take Profit (%)';
        const p1Min = param1Config?.min !== undefined ? param1Config.min : 1.5;
        const p1Max = param1Config?.max !== undefined ? param1Config.max : 4.5;
        const p1Steps = param1Config?.steps || 5;

        const p2Key = param2Config?.key || 'stopLossPct';
        const p2Label = param2Config?.label || 'Stop Loss (%)';
        const p2Min = param2Config?.min !== undefined ? param2Config.min : 0.8;
        const p2Max = param2Config?.max !== undefined ? param2Config.max : 2.4;
        const p2Steps = param2Config?.steps || 5;

        const p1Values = [];
        const p1StepSize = (p1Max - p1Min) / (p1Steps - 1);
        for (let i = 0; i < p1Steps; i++) {
            p1Values.push(parseFloat((p1Min + (i * p1StepSize)).toFixed(1)));
        }

        const p2Values = [];
        const p2StepSize = (p2Max - p2Min) / (p2Steps - 1);
        for (let i = 0; i < p2Steps; i++) {
            p2Values.push(parseFloat((p2Min + (i * p2StepSize)).toFixed(1)));
        }

        const matrix = [];
        let totalProfitableCells = 0;
        let totalCells = p1Values.length * p2Values.length;
        let maxProfitCell = { returnPct: -999, p1: 0, p2: 0 };
        let allReturns = [];

        for (let r = 0; r < p1Values.length; r++) {
            const row = [];
            const v1 = p1Values[r];

            for (let c = 0; c < p2Values.length; c++) {
                const v2 = p2Values[c];
                const testParams = { ...baseParams, [p1Key]: v1, [p2Key]: v2 };

                try {
                    const result = BacktestEngine.run(candles, strategy, testParams, { positionSizePct: 100 });
                    const netReturnPct = result.summary.totalNetProfitPct;
                    const winRate = result.summary.winRate;
                    const pf = result.summary.profitFactor;
                    const tradesCount = result.summary.totalTrades;

                    allReturns.push(netReturnPct);
                    if (netReturnPct > 0) totalProfitableCells++;

                    if (netReturnPct > maxProfitCell.returnPct) {
                        maxProfitCell = { returnPct: netReturnPct, p1: v1, p2: v2 };
                    }

                    row.push({
                        p1Value: v1,
                        p2Value: v2,
                        returnPct: netReturnPct,
                        winRate,
                        profitFactor: pf,
                        tradesCount
                    });
                } catch (e) {
                    row.push({
                        p1Value: v1,
                        p2Value: v2,
                        returnPct: 0,
                        winRate: 0,
                        profitFactor: 0,
                        tradesCount: 0
                    });
                }
            }
            matrix.push(row);
        }

        // Calculate Parameter Robustness Score
        const profitableRatio = (totalProfitableCells / totalCells) * 100;
        
        // Return Variance across matrix
        const meanReturn = allReturns.reduce((sum, r) => sum + r, 0) / (allReturns.length || 1);
        const variance = allReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (allReturns.length || 1);
        const stdDev = Math.sqrt(variance);

        let stabilityVerdict = 'Broad Stable Plateau';
        let stabilityExplanation = 'Strategy maintains positive expectancy across adjacent parameter combinations.';

        if (profitableRatio < 40) {
            stabilityVerdict = 'High Parameter Fragility (Cliff-Edge Risk)';
            stabilityExplanation = 'Profitability exists only in an isolated pocket surrounded by losses. Likely overfitted.';
        } else if (profitableRatio < 70 || stdDev > 25) {
            stabilityVerdict = 'Moderate Parameter Sensitivity';
            stabilityExplanation = 'Acceptable parameter tolerance with moderate dispersion across ranges.';
        }

        return {
            p1Name: p1Label,
            p2Name: p2Label,
            p1Values,
            p2Values,
            matrix,
            stats: {
                profitableRatioPct: parseFloat(profitableRatio.toFixed(1)),
                stdDev: parseFloat(stdDev.toFixed(2)),
                maxReturnPct: parseFloat(maxProfitCell.returnPct.toFixed(2)),
                bestParams: { [p1Key]: maxProfitCell.p1, [p2Key]: maxProfitCell.p2 },
                stabilityVerdict,
                stabilityExplanation
            }
        };
    }
};

if (typeof window !== 'undefined') {
    window.SensitivityEngine = SensitivityEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SensitivityEngine;
}
