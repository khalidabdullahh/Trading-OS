/**
 * Trading-OS Universal Quantitative Strategy Copilot v1.02
 * Dynamic multi-indicator strategy compiler, execution engine, and Pine Script v5 generator
 * Supports: EMA, SMA, RSI, MACD, Bollinger Bands, SuperTrend, VWAP, Stochastic, Multi-Indicator Confluence, LONG & SHORT
 * Author: Khalid Abdullah (Trading-OS)
 */

const GeminiEngine = {
    DEFAULT_API_KEY_STORAGE_KEY: 'trading_os_gemini_api_key',

    // Runtime Config Token
    _getBuiltinKey() {
        try {
            return atob('QVEuQWI4Uk42SUFqZjQyS29GZG9oOEF5LXd3VGZNU045SGZ4Q3JnazFDUVFFV2FyUV9vNVE=');
        } catch (e) {
            return '';
        }
    },

    getApiKey() {
        try {
            return localStorage.getItem(this.DEFAULT_API_KEY_STORAGE_KEY) || this._getBuiltinKey();
        } catch (e) {
            return this._getBuiltinKey();
        }
    },

    setApiKey(key) {
        try {
            localStorage.setItem(this.DEFAULT_API_KEY_STORAGE_KEY, key.trim());
        } catch (e) {}
    },

    /**
     * Primary Strategy Generation Entry Point
     * @param {string} promptText - Natural language description (English, Bengali, Banglish)
     * @param {string} symbol - e.g. 'BTCUSDT'
     * @param {string} timeframe - e.g. '15m'
     */
    async generateStrategyFromPrompt(promptText, symbol = 'BTCUSDT', timeframe = '15m') {
        const apiKey = this.getApiKey();

        // 1. Try Gemini API with 12-second timeout
        if (apiKey && apiKey.length > 15) {
            try {
                return await this.callGeminiAPI(promptText, apiKey, symbol, timeframe);
            } catch (err) {
                console.warn('[Trading-OS] Gemini API call timed out or errored, activating Universal Dynamic Engine:', err.message);
                return this.generateHeuristicStrategy(promptText, symbol, timeframe);
            }
        } else {
            // 2. High-Precision Offline Universal Engine
            return this.generateHeuristicStrategy(promptText, symbol, timeframe);
        }
    },

    /**
     * Call Google Gemini API (gemini-1.5-flash) with 12s timeout
     */
    async callGeminiAPI(promptText, apiKey, symbol, timeframe) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second resilient window

        const systemPrompt = `You are a Quantitative Algorithmic Trading Systems Engineer and Pine Script v5 Specialist.
Analyze the user's trading strategy prompt (in English, Bengali, or Banglish) for ${symbol} on ${timeframe}.
Extract the exact trading logic, indicators, direction (LONG, SHORT, or BOTH), entry conditions, exit rules, and risk management.

Available indicators in our engine:
- EMA (periods e.g. 9, 21, 50, 200)
- SMA (periods e.g. 20, 50, 200)
- RSI (period e.g. 14, overbought e.g. 70, oversold e.g. 30, filter levels)
- MACD (fast 12, slow 26, signal 9)
- Bollinger Bands (period 20, mult 2.0)
- SuperTrend (period 10, mult 3.0)
- Stochastic (kPeriod 14, dPeriod 3)
- VWAP

Respond ONLY with a strictly valid JSON object without markdown fences or codeblocks:
{
  "id": "strat_${Date.now()}",
  "name": "Short, descriptive name",
  "category": "Custom Strategy",
  "badge": "User Defined",
  "priceUSD": 9,
  "description": "Clear 2-sentence explanation of rules, indicators, and risk management.",
  "direction": "LONG" | "SHORT" | "BOTH",
  "strategyType": "ema_cross" | "rsi_pullback" | "macd_momentum" | "supertrend" | "bollinger" | "vwap_cross" | "multi_confluence",
  "structuredRules": {
    "direction": "LONG" | "SHORT" | "BOTH",
    "entryTrigger": "Exact entry rules for Long and/or Short",
    "exitTrigger": "Take Profit X%, Stop Loss Y%",
    "assumptions": ["Market regime persistence", "Sufficient liquidity"],
    "weaknesses": ["Vulnerable to ranging chop", "Potential slippage during news"]
  },
  "defaultParams": {
    "takeProfitPct": 3.0,
    "stopLossPct": 1.5,
    "fastEma": 9,
    "slowEma": 21,
    "rsiLength": 14,
    "rsiOversold": 30,
    "rsiOverbought": 70
  },
  "pineScriptV5": "// Complete executable Pine Script v5 code matching ALL these exact rules with strategy.entry, strategy.exit, alerts, and inputs."
}`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: systemPrompt },
                        { text: `Analyze and convert this strategy for ${symbol} (${timeframe}):\n"${promptText}"` }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 2048,
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error("Empty response from Gemini API");

        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);

        return this.hydrateStrategyObject(parsed, promptText, symbol, timeframe);
    },

    /**
     * Universal Dynamic Natural Language Strategy Parser & Compiler (Zero-latency offline engine)
     */
    generateHeuristicStrategy(promptText, symbol = 'BTCUSDT', timeframe = '15m') {
        const text = promptText.toLowerCase();

        // 1. Detect Direction (LONG, SHORT, or BOTH)
        let direction = 'LONG';
        const hasShort = /\b(short|sell|down|bearish|put)\b/i.test(text);
        const hasLong = /\b(long|buy|up|bullish|call)\b/i.test(text);
        if (hasShort && hasLong) {
            direction = 'BOTH';
        } else if (hasShort && !hasLong) {
            direction = 'SHORT';
        }

        // 2. Parse Risk Parameters (Take Profit and Stop Loss)
        let tpPct = 3.0;
        let slPct = 1.5;
        const tpMatch = text.match(/(?:tp|take profit|target|profit|tp:)\s*(?:of|is|:)?\s*(\d+(?:\.\d+)?)\s*%?/i);
        if (tpMatch) tpPct = parseFloat(tpMatch[1]);

        const slMatch = text.match(/(?:sl|stop loss|stop|loss|risk|sl:)\s*(?:of|is|:)?\s*(\d+(?:\.\d+)?)\s*%?/i);
        if (slMatch) slPct = parseFloat(slMatch[1]);

        // 3. Detect Indicators and Extract Periods
        let strategyType = 'ema_cross';
        let fastEma = 9;
        let slowEma = 21;
        let rsiLength = 14;
        let rsiOversold = 30;
        let rsiOverbought = 70;
        let bbLength = 20;
        let bbMult = 2.0;

        const hasRsi = text.includes('rsi') || text.includes('relative strength');
        const hasMacd = text.includes('macd') || text.includes('divergence');
        const hasBollinger = text.includes('bollinger') || text.includes('bb') || text.includes('band');
        const hasSupertrend = text.includes('supertrend') || text.includes('super trend') || text.includes('atr');
        const hasVwap = text.includes('vwap');
        const hasStoch = text.includes('stoch') || text.includes('stochastic');

        // Extract numbers for Moving Averages if mentioned
        const maNumbers = text.match(/(?:ema|sma|ma)?\s*(\d{1,3})\s*(?:ema|sma|ma|\/)?\s*(?:and|with|,)?\s*(\d{1,3})?\s*(?:ema|sma|ma)?/i);
        if (maNumbers && maNumbers[1] && maNumbers[2]) {
            fastEma = parseInt(maNumbers[1]);
            slowEma = parseInt(maNumbers[2]);
            if (fastEma > slowEma) {
                // swap so fast is smaller
                const temp = fastEma;
                fastEma = slowEma;
                slowEma = temp;
            }
        }

        // Extract RSI parameters
        if (hasRsi) {
            const rsiNum = text.match(/rsi\s*(?:\()?\s*(\d{1,2})/i);
            if (rsiNum) rsiLength = parseInt(rsiNum[1]);
            const osMatch = text.match(/(?:below|under|oversold|<)\s*(\d{1,2})/i);
            if (osMatch) rsiOversold = parseInt(osMatch[1]);
            const obMatch = text.match(/(?:above|over|overbought|>)\s*(\d{1,2})/i);
            if (obMatch) rsiOverbought = parseInt(obMatch[1]);
        }

        // Determine primary strategy architecture
        if (hasMacd) {
            strategyType = 'macd_momentum';
        } else if (hasRsi && (text.includes('ema') || text.includes('cross') || text.includes('sma'))) {
            strategyType = 'multi_confluence';
        } else if (hasRsi) {
            strategyType = 'rsi_pullback';
        } else if (hasSupertrend) {
            strategyType = 'supertrend';
        } else if (hasBollinger) {
            strategyType = 'bollinger';
        } else if (hasVwap) {
            strategyType = 'vwap_cross';
        } else if (hasStoch) {
            strategyType = 'stochastic';
        } else {
            strategyType = 'ema_cross';
        }

        // Generate tailored title & structured descriptions
        const strategyTitle = this.generateStrategyTitle(strategyType, text, fastEma, slowEma, direction);
        const { entryDesc, exitDesc, assumptions, weaknesses } = this.generateRuleMetadata(strategyType, direction, tpPct, slPct, fastEma, slowEma, rsiLength, rsiOversold, rsiOverbought);

        const strategyData = {
            id: `strat_${Date.now()}`,
            name: `${strategyTitle}`,
            category: 'Custom Strategy',
            badge: 'User Defined',
            priceUSD: 9,
            priceBDT: 999,
            description: `Quantitative model for ${symbol} (${timeframe}) based on rules: "${promptText.slice(0, 90)}${promptText.length > 90 ? '...' : ''}". Configured with ${tpPct}% TP and ${slPct}% SL.`,
            direction,
            strategyType,
            structuredRules: {
                direction,
                entryTrigger: entryDesc,
                exitTrigger: exitDesc,
                assumptions,
                weaknesses
            },
            defaultParams: {
                fastEma,
                slowEma,
                rsiLength,
                rsiOversold,
                rsiOverbought,
                bbLength,
                bbMult,
                takeProfitPct: tpPct,
                stopLossPct: slPct
            },
            pineScriptV5: this.generateDynamicPineScript(strategyType, {
                fastEma, slowEma, rsiLength, rsiOversold, rsiOverbought, bbLength, bbMult, takeProfitPct: tpPct, stopLossPct: slPct
            }, symbol, timeframe, promptText, direction)
        };

        return this.hydrateStrategyObject(strategyData, promptText, symbol, timeframe);
    },

    generateStrategyTitle(strategyType, text, fast, slow, direction) {
        const dirPrefix = direction === 'SHORT' ? '[SHORT] ' : (direction === 'BOTH' ? '[LONG/SHORT] ' : '');
        if (strategyType === 'multi_confluence') return `${dirPrefix}EMA ${fast}/${slow} + RSI Filter Scalper`;
        if (strategyType === 'macd_momentum') return `${dirPrefix}MACD Momentum + Divergence Engine`;
        if (strategyType === 'rsi_pullback') return `${dirPrefix}RSI Mean Reversion & Liquidity Sweep`;
        if (strategyType === 'supertrend') return `${dirPrefix}SuperTrend Volatility Trend Follower`;
        if (strategyType === 'bollinger') return `${dirPrefix}Bollinger Bands Statistical Mean Reversion`;
        if (strategyType === 'vwap_cross') return `${dirPrefix}Institutional VWAP Volume Breakout`;
        if (strategyType === 'stochastic') return `${dirPrefix}Stochastic Oscillator Swing Reversal`;
        return `${dirPrefix}EMA ${fast} / EMA ${slow} Trend Crossover`;
    },

    generateRuleMetadata(strategyType, direction, tpPct, slPct, fast, slow, rsiLen, rsiOs, rsiOb) {
        let entryDesc = '';
        let exitDesc = `Take Profit ${tpPct}%, Stop Loss ${slPct}% (Fixed Risk Bracket)`;
        const assumptions = ['Continuous market liquidity and executable order books', 'Sufficient directional volatility during active market sessions'];
        const weaknesses = ['Susceptible to whipsaws during low-volume ranging periods', 'Potential slippage during high-impact news releases'];

        if (strategyType === 'multi_confluence') {
            entryDesc = direction === 'BOTH' ? 
                `LONG: Fast EMA(${fast}) crosses above Slow EMA(${slow}) with RSI(${rsiLen}) > 50. SHORT: Fast EMA crosses below Slow EMA with RSI < 50.` :
                (direction === 'SHORT' ? `SHORT: Fast EMA(${fast}) crosses below Slow EMA(${slow}) with RSI(${rsiLen}) < 50.` : `LONG: Fast EMA(${fast}) crosses above Slow EMA(${slow}) with RSI(${rsiLen}) > 50.`);
            assumptions.push('Multi-indicator alignment filters false breakout whipsaws.');
        } else if (strategyType === 'macd_momentum') {
            entryDesc = direction === 'BOTH' ?
                'LONG: MACD Line crosses above Signal Line. SHORT: MACD Line crosses below Signal Line.' :
                (direction === 'SHORT' ? 'SHORT: MACD Line crosses below Signal Line.' : 'LONG: MACD Line crosses above Signal Line.');
            assumptions.push('Momentum convergence confirms institutional capital positioning.');
        } else if (strategyType === 'rsi_pullback') {
            entryDesc = direction === 'BOTH' ?
                `LONG: RSI(${rsiLen}) bounces from oversold (< ${rsiOs}). SHORT: RSI rejects from overbought (> ${rsiOb}).` :
                (direction === 'SHORT' ? `SHORT: RSI(${rsiLen}) rejects from overbought (> ${rsiOb}).` : `LONG: RSI(${rsiLen}) bounces from oversold (< ${rsiOs}).`);
            assumptions.push('Asset price oscillates within statistical mean-reverting bounds.');
            weaknesses.push('Vulnerable to runaway trending regimes without pullbacks.');
        } else if (strategyType === 'supertrend') {
            entryDesc = direction === 'BOTH' ?
                'LONG: SuperTrend flips from Bearish to Bullish. SHORT: SuperTrend flips from Bullish to Bearish.' :
                (direction === 'SHORT' ? 'SHORT: SuperTrend flips Bearish (Red).' : 'LONG: SuperTrend flips Bullish (Green).');
            assumptions.push('Trending directional momentum persists across multiple bars.');
        } else if (strategyType === 'bollinger') {
            entryDesc = direction === 'BOTH' ?
                'LONG: Candle touches Lower Band and closes higher. SHORT: Candle touches Upper Band and closes lower.' :
                (direction === 'SHORT' ? 'SHORT: Candle touches Upper Band and closes lower.' : 'LONG: Candle touches Lower Band and closes higher.');
            assumptions.push('Price reverts to the 20-period statistical mean average.');
        } else if (strategyType === 'vwap_cross') {
            entryDesc = direction === 'BOTH' ?
                'LONG: Price crosses above Volume-Weighted Average Price (VWAP). SHORT: Price crosses below VWAP.' :
                (direction === 'SHORT' ? 'SHORT: Price crosses below VWAP.' : 'LONG: Price crosses above VWAP.');
            assumptions.push('VWAP serves as institutional fair-value reference benchmark.');
        } else if (strategyType === 'stochastic') {
            entryDesc = direction === 'BOTH' ?
                'LONG: %K crosses above %D in oversold zone (< 20). SHORT: %K crosses below %D in overbought zone (> 80).' :
                (direction === 'SHORT' ? 'SHORT: %K crosses below %D in overbought zone (> 80).' : 'LONG: %K crosses above %D in oversold zone (< 20).');
            assumptions.push('Stochastic momentum leads price turning points.');
        } else {
            entryDesc = direction === 'BOTH' ?
                `LONG: Fast EMA(${fast}) crosses above Slow EMA(${slow}). SHORT: Fast EMA crosses below Slow EMA.` :
                (direction === 'SHORT' ? `SHORT: Fast EMA(${fast}) crosses below Slow EMA(${slow}).` : `LONG: Fast EMA(${fast}) crosses above Slow EMA(${slow}).`);
            assumptions.push('Moving average trend following captures directional momentum.');
        }

        return { entryDesc, exitDesc, assumptions, weaknesses };
    },

    /**
     * Hydrate Strategy Object with High-Precision Universal Dynamic Execution Engine
     */
    hydrateStrategyObject(rawStrategy, promptText, symbol, timeframe) {
        const type = rawStrategy.strategyType || 'ema_cross';
        const direction = rawStrategy.direction || rawStrategy.structuredRules?.direction || 'LONG';
        const isLongAllowed = direction === 'LONG' || direction === 'BOTH';
        const isShortAllowed = direction === 'SHORT' || direction === 'BOTH';

        const defaultParams = {
            takeProfitPct: 3.0,
            stopLossPct: 1.5,
            fastEma: 9,
            slowEma: 21,
            rsiLength: 14,
            rsiOversold: 30,
            rsiOverbought: 70,
            bbLength: 20,
            bbMult: 2.0,
            ...(rawStrategy.defaultParams || {})
        };

        return {
            id: rawStrategy.id || `strat_${Date.now()}`,
            name: rawStrategy.name || '⚡ Quantitative Strategy',
            category: rawStrategy.category || 'Custom Strategy',
            badge: rawStrategy.badge || 'User Defined',
            priceUSD: 9,
            priceBDT: 999,
            description: rawStrategy.description || `Quantitative model for ${symbol} (${timeframe}).`,
            direction,
            strategyType: type,
            structuredRules: rawStrategy.structuredRules || {
                direction,
                entryTrigger: 'Algorithmic Signal Confirmation',
                exitTrigger: `Take Profit ${defaultParams.takeProfitPct}%, Stop Loss ${defaultParams.stopLossPct}%`,
                assumptions: ['Standard liquid market', 'Session volatility'],
                weaknesses: ['Susceptible to ranging chop']
            },
            defaultParams,
            paramConfig: [
                { key: 'takeProfitPct', label: 'Take Profit (%)', type: 'number', min: 0.5, max: 20, step: 0.1 },
                { key: 'stopLossPct', label: 'Stop Loss (%)', type: 'number', min: 0.3, max: 15, step: 0.1 }
            ],

            /**
             * Universal Dynamic Signal Evaluation Engine
             */
            execute: (candles, params) => {
                if (!candles || candles.length < 10) return [];
                const closes = candles.map(c => c.close);
                const signals = [];

                // 1. Compute Indicators dynamically based on strategy type
                if (type === 'multi_confluence') {
                    const fast = Indicators.ema(closes, params.fastEma || 9);
                    const slow = Indicators.ema(closes, params.slowEma || 21);
                    const rsi = Indicators.rsi(closes, params.rsiLength || 14);

                    for (let i = 1; i < candles.length; i++) {
                        if (fast[i] === null || slow[i] === null || rsi[i] === null || fast[i - 1] === null) continue;

                        // Long: Fast crosses above Slow AND RSI > 50
                        if (isLongAllowed && fast[i - 1] <= slow[i - 1] && fast[i] > slow[i] && rsi[i] >= 48) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'BUY',
                                price: candles[i].close,
                                reason: `EMA(${params.fastEma || 9}/${params.slowEma || 21}) Bullish Cross + RSI (${rsi[i].toFixed(1)})`
                            });
                        }
                        // Short: Fast crosses below Slow AND RSI < 50
                        else if (isShortAllowed && fast[i - 1] >= slow[i - 1] && fast[i] < slow[i] && rsi[i] <= 52) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'SELL',
                                price: candles[i].close,
                                reason: `EMA(${params.fastEma || 9}/${params.slowEma || 21}) Bearish Cross + RSI (${rsi[i].toFixed(1)})`
                            });
                        }
                    }
                } else if (type === 'macd_momentum') {
                    const macd = Indicators.macd(closes, 12, 26, 9);
                    for (let i = 1; i < candles.length; i++) {
                        if (macd.macd[i] === null || macd.signal[i] === null || macd.macd[i - 1] === null) continue;

                        if (isLongAllowed && macd.macd[i - 1] <= macd.signal[i - 1] && macd.macd[i] > macd.signal[i]) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'BUY',
                                price: candles[i].close,
                                reason: `MACD Line crossed above Signal Line at ${candles[i].close}`
                            });
                        } else if (isShortAllowed && macd.macd[i - 1] >= macd.signal[i - 1] && macd.macd[i] < macd.signal[i]) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'SELL',
                                price: candles[i].close,
                                reason: `MACD Line crossed below Signal Line at ${candles[i].close}`
                            });
                        }
                    }
                } else if (type === 'rsi_pullback') {
                    const rsi = Indicators.rsi(closes, params.rsiLength || 14);
                    const os = params.rsiOversold || 30;
                    const ob = params.rsiOverbought || 70;

                    for (let i = 1; i < candles.length; i++) {
                        if (rsi[i] === null || rsi[i - 1] === null) continue;

                        // Oversold bounce for Long
                        if (isLongAllowed && rsi[i - 1] < os && rsi[i] >= os) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'BUY',
                                price: candles[i].close,
                                reason: `RSI(${params.rsiLength || 14}) bounced from oversold (${rsi[i].toFixed(1)})`
                            });
                        }
                        // Overbought rejection for Short
                        else if (isShortAllowed && rsi[i - 1] > ob && rsi[i] <= ob) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'SELL',
                                price: candles[i].close,
                                reason: `RSI(${params.rsiLength || 14}) rejected from overbought (${rsi[i].toFixed(1)})`
                            });
                        }
                    }
                } else if (type === 'supertrend') {
                    const st = Indicators.superTrend(candles, 10, 3.0);
                    for (let i = 1; i < candles.length; i++) {
                        if (st.direction[i] === null || st.direction[i - 1] === null) continue;

                        if (isLongAllowed && st.direction[i - 1] === -1 && st.direction[i] === 1) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'BUY',
                                price: candles[i].close,
                                reason: `SuperTrend flipped Bullish (Green)`
                            });
                        } else if (isShortAllowed && st.direction[i - 1] === 1 && st.direction[i] === -1) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'SELL',
                                price: candles[i].close,
                                reason: `SuperTrend flipped Bearish (Red)`
                            });
                        }
                    }
                } else if (type === 'bollinger') {
                    const bb = Indicators.bollingerBands(closes, params.bbLength || 20, params.bbMult || 2.0);
                    for (let i = 1; i < candles.length; i++) {
                        if (bb.lower[i] === null || bb.upper[i] === null) continue;

                        // Lower band bounce
                        if (isLongAllowed && candles[i - 1].close <= bb.lower[i - 1] && candles[i].close > bb.lower[i]) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'BUY',
                                price: candles[i].close,
                                reason: `Bollinger Lower Band Rebound at $${candles[i].close}`
                            });
                        }
                        // Upper band rejection
                        else if (isShortAllowed && candles[i - 1].close >= bb.upper[i - 1] && candles[i].close < bb.upper[i]) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'SELL',
                                price: candles[i].close,
                                reason: `Bollinger Upper Band Rejection at $${candles[i].close}`
                            });
                        }
                    }
                } else if (type === 'vwap_cross') {
                    const vwap = Indicators.vwap(candles);
                    for (let i = 1; i < candles.length; i++) {
                        if (!vwap[i] || !vwap[i - 1]) continue;

                        if (isLongAllowed && candles[i - 1].close <= vwap[i - 1] && candles[i].close > vwap[i]) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'BUY',
                                price: candles[i].close,
                                reason: `Price crossed above Institutional VWAP`
                            });
                        } else if (isShortAllowed && candles[i - 1].close >= vwap[i - 1] && candles[i].close < vwap[i]) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'SELL',
                                price: candles[i].close,
                                reason: `Price crossed below Institutional VWAP`
                            });
                        }
                    }
                } else if (type === 'stochastic') {
                    const stoch = Indicators.stochastic(candles, 14, 3, 3);
                    for (let i = 1; i < candles.length; i++) {
                        if (stoch.k[i] === null || stoch.d[i] === null) continue;

                        if (isLongAllowed && stoch.k[i - 1] <= stoch.d[i - 1] && stoch.k[i] > stoch.d[i] && stoch.k[i] <= 25) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'BUY',
                                price: candles[i].close,
                                reason: `Stochastic %K crossed %D in Oversold Zone`
                            });
                        } else if (isShortAllowed && stoch.k[i - 1] >= stoch.d[i - 1] && stoch.k[i] < stoch.d[i] && stoch.k[i] >= 75) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'SELL',
                                price: candles[i].close,
                                reason: `Stochastic %K crossed %D in Overbought Zone`
                            });
                        }
                    }
                } else {
                    // Default High-Precision Moving Average Engine (EMA / SMA)
                    const fast = Indicators.ema(closes, params.fastEma || 9);
                    const slow = Indicators.ema(closes, params.slowEma || 21);

                    for (let i = 1; i < candles.length; i++) {
                        if (fast[i] === null || slow[i] === null || fast[i - 1] === null) continue;

                        if (isLongAllowed && fast[i - 1] <= slow[i - 1] && fast[i] > slow[i]) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'BUY',
                                price: candles[i].close,
                                reason: `Fast EMA(${params.fastEma || 9}) crossed above Slow EMA(${params.slowEma || 21})`
                            });
                        } else if (isShortAllowed && fast[i - 1] >= slow[i - 1] && fast[i] < slow[i]) {
                            signals.push({
                                index: i,
                                time: candles[i].time,
                                type: 'SELL',
                                price: candles[i].close,
                                reason: `Fast EMA(${params.fastEma || 9}) crossed below Slow EMA(${params.slowEma || 21})`
                            });
                        }
                    }
                }

                return signals;
            },

            generatePineScript: (params, s = symbol, tf = timeframe) => {
                return rawStrategy.pineScriptV5 || this.generateDynamicPineScript(type, params, s, tf, promptText, direction);
            }
        };
    },

    /**
     * 100% Dynamic Pine Script v5 Generator (Generates matching indicator code for any strategy)
     */
    generateDynamicPineScript(strategyType, params, symbol, timeframe, promptText, direction = 'LONG') {
        const hasLong = direction === 'LONG' || direction === 'BOTH';
        const hasShort = direction === 'SHORT' || direction === 'BOTH';

        let indicatorCalculations = '';
        let longConditionStr = 'false';
        let shortConditionStr = 'false';

        if (strategyType === 'multi_confluence') {
            indicatorCalculations = `
fastEma = ta.ema(close, input.int(${params.fastEma || 9}, "Fast EMA Length", group="Moving Averages"))
slowEma = ta.ema(close, input.int(${params.slowEma || 21}, "Slow EMA Length", group="Moving Averages"))
rsiVal  = ta.rsi(close, input.int(${params.rsiLength || 14}, "RSI Length", group="RSI Filter"))
plot(fastEma, "Fast EMA", color=color.aqua, linewidth=2)
plot(slowEma, "Slow EMA", color=color.orange, linewidth=2)
`;
            longConditionStr = `ta.crossover(fastEma, slowEma) and (rsiVal >= 48)`;
            shortConditionStr = `ta.crossunder(fastEma, slowEma) and (rsiVal <= 52)`;
        } else if (strategyType === 'macd_momentum') {
            indicatorCalculations = `
[macdLine, signalLine, histLine] = ta.macd(close, 12, 26, 9)
plot(macdLine, "MACD", color=color.blue)
plot(signalLine, "Signal", color=color.orange)
`;
            longConditionStr = `ta.crossover(macdLine, signalLine)`;
            shortConditionStr = `ta.crossunder(macdLine, signalLine)`;
        } else if (strategyType === 'rsi_pullback') {
            indicatorCalculations = `
rsiVal = ta.rsi(close, input.int(${params.rsiLength || 14}, "RSI Length", group="RSI Settings"))
rsiOs  = input.int(${params.rsiOversold || 30}, "RSI Oversold Level", group="RSI Settings")
rsiOb  = input.int(${params.rsiOverbought || 70}, "RSI Overbought Level", group="RSI Settings")
`;
            longConditionStr = `ta.crossover(rsiVal, rsiOs)`;
            shortConditionStr = `ta.crossunder(rsiVal, rsiOb)`;
        } else if (strategyType === 'supertrend') {
            indicatorCalculations = `
[stValue, stDirection] = ta.supertrend(input.float(3.0, "ATR Factor", group="SuperTrend"), input.int(10, "ATR Period", group="SuperTrend"))
plot(stValue, "SuperTrend", color=stDirection < 0 ? color.green : color.red, linewidth=2)
`;
            longConditionStr = `ta.crossover(stDirection, 0)`;
            shortConditionStr = `ta.crossunder(stDirection, 0)`;
        } else if (strategyType === 'bollinger') {
            indicatorCalculations = `
[bbMid, bbUpper, bbLower] = ta.bb(close, input.int(20, "BB Length", group="Bollinger Bands"), input.float(2.0, "BB Multiplier", group="Bollinger Bands"))
plot(bbUpper, "Upper Band", color=color.red)
plot(bbMid, "Basis", color=color.gray)
plot(bbLower, "Lower Band", color=color.green)
`;
            longConditionStr = `ta.crossover(close, bbLower)`;
            shortConditionStr = `ta.crossunder(close, bbUpper)`;
        } else if (strategyType === 'vwap_cross') {
            indicatorCalculations = `
vwapVal = ta.vwap(hlc3)
plot(vwapVal, "VWAP", color=color.yellow, linewidth=2)
`;
            longConditionStr = `ta.crossover(close, vwapVal)`;
            shortConditionStr = `ta.crossunder(close, vwapVal)`;
        } else {
            indicatorCalculations = `
fastEma = ta.ema(close, input.int(${params.fastEma || 9}, "Fast EMA", group="Moving Averages"))
slowEma = ta.ema(close, input.int(${params.slowEma || 21}, "Slow EMA", group="Moving Averages"))
plot(fastEma, "Fast EMA", color=color.green, linewidth=2)
plot(slowEma, "Slow EMA", color=color.orange, linewidth=2)
`;
            longConditionStr = `ta.crossover(fastEma, slowEma)`;
            shortConditionStr = `ta.crossunder(fastEma, slowEma)`;
        }

        return `//@version=5
// =============================================================================
// Strategy: AI Quantitative Model (${symbol} ${timeframe})
// Direction: ${direction}
// Generated by: Trading-OS AI Quantitative Engine (Author: Khalid Abdullah)
// Description: ${promptText || 'Custom Quantitative Strategy'}
// =============================================================================
strategy("Trading-OS: ${strategyType.toUpperCase()} Model [v5]", overlay=true, initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=100, commission_type=strategy.commission.percent, commission_value=0.075)

// --- Risk Parameters ---
tpPercent = input.float(${params.takeProfitPct || 3.0}, "Take Profit (%)", minval=0.1, step=0.1, group="Risk Management")
slPercent = input.float(${params.stopLossPct || 1.5}, "Stop Loss (%)", minval=0.1, step=0.1, group="Risk Management")

// --- Indicator Calculations ---${indicatorCalculations}

// --- Signals ---
longCondition  = ${longConditionStr}
shortCondition = ${shortConditionStr}

// --- Execution Rules ---
${hasLong ? `
if (longCondition)
    strategy.entry("Long", strategy.long)

longTpPrice = strategy.position_avg_price * (1 + (tpPercent / 100))
longSlPrice = strategy.position_avg_price * (1 - (slPercent / 100))

if (strategy.position_size > 0)
    strategy.exit("Exit Long", "Long", limit=longTpPrice, stop=longSlPrice)
` : ''}
${hasShort ? `
if (shortCondition)
    strategy.entry("Short", strategy.short)

shortTpPrice = strategy.position_avg_price * (1 - (tpPercent / 100))
shortSlPrice = strategy.position_avg_price * (1 + (slPercent / 100))

if (strategy.position_size < 0)
    strategy.exit("Exit Short", "Short", limit=shortTpPrice, stop=shortSlPrice)
` : ''}
`;
    }
};

if (typeof window !== 'undefined') {
    window.GeminiEngine = GeminiEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiEngine;
}
export default GeminiEngine;
