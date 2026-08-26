/**
 * Trading-OS Quantitative Visual Performance Charts v1.02
 * High-performance SVG & Canvas chart engine for quantitative outputs
 * (Win/Loss Donut, Underwater Drawdown Graph, R-Multiple Histogram, Long vs Short Split)
 * Author: Khalid Abdullah (Trading-OS)
 */

const QuantCharts = {
    /**
     * Render all quantitative visualization charts
     * @param {Object} backtestResult - Result object from BacktestEngine
     */
    renderAll(backtestResult) {
        if (!backtestResult || !backtestResult.summary) return;

        const summary = backtestResult.summary;
        const trades = backtestResult.trades || [];
        const equityCurve = backtestResult.equityCurve || [];

        this.renderWinLossDonut('donutChartContainer', summary);
        this.renderUnderwaterDrawdown('drawdownChartContainer', equityCurve);
        this.renderRMultipleHistogram('rDistChartContainer', trades);
        this.renderDirectionSplit('directionSplitChartContainer', trades);
    },

    /**
     * 1. Win / Loss Distribution Donut Chart (SVG)
     */
    renderWinLossDonut(containerId, summary) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const total = summary.totalTrades || 0;
        const wins = summary.winCount || 0;
        const losses = summary.lossCount || 0;
        const winRate = summary.winRate || 0;

        if (total === 0) {
            container.innerHTML = `<div class="flex items-center justify-center h-48 text-slate-500 text-xs">No trades to display</div>`;
            return;
        }

        // SVG Donut Calculations
        const size = 160;
        const strokeWidth = 22;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const winStroke = (winRate / 100) * circumference;
        const lossStroke = circumference - winStroke;

        container.innerHTML = `
            <div class="flex flex-col sm:flex-row items-center justify-around gap-4 h-full p-2">
                <!-- SVG Donut -->
                <div class="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 ${size} ${size}">
                        <!-- Background / Loss Ring (Red) -->
                        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="#f43f5e" stroke-width="${strokeWidth}" fill="none" opacity="0.85" />
                        <!-- Win Ring (Emerald) -->
                        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="#10b981" stroke-width="${strokeWidth}" fill="none"
                            stroke-dasharray="${winStroke} ${lossStroke}" stroke-linecap="round" />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <span class="text-xl font-black font-mono text-emerald-400 leading-none">${winRate}%</span>
                        <span class="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Win Rate</span>
                    </div>
                </div>

                <!-- Metrics Legend -->
                <div class="space-y-2 text-xs w-full max-w-[170px] font-mono">
                    <div class="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span class="text-slate-300 font-sans text-[11px]">Wins</span>
                        </div>
                        <span class="font-bold text-emerald-400">${wins} <span class="text-[10px] text-slate-500">($${summary.avgWin.toFixed(0)} avg)</span></span>
                    </div>
                    <div class="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                            <span class="text-slate-300 font-sans text-[11px]">Losses</span>
                        </div>
                        <span class="font-bold text-rose-400">${losses} <span class="text-[10px] text-slate-500">($${summary.avgLoss.toFixed(0)} avg)</span></span>
                    </div>
                    <div class="text-[10px] text-slate-400 text-center pt-1 font-sans">
                        Payoff Ratio: <strong class="text-cyan-400 font-mono">${summary.payoffRatio}</strong>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 2. Underwater Drawdown Depth Graph (SVG Area Chart)
     */
    renderUnderwaterDrawdown(containerId, equityCurve) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!equityCurve || equityCurve.length < 2) {
            container.innerHTML = `<div class="flex items-center justify-center h-48 text-slate-500 text-xs">No drawdown data</div>`;
            return;
        }

        const width = 400;
        const height = 150;
        const padding = { top: 15, right: 15, bottom: 25, left: 35 };
        const plotW = width - padding.left - padding.right;
        const plotH = height - padding.top - padding.bottom;

        // Extract Drawdown % series
        const ddValues = equityCurve.map(e => e.drawdownPct || 0);
        const maxDd = Math.max(5, ...ddValues); // Floor max at 5% for scale

        // Build SVG Path
        const stepX = plotW / (ddValues.length - 1);
        let pathD = `M ${padding.left} ${padding.top}`;

        const points = ddValues.map((dd, idx) => {
            const x = padding.left + (idx * stepX);
            const y = padding.top + ((dd / maxDd) * plotH);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        });

        pathD = `M ${padding.left} ${padding.top} L ` + points.join(' L ') + ` L ${padding.left + plotW} ${padding.top} Z`;
        const lineD = `M ` + points.join(' L ');

        container.innerHTML = `
            <div class="relative w-full h-full flex flex-col justify-between">
                <svg viewBox="0 0 ${width} ${height}" class="w-full h-36">
                    <defs>
                        <linearGradient id="underwaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.1" />
                            <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.6" />
                        </linearGradient>
                    </defs>

                    <!-- Baseline 0% line -->
                    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left + plotW}" y2="${padding.top}" stroke="#334155" stroke-width="1" stroke-dasharray="3 3" />
                    <!-- Max DD Gridline -->
                    <line x1="${padding.left}" y1="${padding.top + plotH}" x2="${padding.left + plotW}" y2="${padding.top + plotH}" stroke="#334155" stroke-width="1" stroke-dasharray="2 2" />

                    <!-- Area Fill & Stroke -->
                    <path d="${pathD}" fill="url(#underwaterGrad)" />
                    <path d="${lineD}" fill="none" stroke="#f43f5e" stroke-width="1.8" stroke-linejoin="round" />

                    <!-- Axis Labels -->
                    <text x="${padding.left - 5}" y="${padding.top + 3}" fill="#64748b" font-size="9" font-family="monospace" text-anchor="end">0%</text>
                    <text x="${padding.left - 5}" y="${padding.top + plotH + 3}" fill="#f43f5e" font-size="9" font-family="monospace" text-anchor="end">-${maxDd.toFixed(1)}%</text>
                    <text x="${width / 2}" y="${height - 4}" fill="#64748b" font-size="9" font-family="sans-serif" text-anchor="middle">Historical Trade Steps</text>
                </svg>
                <div class="flex justify-between items-center px-2 text-[10px] text-slate-400 font-mono">
                    <span>Max Drawdown: <strong class="text-rose-400 font-bold">-${maxDd.toFixed(2)}%</strong></span>
                    <span>Peak Capital Recovery: <strong class="text-emerald-400 font-bold">${ddValues[ddValues.length - 1] === 0 ? 'Recovered ✓' : `-${ddValues[ddValues.length - 1].toFixed(1)}%`}</strong></span>
                </div>
            </div>
        `;
    },

    /**
     * 3. R-Multiple Profit Distribution Histogram (SVG Bar Chart)
     */
    renderRMultipleHistogram(containerId, trades) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!trades || trades.length === 0) {
            container.innerHTML = `<div class="flex items-center justify-center h-48 text-slate-500 text-xs">No trade distributions</div>`;
            return;
        }

        // Categorize trades into R buckets: [< -1R, -1R..0R, 0R..+1R, +1R..+2R, +2R..+3R, > +3R]
        const buckets = [
            { label: '< -1R', count: 0, color: '#e11d48' },
            { label: '-1R..0R', count: 0, color: '#f43f5e' },
            { label: '0R..1R', count: 0, color: '#38bdf8' },
            { label: '1R..2R', count: 0, color: '#34d399' },
            { label: '2R..3R', count: 0, color: '#10b981' },
            { label: '> 3R', count: 0, color: '#059669' }
        ];

        trades.forEach(t => {
            const r = t.rMultiple !== undefined ? t.rMultiple : (t.netPnlPct / 1.5);
            if (r < -1.0) buckets[0].count++;
            else if (r < 0) buckets[1].count++;
            else if (r < 1.0) buckets[2].count++;
            else if (r < 2.0) buckets[3].count++;
            else if (r < 3.0) buckets[4].count++;
            else buckets[5].count++;
        });

        const maxCount = Math.max(1, ...buckets.map(b => b.count));
        const chartH = 100;

        container.innerHTML = `
            <div class="h-full flex flex-col justify-between p-1">
                <div class="flex items-end justify-between gap-1.5 h-28 pt-2 px-2 border-b border-slate-800">
                    ${buckets.map(b => {
                        const barHeight = Math.max(4, (b.count / maxCount) * chartH);
                        return `
                            <div class="flex-1 flex flex-col items-center gap-1 group relative">
                                <!-- Tooltip -->
                                <div class="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-[10px] text-white px-1.5 py-0.5 rounded font-mono pointer-events-none z-10 whitespace-nowrap">
                                    ${b.count} trades
                                </div>
                                <span class="text-[9px] font-mono text-slate-400">${b.count}</span>
                                <div class="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125" style="height: ${barHeight}px; background-color: ${b.color};"></div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="flex justify-between text-[9px] text-slate-500 font-mono px-1 pt-1.5">
                    ${buckets.map(b => `<span class="flex-1 text-center truncate">${b.label}</span>`).join('')}
                </div>
                <div class="text-center text-[10px] text-slate-400 font-sans pt-1">
                    Risk-Reward Distribution (<strong class="text-emerald-400 font-mono">${trades.filter(t => t.rMultiple > 1).length}</strong> Big Winners)
                </div>
            </div>
        `;
    },

    /**
     * 4. Long vs Short Directional Performance Split Bar
     */
    renderDirectionSplit(containerId, trades) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!trades || trades.length === 0) {
            container.innerHTML = `<div class="flex items-center justify-center h-48 text-slate-500 text-xs">No direction data</div>`;
            return;
        }

        const longs = trades.filter(t => t.direction === 'LONG');
        const shorts = trades.filter(t => t.direction === 'SHORT');

        const longWins = longs.filter(t => t.isWin).length;
        const shortWins = shorts.filter(t => t.isWin).length;

        const longWinRate = longs.length > 0 ? ((longWins / longs.length) * 100).toFixed(1) : 0;
        const shortWinRate = shorts.length > 0 ? ((shortWins / shorts.length) * 100).toFixed(1) : 0;

        const longPnl = longs.reduce((sum, t) => sum + t.netPnl, 0);
        const shortPnl = shorts.reduce((sum, t) => sum + t.netPnl, 0);

        const totalTrades = trades.length || 1;
        const longSharePct = ((longs.length / totalTrades) * 100).toFixed(0);
        const shortSharePct = ((shorts.length / totalTrades) * 100).toFixed(0);

        container.innerHTML = `
            <div class="space-y-3 p-1 font-mono text-xs">
                <!-- Long Segment -->
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5">
                    <div class="flex justify-between items-center text-[11px]">
                        <span class="text-cyan-400 font-bold flex items-center gap-1.5">
                            <span>📈 LONG Positions</span>
                            <span class="text-[10px] text-slate-500">(${longs.length} trades / ${longSharePct}%)</span>
                        </span>
                        <span class="font-bold ${longPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${longPnl >= 0 ? '+' : ''}$${longPnl.toFixed(2)}</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div class="h-1.5 rounded-full bg-cyan-500" style="width: ${longWinRate}%"></div>
                    </div>
                    <div class="flex justify-between text-[10px] text-slate-400">
                        <span>Win Rate: <strong class="text-slate-200">${longWinRate}%</strong></span>
                        <span>Wins: ${longWins} / ${longs.length}</span>
                    </div>
                </div>

                <!-- Short Segment -->
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5">
                    <div class="flex justify-between items-center text-[11px]">
                        <span class="text-amber-400 font-bold flex items-center gap-1.5">
                            <span>📉 SHORT Positions</span>
                            <span class="text-[10px] text-slate-500">(${shorts.length} trades / ${shortSharePct}%)</span>
                        </span>
                        <span class="font-bold ${shortPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${shortPnl >= 0 ? '+' : ''}$${shortPnl.toFixed(2)}</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div class="h-1.5 rounded-full bg-amber-500" style="width: ${shortWinRate}%"></div>
                    </div>
                    <div class="flex justify-between text-[10px] text-slate-400">
                        <span>Win Rate: <strong class="text-slate-200">${shortWinRate}%</strong></span>
                        <span>Wins: ${shortWins} / ${shorts.length}</span>
                    </div>
                </div>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.QuantCharts = QuantCharts;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuantCharts;
}
