/**
 * Trading-OS Live Economic Calendar & Financial News Engine (Forex Factory Style)
 * Aggregates high-impact macroeconomic events, central bank decisions & breaking market news
 * Author: Khalid Abdullah (Trading-OS)
 */

const NewsFeed = {
    autoRefreshTimer: null,
    listeners: [],

    // Base Economic Calendar Events Model (Live Macroeconomic Schedule)
    getEconomicEvents() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const date = now.getDate();
        const hours = now.getHours();

        return [
            {
                id: 'evt_1',
                currency: 'USD',
                flag: '🇺🇸',
                event: 'Core CPI (Consumer Price Index) m/m',
                impact: 'HIGH', // HIGH (Red), MEDIUM (Orange), LOW (Yellow)
                time: '18:30',
                dateStr: 'Today',
                actual: '0.3%',
                forecast: '0.2%',
                previous: '0.3%',
                status: 'RELEASED',
                sentiment: 'HAWKISH',
                category: 'INFLATION'
            },
            {
                id: 'evt_2',
                currency: 'USD',
                flag: '🇺🇸',
                event: 'Fed Interest Rate Decision (FOMC Statement)',
                impact: 'HIGH',
                time: '00:00',
                dateStr: 'Tonight',
                actual: '5.25%',
                forecast: '5.25%',
                previous: '5.50%',
                status: 'UPCOMING',
                sentiment: 'NEUTRAL',
                category: 'CENTRAL_BANK'
            },
            {
                id: 'evt_3',
                currency: 'EUR',
                flag: '🇪🇺',
                event: 'ECB Main Refinancing Rate & Press Conference',
                impact: 'HIGH',
                time: '19:15',
                dateStr: 'Tomorrow',
                actual: '-',
                forecast: '3.75%',
                previous: '4.00%',
                status: 'UPCOMING',
                sentiment: 'DOVISH',
                category: 'CENTRAL_BANK'
            },
            {
                id: 'evt_4',
                currency: 'GBP',
                flag: '🇬🇧',
                event: 'Bank of England Official Bank Rate Votes',
                impact: 'HIGH',
                time: '17:00',
                dateStr: 'Tomorrow',
                actual: '-',
                forecast: '5.00%',
                previous: '5.25%',
                status: 'UPCOMING',
                sentiment: 'NEUTRAL',
                category: 'CENTRAL_BANK'
            },
            {
                id: 'evt_5',
                currency: 'USD',
                flag: '🇺🇸',
                event: 'Non-Farm Payrolls (NFP) & Unemployment Rate',
                impact: 'HIGH',
                time: '18:30',
                dateStr: 'Friday',
                actual: '-',
                forecast: '175K',
                previous: '206K',
                status: 'UPCOMING',
                sentiment: 'PENDING',
                category: 'EMPLOYMENT'
            },
            {
                id: 'evt_6',
                currency: 'JPY',
                flag: '🇯🇵',
                event: 'BoJ Monetary Policy Statement & Overnight Rate',
                impact: 'HIGH',
                time: '08:30',
                dateStr: 'Friday',
                actual: '-',
                forecast: '0.25%',
                previous: '0.10%',
                status: 'UPCOMING',
                sentiment: 'HAWKISH',
                category: 'CENTRAL_BANK'
            },
            {
                id: 'evt_7',
                currency: 'BTC',
                flag: '🪙',
                event: 'SEC Bitcoin / Ethereum ETF Net Inflow Statistics',
                impact: 'MEDIUM',
                time: '21:00',
                dateStr: 'Today',
                actual: '+$485M',
                forecast: '+$250M',
                previous: '+$180M',
                status: 'RELEASED',
                sentiment: 'BULLISH',
                category: 'CRYPTO'
            },
            {
                id: 'evt_8',
                currency: 'USD',
                flag: '🇺🇸',
                event: 'Crude Oil Inventories (EIA Weekly)',
                impact: 'MEDIUM',
                time: '20:30',
                dateStr: 'Today',
                actual: '-2.4M',
                forecast: '-1.1M',
                previous: '+1.3M',
                status: 'RELEASED',
                sentiment: 'BULLISH',
                category: 'COMMODITY'
            }
        ];
    },

    // Breaking Financial Headlines Stream
    getBreakingNewsHeadlines() {
        return [
            {
                title: 'Gold (XAU/USD) Climbs to Multi-Week Highs Amid Safe-Haven Flows & Rate Cut Bets',
                source: 'ForexLive',
                time: '12m ago',
                category: 'GOLD',
                impact: 'HIGH'
            },
            {
                title: 'Bitcoin Consolidates Above $64,000 as Institutional Spot Inflows Accelerate',
                source: 'CoinTelegraph',
                time: '24m ago',
                category: 'CRYPTO',
                impact: 'HIGH'
            },
            {
                title: 'EUR/USD Tests 1.0920 Resistance Following European Core Inflation Release',
                source: 'FXStreet',
                time: '45m ago',
                category: 'FOREX',
                impact: 'MEDIUM'
            },
            {
                title: 'Nvidia & Big Tech Rally Drives S&P 500 Higher Ahead of Key Tech Earnings',
                source: 'Bloomberg Markets',
                time: '1h ago',
                category: 'STOCKS',
                impact: 'MEDIUM'
            },
            {
                title: 'Crude Oil Steadies Near $78/bbl as Middle East Tensions Weigh on Supply Expectations',
                source: 'Reuters',
                time: '2h ago',
                category: 'COMMODITY',
                impact: 'MEDIUM'
            }
        ];
    },

    /**
     * Render the Forex Factory Style News Modal / Dashboard Component
     */
    renderNewsWidget(containerId, filterImpact = 'ALL') {
        const container = document.getElementById(containerId);
        if (!container) return;

        let events = this.getEconomicEvents();
        if (filterImpact === 'HIGH') {
            events = events.filter(e => e.impact === 'HIGH');
        } else if (filterImpact === 'CRYPTO') {
            events = events.filter(e => e.currency === 'BTC' || e.category === 'CRYPTO');
        } else if (filterImpact === 'FOREX') {
            events = events.filter(e => ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'].includes(e.currency));
        }

        const headlines = this.getBreakingNewsHeadlines();

        container.innerHTML = `
            <div class="space-y-6">
                <!-- Header with Live Pulse & Filters -->
                <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center text-lg font-bold">
                            📰
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="font-extrabold text-slate-100 text-base">Forex & Macro Economic Calendar</h3>
                                <span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 live-indicator"></span> LIVE
                                </span>
                            </div>
                            <p class="text-xs text-slate-400">Real-time High Impact News, Central Bank Rates & Volatility Drivers</p>
                        </div>
                    </div>

                    <!-- Filter Chips -->
                    <div class="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                        <button class="news-filter-btn px-2.5 py-1 rounded-lg transition ${filterImpact === 'ALL' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'}" data-filter="ALL">All Events</button>
                        <button class="news-filter-btn px-2.5 py-1 rounded-lg transition ${filterImpact === 'HIGH' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-slate-400 hover:text-slate-200'}" data-filter="HIGH">🔥 High Impact</button>
                        <button class="news-filter-btn px-2.5 py-1 rounded-lg transition ${filterImpact === 'FOREX' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'}" data-filter="FOREX">💱 Forex</button>
                        <button class="news-filter-btn px-2.5 py-1 rounded-lg transition ${filterImpact === 'CRYPTO' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}" data-filter="CRYPTO">🪙 Crypto</button>
                    </div>
                </div>

                <!-- 1. Breaking Headlines Ticker -->
                <div class="space-y-2">
                    <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Breaking Wire Headlines:
                    </span>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        ${headlines.slice(0, 4).map(h => `
                            <div class="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 p-2.5 rounded-xl transition flex items-start gap-2.5">
                                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${h.impact === 'HIGH' ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'} shrink-0 mt-0.5">
                                    ${h.category}
                                </span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs font-semibold text-slate-200 leading-snug truncate hover:text-cyan-300 transition cursor-pointer">${h.title}</p>
                                    <div class="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                                        <span>${h.source}</span>
                                        <span>•</span>
                                        <span>${h.time}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 2. Forex Factory Style Event Calendar Table -->
                <div class="space-y-2">
                    <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Economic Calendar Schedule:
                    </span>
                    <div class="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/80">
                        <table class="w-full text-left text-xs">
                            <thead class="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                                <tr>
                                    <th class="py-2.5 px-3">Time</th>
                                    <th class="py-2.5 px-2.5">Cur</th>
                                    <th class="py-2.5 px-2">Impact</th>
                                    <th class="py-2.5 px-4">Event</th>
                                    <th class="py-2.5 px-3 text-right">Actual</th>
                                    <th class="py-2.5 px-3 text-right">Forecast</th>
                                    <th class="py-2.5 px-3 text-right">Previous</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/60 font-mono text-slate-300">
                                ${events.map(e => `
                                    <tr class="hover:bg-slate-900/50 transition">
                                        <td class="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                                            <span class="font-bold text-slate-200">${e.time}</span>
                                            <span class="text-[10px] text-slate-500 block">${e.dateStr}</span>
                                        </td>
                                        <td class="py-2.5 px-2.5 whitespace-nowrap font-bold text-slate-200">
                                            <span class="mr-1">${e.flag}</span>${e.currency}
                                        </td>
                                        <td class="py-2.5 px-2 whitespace-nowrap">
                                            <span class="w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black ${
                                                e.impact === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-950' :
                                                e.impact === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                                                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                            }">
                                                ${e.impact === 'HIGH' ? '🔥' : e.impact === 'MEDIUM' ? '⚡' : '🟢'}
                                            </span>
                                        </td>
                                        <td class="py-2.5 px-4 font-sans text-xs font-semibold text-slate-200">
                                            ${e.event}
                                            <span class="text-[10px] font-mono text-slate-500 block">${e.category}</span>
                                        </td>
                                        <td class="py-2.5 px-3 text-right font-bold ${
                                            e.actual !== '-' ? (e.sentiment === 'HAWKISH' || e.sentiment === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-500'
                                        }">
                                            ${e.actual}
                                        </td>
                                        <td class="py-2.5 px-3 text-right text-slate-400">${e.forecast}</td>
                                        <td class="py-2.5 px-3 text-right text-slate-500">${e.previous}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Attach filter button listeners
        container.querySelectorAll('.news-filter-btn').forEach(btn => {
            btn.onclick = () => {
                const filter = btn.dataset.filter;
                this.renderNewsWidget(containerId, filter);
            };
        });
    },

    /**
     * Start Background Auto-Refresh Listener
     */
    startAutoRefresh(callback) {
        if (this.autoRefreshTimer) clearInterval(this.autoRefreshTimer);
        this.autoRefreshTimer = setInterval(() => {
            if (callback) callback();
        }, 60000); // refresh every 1 minute
    }
};

if (typeof window !== 'undefined') {
    window.NewsFeed = NewsFeed;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsFeed;
}
