/**
 * Trading-OS Interactive TradingView Lightweight Charts Visualizer v1.02
 * Author: Khalid Abdullah (Trading-OS)
 */

class TradingViewManager {
    constructor(candlestickContainerId, equityContainerId) {
        this.candleContainer = document.getElementById(candlestickContainerId);
        this.equityContainer = document.getElementById(equityContainerId);
        
        this.mainChart = null;
        this.candleSeries = null;
        this.volumeSeries = null;
        this.overlaySeries1 = null;
        this.overlaySeries2 = null;
        this.overlaySeries3 = null;

        this.equityChart = null;
        this.equitySeries = null;
        this.oosEquitySeries = null;

        this.initCharts();
    }

    initCharts() {
        if (typeof LightweightCharts === 'undefined') {
            console.error('[Trading-OS] LightweightCharts library not loaded.');
            return;
        }

        // --- 1. Main Candlestick Chart ---
        if (this.candleContainer) {
            this.candleContainer.innerHTML = '';
            this.mainChart = LightweightCharts.createChart(this.candleContainer, {
                layout: {
                    background: { color: '#090D16' },
                    textColor: '#94A3B8',
                    fontFamily: 'Inter, system-ui, sans-serif'
                },
                grid: {
                    vertLines: { color: '#1E293B33' },
                    horzLines: { color: '#1E293B33' }
                },
                crosshair: {
                    mode: LightweightCharts.CrosshairMode.Normal,
                    vertLine: { color: '#38BDF8', width: 1, style: 3 },
                    horzLine: { color: '#38BDF8', width: 1, style: 3 }
                },
                rightPriceScale: {
                    borderColor: '#1E293B',
                    scaleMargins: { top: 0.1, bottom: 0.25 }
                },
                timeScale: {
                    borderColor: '#1E293B',
                    timeVisible: true,
                    secondsVisible: false
                }
            });

            this.candleSeries = this.mainChart.addCandlestickSeries({
                upColor: '#10B981',
                downColor: '#EF4444',
                borderUpColor: '#10B981',
                borderDownColor: '#EF4444',
                wickUpColor: '#10B981',
                wickDownColor: '#EF4444'
            });

            this.volumeSeries = this.mainChart.addHistogramSeries({
                color: '#38BDF8',
                priceFormat: { type: 'volume' },
                priceScaleId: '',
                scaleMargins: { top: 0.8, bottom: 0 }
            });
        }

        // --- 2. Equity Curve Chart ---
        if (this.equityContainer) {
            this.equityContainer.innerHTML = '';
            this.equityChart = LightweightCharts.createChart(this.equityContainer, {
                layout: {
                    background: { color: '#090D16' },
                    textColor: '#94A3B8',
                    fontFamily: 'Inter, system-ui, sans-serif'
                },
                grid: {
                    vertLines: { color: '#1E293B33' },
                    horzLines: { color: '#1E293B33' }
                },
                rightPriceScale: {
                    borderColor: '#1E293B',
                    scaleMargins: { top: 0.15, bottom: 0.15 }
                },
                timeScale: {
                    borderColor: '#1E293B',
                    timeVisible: true
                }
            });

            this.equitySeries = this.equityChart.addAreaSeries({
                topColor: 'rgba(6, 182, 212, 0.4)',
                bottomColor: 'rgba(6, 182, 212, 0.0)',
                lineColor: '#06B6D4',
                lineWidth: 2,
                title: 'Total Equity'
            });
        }

        this.setupResizeObserver();
    }

    setupResizeObserver() {
        const resize = () => {
            if (this.mainChart && this.candleContainer) {
                this.mainChart.applyOptions({
                    width: this.candleContainer.clientWidth,
                    height: this.candleContainer.clientHeight || 450
                });
            }
            if (this.equityChart && this.equityContainer) {
                this.equityChart.applyOptions({
                    width: this.equityContainer.clientWidth,
                    height: this.equityContainer.clientHeight || 240
                });
            }
        };

        window.addEventListener('resize', resize);
        setTimeout(resize, 100);
    }

    /**
     * Render Candlestick & Volume Data
     */
    renderCandles(candles) {
        if (!this.candleSeries || !candles || candles.length === 0) return;

        const candleData = candles.map(c => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close
        }));

        const volumeData = candles.map(c => ({
            time: c.time,
            value: c.volume,
            color: c.close >= c.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
        }));

        this.candleSeries.setData(candleData);
        if (this.volumeSeries) {
            this.volumeSeries.setData(volumeData);
        }

        this.mainChart.timeScale().fitContent();
    }

    /**
     * Render Strategy Buy/Sell Markers
     */
    renderMarkers(markers) {
        if (!this.candleSeries) return;
        this.candleSeries.setMarkers(markers || []);
    }

    /**
     * Render Indicator Overlays
     */
    renderOverlays(candles, strategyId, params) {
        // Clear previous overlays
        if (this.overlaySeries1) { this.mainChart.removeSeries(this.overlaySeries1); this.overlaySeries1 = null; }
        if (this.overlaySeries2) { this.mainChart.removeSeries(this.overlaySeries2); this.overlaySeries2 = null; }
        if (this.overlaySeries3) { this.mainChart.removeSeries(this.overlaySeries3); this.overlaySeries3 = null; }

        if (!candles || candles.length === 0 || !params) return;
        const closes = candles.map(c => c.close);

        if (strategyId === 'ema_scalp' || (params.fastEma && params.slowEma)) {
            const fast = Indicators.ema(closes, params.fastEma || 9);
            const slow = Indicators.ema(closes, params.slowEma || 21);

            this.overlaySeries1 = this.mainChart.addLineSeries({ color: '#10B981', lineWidth: 1.5, title: `Fast EMA (${params.fastEma || 9})` });
            this.overlaySeries2 = this.mainChart.addLineSeries({ color: '#F59E0B', lineWidth: 1.5, title: `Slow EMA (${params.slowEma || 21})` });

            this.overlaySeries1.setData(candles.map((c, i) => ({ time: c.time, value: fast[i] })).filter(d => d.value !== null));
            this.overlaySeries2.setData(candles.map((c, i) => ({ time: c.time, value: slow[i] })).filter(d => d.value !== null));

            if (params.trendEma) {
                const trend = Indicators.ema(closes, params.trendEma);
                this.overlaySeries3 = this.mainChart.addLineSeries({ color: '#6366F1', lineWidth: 2, title: `Trend EMA (${params.trendEma})` });
                this.overlaySeries3.setData(candles.map((c, i) => ({ time: c.time, value: trend[i] })).filter(d => d.value !== null));
            }
        } else if (strategyId === 'supertrend_breakout') {
            const st = Indicators.superTrend(candles, params.atrPeriod || 10, params.atrMultiplier || 3.0);
            this.overlaySeries1 = this.mainChart.addLineSeries({ color: '#06B6D4', lineWidth: 2, title: 'SuperTrend' });
            this.overlaySeries1.setData(candles.map((c, i) => ({ time: c.time, value: st.supertrend[i] })).filter(d => d.value !== null));
        } else if (strategyId === 'bollinger_stoch_reversion') {
            const bb = Indicators.bollingerBands(closes, params.bbLength || 20, params.bbMult || 2.0);
            this.overlaySeries1 = this.mainChart.addLineSeries({ color: '#EF4444', lineWidth: 1, lineStyle: 2, title: 'BB Upper' });
            this.overlaySeries2 = this.mainChart.addLineSeries({ color: '#64748B', lineWidth: 1, lineStyle: 3, title: 'BB Mid' });
            this.overlaySeries3 = this.mainChart.addLineSeries({ color: '#10B981', lineWidth: 1, lineStyle: 2, title: 'BB Lower' });

            this.overlaySeries1.setData(candles.map((c, i) => ({ time: c.time, value: bb.upper[i] })).filter(d => d.value !== null));
            this.overlaySeries2.setData(candles.map((c, i) => ({ time: c.time, value: bb.middle[i] })).filter(d => d.value !== null));
            this.overlaySeries3.setData(candles.map((c, i) => ({ time: c.time, value: bb.lower[i] })).filter(d => d.value !== null));
        }
    }

    /**
     * Render Equity Curve
     */
    renderEquityCurve(equityData) {
        if (!this.equitySeries || !equityData || equityData.length === 0) return;
        this.equitySeries.setData(equityData.map(d => ({ time: d.time, value: d.value })));
        if (this.equityChart) {
            this.equityChart.timeScale().fitContent();
        }
    }
}

if (typeof window !== 'undefined') {
    window.TradingViewManager = TradingViewManager;
}
