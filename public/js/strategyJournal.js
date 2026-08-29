/**
 * Trading-OS Strategy Versioning & Trade Research Journal v1.02
 * Manages strategy iterations (v1.0, v1.1, v2.0), research notes, and CSV export
 * Author: Khalid Abdullah (Trading-OS)
 */

const StrategyJournal = {
    STORAGE_KEY: 'trading_os_strategy_journal',

    getSavedStrategies() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    },

    saveStrategy(strategyData, backtestSummary, notes = '', tags = ['Scalp']) {
        const saved = this.getSavedStrategies();

        // Calculate next version
        const existingVersions = saved.filter(s => s.name === strategyData.name);
        const versionNumber = existingVersions.length > 0 ? `v1.${existingVersions.length}` : 'v1.0';

        const entry = {
            id: `strat_${Date.now()}`,
            name: strategyData.name,
            version: versionNumber,
            category: strategyData.category || 'Quantitative',
            params: { ...strategyData.defaultParams },
            summary: {
                winRate: backtestSummary?.winRate || 0,
                totalNetProfitPct: backtestSummary?.totalNetProfitPct || 0,
                profitFactor: backtestSummary?.profitFactor || 0,
                maxDrawdownPct: backtestSummary?.maxDrawdownPct || 0,
                totalTrades: backtestSummary?.totalTrades || 0
            },
            notes: notes || 'Standard backtest run.',
            tags: tags || ['Scalp'],
            createdAt: new Date().toISOString(),
            formattedDate: new Date().toLocaleDateString()
        };

        saved.unshift(entry);
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saved));
        } catch (e) {}

        return entry;
    },

    deleteStrategy(id) {
        let saved = this.getSavedStrategies();
        saved = saved.filter(s => s.id !== id);
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saved));
        } catch (e) {}
        return saved;
    },

    /**
     * Export Backtest Trades to CSV File
     * @param {Array} trades - Array of trade logs from BacktestEngine
     * @param {string} strategyName - Name of the strategy
     * @param {string} symbol - Asset symbol
     */
    exportTradesToCSV(trades, strategyName = 'TradingOS_Strategy', symbol = 'BTCUSDT') {
        if (!trades || trades.length === 0) {
            alert('No trade data available to export.');
            return;
        }

        const headers = ['Trade #', 'Direction', 'Entry Time', 'Entry Price', 'Exit Time', 'Exit Price', 'Net PnL ($)', 'Net PnL (%)', 'R-Multiple', 'Exit Reason', 'Duration (Bars)'];
        const rows = trades.map(t => [
            t.tradeId,
            t.direction,
            new Date(t.entryTime * 1000).toISOString(),
            t.entryPrice,
            new Date(t.exitTime * 1000).toISOString(),
            t.exitPrice,
            t.netPnl,
            t.netPnlPct,
            t.rMultiple || 0,
            `"${(t.exitReason || '').replace(/"/g, '""')}"`,
            t.durationBars
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `TradingOS_${symbol}_${strategyName.replace(/[^a-zA-Z0-9]/g, '_')}_Trades.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

if (typeof window !== 'undefined') {
    window.StrategyJournal = StrategyJournal;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StrategyJournal;
}
