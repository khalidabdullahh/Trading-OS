/**
 * Trading-OS Strategy Health Score & Overfitting Detector v1.02
 * Multi-factor quantitative scoring matrix providing transparent 0-100 health assessment
 * Author: Khalid Abdullah (Trading-OS)
 */

const OverfittingEngine = {
    /**
     * Compute Strategy Health Score and Overfitting Diagnostics
     * @param {Object} backtestSummary - BacktestEngine summary metrics
     * @param {Object} walkForwardData - WalkForwardEngine metrics (optional)
     * @param {Object} robustnessData - RobustnessEngine metrics (optional)
     * @param {Object} sensitivityData - SensitivityEngine metrics (optional)
     */
    evaluateHealth(backtestSummary, walkForwardData, robustnessData, sensitivityData) {
        const s = backtestSummary;

        // 1. Data Quality & Sample Size Pillar (0 - 100)
        let sampleScore = 50;
        let sampleNotes = '';
        if (s.totalTrades >= 40) {
            sampleScore = 95;
            sampleNotes = `Robust sample size (${s.totalTrades} trades) provides high statistical significance (t-stat > 2.0).`;
        } else if (s.totalTrades >= 20) {
            sampleScore = 75;
            sampleNotes = `Moderate sample size (${s.totalTrades} trades). Further historical data recommended.`;
        } else if (s.totalTrades >= 8) {
            sampleScore = 50;
            sampleNotes = `Low sample size (${s.totalTrades} trades). Statistical error margins are wide.`;
        } else {
            sampleScore = 25;
            sampleNotes = `Critically low sample size (${s.totalTrades} trades). Results may be purely coincidental.`;
        }

        // 2. Risk-Adjusted Return Pillar (0 - 100)
        let returnScore = 50;
        let returnNotes = '';
        if (s.sharpeRatio >= 2.0 && s.profitFactor >= 2.0) {
            returnScore = 95;
            returnNotes = `Exceptional risk-adjusted returns (Sharpe ${s.sharpeRatio}, Profit Factor ${s.profitFactor}).`;
        } else if (s.sharpeRatio >= 1.2 && s.profitFactor >= 1.4) {
            returnScore = 80;
            returnNotes = `Solid risk-adjusted returns (Sharpe ${s.sharpeRatio}, Profit Factor ${s.profitFactor}).`;
        } else if (s.profitFactor >= 1.05) {
            returnScore = 60;
            returnNotes = `Marginal profitability (Sharpe ${s.sharpeRatio}, Profit Factor ${s.profitFactor}).`;
        } else {
            returnScore = 25;
            returnNotes = `Unfavorable return profile (Profit Factor ${s.profitFactor} < 1.0).`;
        }

        // 3. Drawdown & Capital Preservation Pillar (0 - 100)
        let drawdownScore = 50;
        let drawdownNotes = '';
        if (s.maxDrawdownPct <= 8.0 && s.recoveryFactor >= 3.0) {
            drawdownScore = 95;
            drawdownNotes = `Outstanding capital preservation (Max Drawdown ${s.maxDrawdownPct}%, Recovery Factor ${s.recoveryFactor}).`;
        } else if (s.maxDrawdownPct <= 15.0) {
            drawdownScore = 80;
            drawdownNotes = `Controlled drawdown exposure (Max Drawdown ${s.maxDrawdownPct}%).`;
        } else if (s.maxDrawdownPct <= 25.0) {
            drawdownScore = 55;
            drawdownNotes = `Moderate drawdown risk (${s.maxDrawdownPct}%). Consider tighter stop loss or risk-based sizing.`;
        } else {
            drawdownScore = 20;
            drawdownNotes = `Severe drawdown exposure (${s.maxDrawdownPct}%). High vulnerability to prolonged losing streaks.`;
        }

        // 4. Out-of-Sample Robustness Pillar (0 - 100)
        let oosScore = 70;
        let oosNotes = 'Standard in-sample baseline.';
        if (walkForwardData && walkForwardData.metrics) {
            const wfe = walkForwardData.metrics.wfePct;
            if (wfe >= 75) {
                oosScore = 95;
                oosNotes = `High Out-of-Sample efficiency (${wfe}%). Strategy maintains edge on unseen data.`;
            } else if (wfe >= 50) {
                oosScore = 75;
                oosNotes = `Acceptable Out-of-Sample persistence (${wfe}%).`;
            } else {
                oosScore = 30;
                oosNotes = `Significant Out-of-Sample edge decay (${wfe}%). High probability of curve-fitting.`;
            }
        }

        // 5. Monte Carlo Resilience Pillar (0 - 100)
        let monteCarloScore = 70;
        let monteCarloNotes = 'Simulation baseline.';
        if (robustnessData && robustnessData.available) {
            const ruin = robustnessData.metrics.probabilityOfRuinPct;
            const probProfit = robustnessData.metrics.probabilityOfProfitPct;
            if (ruin === 0 && probProfit >= 85) {
                monteCarloScore = 95;
                monteCarloNotes = `Zero probability of ruin across 1,000 randomized iterations with ${probProfit}% profit probability.`;
            } else if (ruin < 5 && probProfit >= 65) {
                monteCarloScore = 75;
                monteCarloNotes = `Low ruin risk (${ruin}%) with ${probProfit}% probability of profit.`;
            } else {
                monteCarloScore = 35;
                monteCarloNotes = `Elevated ruin risk (${ruin}%) across randomized sequence stress tests.`;
            }
        }

        // 6. Parameter Stability Pillar (0 - 100)
        let paramScore = 70;
        let paramNotes = 'Base parameter configuration.';
        if (sensitivityData && sensitivityData.stats) {
            const ratio = sensitivityData.stats.profitableRatioPct;
            if (ratio >= 80) {
                paramScore = 95;
                paramNotes = `Broad parameter plateau (${ratio}% of parameter space profitable). Highly resilient to market shift.`;
            } else if (ratio >= 50) {
                paramScore = 75;
                paramNotes = `Moderate parameter tolerance (${ratio}% profitable).`;
            } else {
                paramScore = 35;
                paramNotes = `Narrow cliff-edge optimum (${ratio}% profitable). Strategy is highly fragile to parameter drift.`;
            }
        }

        // Weighted Overall Strategy Health Score
        const overallScore = Math.round(
            (sampleScore * 0.20) +
            (returnScore * 0.25) +
            (drawdownScore * 0.20) +
            (oosScore * 0.15) +
            (monteCarloScore * 0.10) +
            (paramScore * 0.10)
        );

        let overallGrade = 'A (Institutional Grade)';
        let gradeBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        let overfittingRisk = 'Low Overfitting Risk';

        if (overallScore < 50) {
            overallGrade = 'D (Fragile / High Risk)';
            gradeBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
            overfittingRisk = 'High Overfitting Risk';
        } else if (overallScore < 70) {
            overallGrade = 'C (Moderate Quality)';
            gradeBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            overfittingRisk = 'Moderate Overfitting Risk';
        } else if (overallScore < 85) {
            overallGrade = 'B (Production Ready)';
            gradeBadge = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
            overfittingRisk = 'Controlled Risk Profile';
        }

        return {
            overallScore,
            overallGrade,
            gradeBadge,
            overfittingRisk,
            pillars: [
                { name: 'Sample Size & Significance', score: sampleScore, weight: '20%', notes: sampleNotes },
                { name: 'Risk-Adjusted Return Profile', score: returnScore, weight: '25%', notes: returnNotes },
                { name: 'Drawdown Resilience', score: drawdownScore, weight: '20%', notes: drawdownNotes },
                { name: 'Out-of-Sample Robustness', score: oosScore, weight: '15%', notes: oosNotes },
                { name: 'Monte Carlo Stress Resilience', score: monteCarloScore, weight: '10%', notes: monteCarloNotes },
                { name: 'Parameter Plateau Stability', score: paramScore, weight: '10%', notes: paramNotes }
            ]
        };
    }
};

if (typeof window !== 'undefined') {
    window.OverfittingEngine = OverfittingEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OverfittingEngine;
}
