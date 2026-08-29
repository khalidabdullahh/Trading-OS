/**
 * Trading-OS Dynamic Theme Manager & Live Theme Customizer v1.02
 * Supports Bloomberg Dark, TradingView White (Light Mode), Presets & Custom Live Color Customizer
 * Author: Khalid Abdullah (Trading-OS)
 */

const ThemeManager = {
    STORAGE_KEY: 'trading_os_active_theme',

    PRESETS: {
        dark: {
            id: 'dark',
            name: 'Bloomberg Dark',
            mode: 'dark',
            icon: '🌙',
            bgMain: '#050811',
            bgSurface: '#080d18',
            bgCard: '#0d1527',
            borderCard: '#1e293b',
            textPrimary: '#e2e8f0',
            textSecondary: '#94a3b8',
            accentCyan: '#06b6d4',
            chartBg: '#090D16',
            chartGrid: '#1E293B33',
            chartBorder: '#1E293B',
            chartText: '#94A3B8',
            bullColor: '#10B981',
            bearColor: '#EF4444'
        },
        light: {
            id: 'light',
            name: 'Light Mode',
            mode: 'light',
            icon: '☀️',
            bgMain: '#f8fafc',
            bgSurface: '#ffffff',
            bgCard: '#ffffff',
            borderCard: '#e2e8f0',
            textPrimary: '#0f172a',
            textSecondary: '#475569',
            accentCyan: '#0284c7',
            chartBg: '#ffffff',
            chartGrid: '#f1f5f9',
            chartBorder: '#e2e8f0',
            chartText: '#475569',
            bullColor: '#16a34a',
            bearColor: '#dc2626'
        },
        cyberpunk: {
            id: 'cyberpunk',
            name: 'Midnight Cyberpunk',
            mode: 'dark',
            icon: '🌌',
            bgMain: '#0b0b1a',
            bgSurface: '#121128',
            bgCard: '#171536',
            borderCard: '#2d2b55',
            textPrimary: '#f1f5f9',
            textSecondary: '#a5b4fc',
            accentCyan: '#a855f7',
            chartBg: '#0e0d22',
            chartGrid: '#2d2b5544',
            chartBorder: '#2d2b55',
            chartText: '#a5b4fc',
            bullColor: '#06b6d4',
            bearColor: '#f43f5e'
        },
        forest: {
            id: 'forest',
            name: 'Matrix Forest',
            mode: 'dark',
            icon: '🌲',
            bgMain: '#040d08',
            bgSurface: '#07150d',
            bgCard: '#0b2014',
            borderCard: '#133522',
            textPrimary: '#e2fbe8',
            textSecondary: '#86efac',
            accentCyan: '#10b981',
            chartBg: '#05110a',
            chartGrid: '#13352244',
            chartBorder: '#133522',
            chartText: '#86efac',
            bullColor: '#22c55e',
            bearColor: '#ef4444'
        }
    },

    currentTheme: null,

    init() {
        // Load saved theme or default to Bloomberg Dark
        let saved = null;
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) saved = JSON.parse(raw);
        } catch (e) {}

        if (saved && saved.id) {
            this.currentTheme = saved;
        } else {
            this.currentTheme = { ...this.PRESETS.dark };
        }

        this.applyTheme(this.currentTheme, false);
    },

    /**
     * Apply theme object across DOM, CSS variables & TradingView Charts
     */
    applyTheme(theme, save = true) {
        this.currentTheme = theme;
        const root = document.documentElement;

        // Set data-theme attribute
        root.setAttribute('data-theme', theme.mode || (theme.id === 'light' ? 'light' : 'dark'));

        // Update CSS Custom Properties
        root.style.setProperty('--bg-main', theme.bgMain);
        root.style.setProperty('--bg-surface', theme.bgSurface);
        root.style.setProperty('--bg-card', theme.bgCard);
        root.style.setProperty('--border-card', theme.borderCard);
        root.style.setProperty('--text-primary', theme.textPrimary);
        root.style.setProperty('--text-secondary', theme.textSecondary);
        root.style.setProperty('--accent-cyan', theme.accentCyan);

        // Update body styling
        document.body.style.backgroundColor = theme.bgMain;
        document.body.style.color = theme.textPrimary;

        // Update Chart Theme if TradingViewManager exists
        if (typeof chartManager !== 'undefined' && chartManager) {
            this.updateChartTheme(chartManager, theme);
        }

        if (save) {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(theme));
            } catch (e) {}
        }
    },

    /**
     * Update TradingView Lightweight Charts styling
     */
    updateChartTheme(cm, theme) {
        if (!cm) return;

        const chartOpts = {
            layout: {
                background: { color: theme.chartBg || theme.bgCard },
                textColor: theme.chartText || theme.textSecondary
            },
            grid: {
                vertLines: { color: theme.chartGrid || (theme.borderCard + '44') },
                horzLines: { color: theme.chartGrid || (theme.borderCard + '44') }
            },
            rightPriceScale: {
                borderColor: theme.chartBorder || theme.borderCard
            },
            timeScale: {
                borderColor: theme.chartBorder || theme.borderCard
            }
        };

        if (cm.mainChart) {
            cm.mainChart.applyOptions(chartOpts);
        }

        if (cm.candleSeries) {
            cm.candleSeries.applyOptions({
                upColor: theme.bullColor || '#10B981',
                downColor: theme.bearColor || '#EF4444',
                borderUpColor: theme.bullColor || '#10B981',
                borderDownColor: theme.bearColor || '#EF4444',
                wickUpColor: theme.bullColor || '#10B981',
                wickDownColor: theme.bearColor || '#EF4444'
            });
        }

        if (cm.equityChart) {
            cm.equityChart.applyOptions(chartOpts);
        }

        if (cm.equitySeries) {
            cm.equitySeries.applyOptions({
                lineColor: theme.accentCyan || '#06B6D4',
                topColor: (theme.accentCyan || '#06B6D4') + '55',
                bottomColor: (theme.accentCyan || '#06B6D4') + '00'
            });
        }
    },

    /**
     * Switch to a Preset Theme
     */
    selectPreset(presetId) {
        const preset = this.PRESETS[presetId];
        if (preset) {
            this.applyTheme({ ...preset }, true);
            this.syncModalInputs();
        }
    },

    /**
     * Apply Live Custom Color Edits
     */
    updateCustomColor(key, value) {
        const updated = {
            ...this.currentTheme,
            id: 'custom',
            name: 'Custom Theme',
            [key]: value
        };

        // If changing main background, infer light/dark mode
        if (key === 'bgMain') {
            const isLight = this.isColorLight(value);
            updated.mode = isLight ? 'light' : 'dark';
            if (isLight && !updated.textPrimary) updated.textPrimary = '#0f172a';
            if (!isLight && !updated.textPrimary) updated.textPrimary = '#e2e8f0';
        }

        this.applyTheme(updated, true);
    },

    isColorLight(hex) {
        const c = hex.replace('#', '');
        if (c.length !== 6) return false;
        const r = parseInt(c.substr(0, 2), 16);
        const g = parseInt(c.substr(2, 2), 16);
        const b = parseInt(c.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155;
    },

    /**
     * Render the Interactive Theme Customizer Modal
     */
    renderThemeModal(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const current = this.currentTheme || this.PRESETS.dark;

        container.innerHTML = `
            <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
                <!-- Header -->
                <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-base">
                            🎨
                        </div>
                        <div>
                            <h3 class="font-extrabold text-white text-base">Theme Customizer & Live Editor</h3>
                            <p class="text-[11px] text-slate-400">Switch presets or craft your own personalized terminal palette</p>
                        </div>
                    </div>
                    <button id="closeThemeModalBtn" class="text-slate-400 hover:text-white text-lg">✕</button>
                </div>

                <!-- 1. Quick Preset Cards -->
                <div class="space-y-2 mb-5">
                    <label class="text-xs font-bold uppercase tracking-wider text-slate-400">Instant Theme Presets:</label>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        ${Object.keys(this.PRESETS).map(key => {
                            const p = this.PRESETS[key];
                            const isActive = (current.id === p.id);
                            return `
                                <button onclick="ThemeManager.selectPreset('${key}')" class="p-3 rounded-xl border transition flex flex-col items-center gap-1.5 text-center ${isActive ? 'border-cyan-500 bg-cyan-500/15 shadow-md shadow-cyan-500/20' : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'}">
                                    <span class="text-lg">${p.icon}</span>
                                    <span class="text-xs font-bold text-white">${p.name}</span>
                                    <div class="flex gap-1 mt-1">
                                        <span class="w-2.5 h-2.5 rounded-full" style="background:${p.bgMain}"></span>
                                        <span class="w-2.5 h-2.5 rounded-full" style="background:${p.accentCyan}"></span>
                                        <span class="w-2.5 h-2.5 rounded-full" style="background:${p.bullColor}"></span>
                                    </div>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- 2. Live Custom Color Editor -->
                <div class="space-y-3 pt-3 border-t border-slate-800">
                    <div class="flex items-center justify-between">
                        <label class="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Palette Editor (Live Tune):</label>
                        <span class="text-[10px] text-cyan-400 font-mono">Changes apply instantly</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <!-- Main Background -->
                        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span class="text-slate-300 font-medium">Main Background:</span>
                            <div class="flex items-center gap-2">
                                <input type="color" id="themeInput_bgMain" value="${current.bgMain}" onchange="ThemeManager.updateCustomColor('bgMain', this.value)" class="w-7 h-7 rounded border-0 cursor-pointer bg-transparent">
                            </div>
                        </div>

                        <!-- Card Surface -->
                        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span class="text-slate-300 font-medium">Card / Panel Surface:</span>
                            <div class="flex items-center gap-2">
                                <input type="color" id="themeInput_bgCard" value="${current.bgCard}" onchange="ThemeManager.updateCustomColor('bgCard', this.value)" class="w-7 h-7 rounded border-0 cursor-pointer bg-transparent">
                            </div>
                        </div>

                        <!-- Card Border -->
                        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span class="text-slate-300 font-medium">Borders & Dividers:</span>
                            <div class="flex items-center gap-2">
                                <input type="color" id="themeInput_borderCard" value="${current.borderCard}" onchange="ThemeManager.updateCustomColor('borderCard', this.value)" class="w-7 h-7 rounded border-0 cursor-pointer bg-transparent">
                            </div>
                        </div>

                        <!-- Accent Color -->
                        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span class="text-slate-300 font-medium">Brand Accent Color:</span>
                            <div class="flex items-center gap-2">
                                <input type="color" id="themeInput_accentCyan" value="${current.accentCyan}" onchange="ThemeManager.updateCustomColor('accentCyan', this.value)" class="w-7 h-7 rounded border-0 cursor-pointer bg-transparent">
                            </div>
                        </div>

                        <!-- Chart Bullish Candle -->
                        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span class="text-emerald-400 font-medium">📈 Bullish Candle (Up):</span>
                            <div class="flex items-center gap-2">
                                <input type="color" id="themeInput_bullColor" value="${current.bullColor || '#10B981'}" onchange="ThemeManager.updateCustomColor('bullColor', this.value)" class="w-7 h-7 rounded border-0 cursor-pointer bg-transparent">
                            </div>
                        </div>

                        <!-- Chart Bearish Candle -->
                        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span class="text-rose-400 font-medium">📉 Bearish Candle (Down):</span>
                            <div class="flex items-center gap-2">
                                <input type="color" id="themeInput_bearColor" value="${current.bearColor || '#EF4444'}" onchange="ThemeManager.updateCustomColor('bearColor', this.value)" class="w-7 h-7 rounded border-0 cursor-pointer bg-transparent">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="flex items-center justify-between pt-5 border-t border-slate-800 mt-4 text-xs">
                    <button onclick="ThemeManager.selectPreset('dark')" class="text-slate-400 hover:text-rose-300 transition underline">
                        Reset to Bloomberg Dark
                    </button>
                    <button onclick="document.getElementById('${containerId}').classList.add('hidden')" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition">
                        Done & Close
                    </button>
                </div>
            </div>
        `;

        const closeBtn = document.getElementById('closeThemeModalBtn');
        if (closeBtn) {
            closeBtn.onclick = () => container.classList.add('hidden');
        }
    },

    syncModalInputs() {
        const c = this.currentTheme;
        if (!c) return;
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el && val) el.value = val;
        };
        setVal('themeInput_bgMain', c.bgMain);
        setVal('themeInput_bgCard', c.bgCard);
        setVal('themeInput_borderCard', c.borderCard);
        setVal('themeInput_accentCyan', c.accentCyan);
        setVal('themeInput_bullColor', c.bullColor);
        setVal('themeInput_bearColor', c.bearColor);
    }
};

if (typeof window !== 'undefined') {
    window.ThemeManager = ThemeManager;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
