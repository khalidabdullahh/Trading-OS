# 📋 Trading-OS Changelog

All notable changes to the Trading-OS platform are documented in this file.

---

## [v1.02] — 2026-08-26 (Professional Quantitative Trading Research Platform)

### 🌟 Added
- **AI Strategy Copilot v2 (`js/geminiEngine.js`)**: Converts natural language prompts into structured rules (Direction, Indicators, Entry/Exit triggers) with automated Assumption & Potential Weakness analysis.
- **Advanced Quantitative Backtest Engine (`js/backtestEngine.js`)**:
  - Support for LONG and SHORT trade executions.
  - Position Sizing Models: `% Equity`, `Risk % per Trade` (dynamic SL sizing), `Fixed Cash $`.
  - Advanced Risk Management: Trailing Stops, Break-Even Stops, Slippage, and Commission deductions.
  - Comprehensive Quant Metrics: Sharpe, Sortino, Calmar, Expectancy (R-multiple), Payoff Ratio, Recovery Factor, Max Consecutive Wins/Losses.
- **Walk-Forward & Out-of-Sample (OOS) Validation (`js/walkForwardEngine.js`)**: 60% In-Sample Train vs 40% Out-of-Sample Test with Walk-Forward Efficiency (WFE %) and Degradation Factor %.
- **Monte Carlo Robustness Lab (`js/robustnessEngine.js`)**: 1,000 simulations with trade sequence bootstrap resampling, return perturbation, Probability of Ruin %, and 95% Worst Drawdown (VaR).
- **Parameter Sensitivity & Stability Explorer (`js/sensitivityEngine.js`)**: 2D parameter sensitivity matrix heatmap detecting broad stable plateaus vs narrow fragile cliff-edge spikes.
- **Strategy Health Score & Overfitting Detector (`js/overfittingEngine.js`)**: Transparent 0–100 multi-factor quantitative scoring matrix with itemized sub-score explanations.
- **Market Regime Analysis (`js/regimeEngine.js`)**: Classifies market conditions (Bull Trend, Bear Trend, Ranging, High/Low Volatility) and measures segmented strategy performance.
- **AI Trade Explainer (`js/tradeExplainer.js`)**: Interactive bar-by-bar trade audit modal detailing entry indicators, planned risk, and exit triggers.
- **Research Journal & Strategy Versioning (`js/strategyJournal.js`)**: Strategy version tracking (v1.0, v1.1, v2.0), research notes, and one-click Trade Execution Log CSV export.
- **Bloomberg-Grade Institutional Research Terminal UI (`index.html` & `css/styles.css`)**: Dense, responsive, multi-tab quant workspace.

### 🛡️ Preserved & Improved from v1.01
- Multi-asset market data client (Binance Live Crypto API + FX, Commodities, Equities).
- Economic Calendar & Breaking Wire (`js/newsFeed.js`).
- Pine Script v5 Code Vault and Binance Pay UID `716216436` integration with Telegram Sale Alert bot (`@TrdOsP_bot`, Chat ID: `5334373578`).

---

## [v1.01] — 2026-08-26 (Multi-Asset Engine & Binance Pay Integration)
- Multi-market asset registry (Crypto, Forex, Gold, US Stocks).
- TradingView Lightweight Charts integration.
- Binance Pay UID `716216436` & On-Chain TRC-20/BEP-20 verification.
- Telegram instant sale alerts.
