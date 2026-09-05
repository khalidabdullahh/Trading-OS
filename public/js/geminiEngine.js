/**
 * Trading-OS Universal Quantitative Strategy Copilot & Deterministic Compiler v1.03
 * Canonical Strategy AST Generator, Validator, and Dynamic Runtime Evaluator
 * Author: Khalid Abdullah (Trading-OS)
 */

import { StrategyCompiler } from "../src/services/strategyCompiler";
import { StrategyValidator } from "../src/services/strategyValidator";
import { ASTEvaluator } from "../src/services/astEvaluator";

const GeminiEngine = {
    DEFAULT_API_KEY_STORAGE_KEY: 'trading_os_gemini_api_key',

    getApiKey() {
        return StrategyCompiler.getApiKey();
    },

    setApiKey(key) {
        StrategyCompiler.setApiKey(key);
    },

    /**
     * Primary Compilation Method returning a structured CompilationResult
     */
    async compile(promptText, symbol = 'BTCUSDT', timeframe = '15m') {
        return await StrategyCompiler.compile(promptText, symbol, timeframe);
    },

    /**
     * Compile Natural Language Prompt into Hydrated Executable Strategy
     */
    async compileStrategy(promptText, directionMode = 'LONG', symbol = 'BTCUSDT', timeframe = '15m') {
        const result = await StrategyCompiler.compile(promptText, symbol, timeframe);
        if (!result.success) {
            return {
                success: false,
                isAmbiguous: result.isAmbiguous,
                error: result.error || "Failed to compile strategy rules into a valid AST."
            };
        }
        if (directionMode && result.ast) {
            result.ast.direction = directionMode;
        }
        const strategy = this.hydrateStrategyObject(result.ast, symbol, timeframe);
        return {
            success: true,
            strategy,
            ast: result.ast
        };
    },

    /**
     * Primary Strategy Generation Entry Point for UI & Backtest Engine
     * @param {string} promptText - Natural language description (English, Bengali, Banglish)
     * @param {string} symbol - e.g. 'BTCUSDT'
     * @param {string} timeframe - e.g. '15m'
     */
    async generateStrategyFromPrompt(promptText, symbol = 'BTCUSDT', timeframe = '15m') {
        const result = await StrategyCompiler.compile(promptText, symbol, timeframe);
        if (!result.success) {
            throw new Error(result.error || "Failed to compile strategy rules into a valid AST.");
        }

        return this.hydrateStrategyObject(result.ast, symbol, timeframe);
    },

    /**
     * Hydrate Strategy AST with High-Precision Dynamic Execution Runtime
     */
    hydrateStrategyObject(ast, symbol = 'BTCUSDT', timeframe = '15m') {
        const direction = ast.direction || 'LONG';
        const defaultParams = {
            takeProfitPct: ast.exit?.bracket?.takeProfit?.value || 3.0,
            stopLossPct: ast.exit?.bracket?.stopLoss?.value || 1.5,
            ...(ast.defaultParams || {})
        };

        return {
            id: ast.id || `strat_${Date.now()}`,
            name: ast.name || 'Quantitative AST Strategy',
            category: ast.category || 'Custom Strategy',
            badge: ast.badge || 'Validated AST',
            priceUSD: 9,
            priceBDT: 999,
            direction,
            strategyType: ast.strategyType || 'ast_dynamic',
            ast,
            structuredRules: ast.structuredRules || {
                direction,
                entryTrigger: StrategyValidator.formatEntrySummary(ast.entry, direction),
                exitTrigger: StrategyValidator.formatExitSummary(ast.exit?.bracket),
                assumptions: ast.metadata?.assumptions || ['Deterministic bar-by-bar execution'],
                weaknesses: ast.metadata?.weaknesses || ['Subject to market volatility']
            },
            defaultParams,
            paramConfig: [
                { key: 'takeProfitPct', label: 'Take Profit (%)', type: 'number', min: 0.5, max: 20, step: 0.1 },
                { key: 'stopLossPct', label: 'Stop Loss (%)', type: 'number', min: 0.3, max: 15, step: 0.1 }
            ],

            /**
             * Universal AST Signal Evaluation Runtime
             */
            execute: function(candles, params, executionDirection) {
                if (!candles || candles.length < 5) return [];
                const activeDir = executionDirection || this.direction || direction;
                const evaluator = new ASTEvaluator(candles);
                return evaluator.evaluateStrategy(ast, activeDir);
            },

            generatePineScript: (params, s = symbol, tf = timeframe) => {
                return ast.pineScriptV5 || StrategyCompiler.generatePineScriptFromAST(ast, s, tf);
            }
        };
    },

    /**
     * Generate rule metadata for UI direction changes strictly from AST conventions
     */
    generateRuleMetadata(strategyType, direction, tpPct, slPct, fast, slow, rsiLen, rsiOs, rsiOb, rrRatio, promptText = '') {
        const exitDesc = `Take Profit ${tpPct}%, Stop Loss ${slPct}%${rrRatio ? ` (1:${rrRatio} R:R)` : ''}`;
        const entryDesc = direction === 'BOTH'
            ? 'LONG: Signal confirmation on bullish condition. SHORT: Signal confirmation on bearish condition.'
            : (direction === 'SHORT' ? 'SHORT: Signal confirmation on bearish condition.' : 'LONG: Signal confirmation on bullish condition.');

        return {
            entryDesc,
            exitDesc,
            assumptions: ['Continuous market liquidity and executable order books'],
            weaknesses: ['Susceptible to whipsaws during ranging periods']
        };
    }
};

if (typeof window !== 'undefined') {
    window.GeminiEngine = GeminiEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiEngine;
}

export default GeminiEngine;
