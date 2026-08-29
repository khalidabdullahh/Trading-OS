/**
 * Trading-OS AI Trade Explainer v1.02
 * Provides deep, bar-by-bar transparent technical explanations for every executed trade
 * Author: Khalid Abdullah (Trading-OS)
 */

const TradeExplainer = {
    /**
     * Generate structured trade audit report
     * @param {Object} trade - Trade object from BacktestEngine
     * @param {Array} candles - Historical candle series
     * @param {Object} strategy - Strategy object
     * @param {Object} params - Strategy parameters
     */
    explainTrade(trade, candles, strategy, params) {
        if (!trade || !candles) return null;

        const entryCandle = candles[trade.entryIndex] || {};
        const exitCandle = candles[trade.exitIndex] || {};

        const entryTimeStr = new Date(trade.entryTime * 1000).toLocaleString();
        const exitTimeStr = new Date(trade.exitTime * 1000).toLocaleString();

        // Mathematical Price Distance Analysis
        const entryPrice = trade.entryPrice;
        const exitPrice = trade.exitPrice;
        const priceDelta = exitPrice - entryPrice;
        const priceDeltaPct = (priceDelta / entryPrice) * 100;

        // Trade Execution Breakdown
        const isLong = trade.direction === 'LONG';
        const pnlStatus = trade.isWin ? 'PROFITABLE TRADE (WIN)' : 'LOSING TRADE (LOSS)';
        const badgeColor = trade.isWin ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

        // Entry Reasons & Technical Triggers
        const entryTriggers = [];
        if (trade.entryTrigger) {
            entryTriggers.push(`Rule: ${trade.entryTrigger}`);
        } else {
            entryTriggers.push(`Algorithmic ${trade.direction} signal triggered at bar close $${entryPrice.toLocaleString()}`);
        }

        // Exit Driver
        let exitExplanation = trade.exitReason || 'Closed at bar exit';

        return {
            tradeId: trade.tradeId,
            direction: trade.direction,
            pnlStatus,
            badgeColor,
            entryTime: entryTimeStr,
            exitTime: exitTimeStr,
            entryPrice: `$${entryPrice.toLocaleString()}`,
            exitPrice: `$${exitPrice.toLocaleString()}`,
            netPnl: `${trade.netPnl >= 0 ? '+' : ''}$${trade.netPnl.toLocaleString()}`,
            netPnlPct: `${trade.netPnlPct >= 0 ? '+' : ''}${trade.netPnlPct}%`,
            rMultiple: `${trade.rMultiple >= 0 ? '+' : ''}${trade.rMultiple}R`,
            capitalAllocated: `$${trade.capitalAllocated.toLocaleString()}`,
            durationBars: `${trade.durationBars} bars (${trade.durationBars * 15} minutes approx.)`,
            exitReason: trade.exitReason,
            entryTriggers,
            exitExplanation
        };
    },

    /**
     * Render Trade Explainer Modal
     */
    renderExplainerModal(tradeData, containerElement) {
        if (!containerElement || !tradeData) return;

        containerElement.innerHTML = `
            <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
                <button id="closeExplainerModalBtn" class="absolute top-4 right-4 text-slate-400 hover:text-white text-lg">✕</button>

                <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-base">
                            🔍
                        </div>
                        <div>
                            <h3 class="font-extrabold text-white text-sm flex items-center gap-2">
                                <span>Trade Audit #${tradeData.tradeId}</span>
                                <span class="px-2 py-0.5 text-[10px] font-bold rounded border ${tradeData.badgeColor}">${tradeData.direction}</span>
                            </h3>
                            <p class="text-[11px] text-slate-400">${tradeData.pnlStatus}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="text-base font-mono font-black ${tradeData.netPnl.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}">${tradeData.netPnl}</span>
                        <span class="text-[10px] text-slate-400 block">${tradeData.netPnlPct} (${tradeData.rMultiple})</span>
                    </div>
                </div>

                <div class="space-y-3.5 text-xs">
                    <!-- Price & Execution Grid -->
                    <div class="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]">
                        <div>
                            <span class="text-slate-500 block">Entry Price</span>
                            <span class="font-mono text-slate-200 font-bold">${tradeData.entryPrice}</span>
                            <span class="text-[10px] text-slate-500 block">${tradeData.entryTime}</span>
                        </div>
                        <div>
                            <span class="text-slate-500 block">Exit Price</span>
                            <span class="font-mono text-slate-200 font-bold">${tradeData.exitPrice}</span>
                            <span class="text-[10px] text-slate-500 block">${tradeData.exitTime}</span>
                        </div>
                        <div>
                            <span class="text-slate-500 block">Position Size</span>
                            <span class="font-mono text-slate-200 font-semibold">${tradeData.capitalAllocated}</span>
                        </div>
                        <div>
                            <span class="text-slate-500 block">Trade Duration</span>
                            <span class="font-mono text-slate-200 font-semibold">${tradeData.durationBars}</span>
                        </div>
                    </div>

                    <!-- Entry Signals & Audit -->
                    <div class="space-y-1.5">
                        <span class="font-bold text-cyan-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <span>⚡ Entry Conditions Satisfied</span>
                        </span>
                        <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed font-sans text-xs">
                            ${tradeData.entryTriggers.map(t => `<div class="flex items-start gap-2"><span class="text-emerald-400">✓</span><span>${t}</span></div>`).join('')}
                        </div>
                    </div>

                    <!-- Exit Reason -->
                    <div class="space-y-1.5">
                        <span class="font-bold text-amber-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <span>🎯 Exit Trigger & Execution</span>
                        </span>
                        <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed font-sans text-xs flex items-center gap-2">
                            <span class="text-amber-400">🛑</span>
                            <span>${tradeData.exitExplanation}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const closeBtn = document.getElementById('closeExplainerModalBtn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                containerElement.classList.add('hidden');
            };
        }
    }
};

if (typeof window !== 'undefined') {
    window.TradeExplainer = TradeExplainer;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TradeExplainer;
}
