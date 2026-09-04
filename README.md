# ⚡ Trading-OS v1.02 — Institutional Quantitative Trading Research & Strategy Validation Platform

A professional, production-grade quantitative trading research platform featuring Google Gemini AI natural language strategy compilation, multi-asset backtesting (Crypto, Forex, Gold, US Stocks), Walk-Forward Testing, Monte Carlo Robustness Lab, Parameter Sensitivity Heatmaps, Market Regime Analysis, Strategy Health Scoring (0–100), AI Trade Explainer, and $9 USDT Binance Pay (UID: 716216436) monetization.

---

## 🏛️ System Architecture Overview

Trading-OS is built on a resilient, multi-layer reactive pipeline designed to bridge intuitive qualitative trading logic with institutional mathematical validation:

<p align="center">
  <img src="docs/assets/system_architecture.png" alt="Trading-OS System Architecture" width="100%">
</p>

### Key Architectural Pillars:
1. **Interactive Frontend & Quant Terminal:** React 18, Vite, TailwindCSS, and TradingView Lightweight Charts with reactive state management and instant multi-timeframe switching.
2. **Multi-Asset Market Data Layer (`js/api.js`):** Ingests live Binance Kline streams (500 historical candles) across Crypto, Forex pairs, Gold (XAUUSD), and US Indices.
3. **Dual-Engine Strategy Compiler (`js/geminiEngine.js`):** Blends deep Google Gemini 1.5 Flash AI reasoning with a zero-latency deterministic offline regex heuristic engine and fail-safe price action fallback.
4. **Zero-Lookahead Execution Engine (`js/backtestEngine.js`):** Bar-by-bar chronological execution simulating realistic broker conditions (0.075% commission + 0.02% slippage).
5. **Multi-Regime Quant Verification Lab:** Walk-Forward Out-of-Sample testing, 1,000-run Monte Carlo stress simulation, parameter sensitivity heatmaps, and a 0–100 composite health score.

---

## ⚡ Natural Language Strategy Compilation Pipeline

How Trading-OS converts user thoughts (in English, Bengali, or Banglish) into fully verified mathematical models:

<p align="center">
  <img src="docs/assets/strategy_generation_pipeline.png" alt="Trading-OS Strategy Compilation Pipeline" width="100%">
</p>

### Why Even Minimal Prompts (e.g., typing 'H') Work Without Crashing:
- **Resilient Fallback Design:** Trading-OS operates on a zero-crash policy. When an input doesn't contain explicit indicator keywords (like *RSI*, *EMA*, or *MACD*), the engine doesn't throw a runtime error.
- **Institutional Liquidity Rebound Model:** It defaults to a structural **Swing High / Swing Low Support-Resistance Rejection Model** with an adaptive **1:2 Risk-to-Reward ratio (3.0% TP / 1.5% SL)**.
- **Immediate Executability:** The model instantly generates bar-by-bar buy/sell signals on historical candles and exports native **TradingView Pine Script v5** code ready for production deployment.

---

## 🔬 Institutional 6-Pillar Strategy Verification Flow

Trading-OS helps quantitative traders and retail investors overcome the #1 trap in algorithmic trading: **Curve-Fitting & False Optimism**. Every strategy undergoes an automated 6-pillar validation process:

<p align="center">
  <img src="docs/assets/quant_validation_workflow.png" alt="Institutional 6-Pillar Strategy Verification Flow" width="100%">
</p>

| Pillar | Quantitative Purpose | Target Benchmark |
| :--- | :--- | :--- |
| **1. In-Sample Backtest** | Baseline bar-by-bar historical simulation with realistic fee (0.075%) and slippage (0.02%). | Profit Factor > 1.30, Win Rate > 45% |
| **2. Walk-Forward & OOS** | 60% Train / 40% Test split to verify that alpha persists on unseen future market regimes. | Walk-Forward Efficiency (WFE) > 60% |
| **3. Monte Carlo Stress** | 1,000 randomized bootstrap iterations with trade sequence shuffling and ±15% noise. | Probability of Ruin < 5%, VaR 95% Drawdown |
| **4. Sensitivity Plateau** | 2D parameter surface test to separate robust profit plateaus from fragile cliff-edge spikes. | Plateau Stability > 70% |
| **5. Regime Classifier** | Segregates performance across 5 market conditions (Bull, Bear, Ranging, High/Low Volatility). | Positive Expectancy in primary target regime |
| **6. Composite Health Score** | Transparent 0–100 multi-factor quantitative audit score. | Score ≥ 70/100 (Deployable Grade) |

---

## 🌟 Key Capabilities & Modules (v1.02)

### 1. 🔬 AI Strategy Copilot v2 (`js/geminiEngine.js`)
- Type trading ideas in plain natural language (English or Bengali).
- Extracts structured quantitative rules (Direction, Indicators, Entry/Exit triggers, Dynamic TP/SL).
- Automatically audits **Core Assumptions** and **Potential Market Weaknesses** (e.g. whipsaw risk in low-volume ranging periods).
- Generates verified **TradingView Pine Script v5** code.

---

### 2. 📊 Advanced Quantitative Backtesting Engine (`js/backtestEngine.js`)
- **Zero Lookahead Bias:** Bar-by-bar chronological simulation with realistic slippage and commission deducted on all order legs.
- **Directional Flexibility:** Supports **LONG and SHORT** strategies.
- **Position Sizing Models:** `% Equity`, `Fixed Cash $`, `Risk % per Trade` (dynamic ATR/Stop Loss sizing).
- **Execution & Risk Management:** Trailing Stops, Break-Even Stops, Slippage, and Commission deductions.
- **Institutional Quant Metrics:** Total Return, Win Rate, Profit Factor, Sharpe Ratio, Sortino Ratio, Calmar Ratio, Recovery Factor, Expectancy (R-multiple), Payoff Ratio, Max Consecutive Wins/Losses.

---

### 3. 📈 Walk-Forward & Out-of-Sample (OOS) Validation (`js/walkForwardEngine.js`)
- Segregates historical price action into **In-Sample (Train: 60%)** and **Out-of-Sample (Test: 40%)**.
- Computes **Walk-Forward Efficiency (WFE %)** and **Degradation Factor %** to mathematically verify whether strategy alpha persists on unseen future market regimes.

---

### 4. 🛡️ Monte Carlo Robustness Lab (`js/robustnessEngine.js`)
- Runs **1,000 randomized Monte Carlo simulations** with bootstrap trade sequence resampling and ±15% market noise perturbation.
- Computes **Probability of Profit %**, **Probability of Ruin %** (>50% drawdown threshold), **5th Percentile Worst Drawdown (VaR 95%)**, and generates interactive multi-quantile fan charts.

---

### 5. 🎯 Parameter Sensitivity & Plateau Explorer (`js/sensitivityEngine.js`)
- 2D Parameter matrix test exploring adjacent parameter spaces.
- Distinguishes **broad stable profit plateaus** from **fragile, overfitted cliff-edge spikes**.

---

### 6. 🌐 Market Regime Analysis (`js/regimeEngine.js`)
- Classifies price action into 5 distinct quantitative regimes:
  - 📈 **Bullish Trending**
  - 📉 **Bearish Trending**
  - ↔️ **Ranging / Mean-Reverting**
  - ⚡ **High Volatility Expansion**
  - 🧊 **Low Volatility Squeeze**
- Segregates trade performance to identify exact market conditions where the strategy has high vs low edge.

---

### 7. 🩺 Strategy Health Score & Overfitting Diagnostics (`js/overfittingEngine.js`)
- Transparent 0–100 multi-factor quantitative scoring matrix evaluating:
  - Sample Size & Statistical Significance (20%)
  - Risk-Adjusted Return Profile (25%)
  - Drawdown Resilience (20%)
  - Out-of-Sample Robustness (15%)
  - Monte Carlo Stress Resilience (10%)
  - Parameter Plateau Stability (10%)

---

### 8. 🔍 AI Trade Explainer (`js/tradeExplainer.js`)
- Interactive bar-by-bar transparent trade auditor.
- Inspects exact technical conditions, indicators, planned risk/reward, and exit drivers for every trade.

---

### 9. 📓 Research Journal & Strategy Versioning (`js/strategyJournal.js`)
- Track strategy iterations (`v1.0`, `v1.1`, `v2.0`) with discretionary research notes.
- 1-Click export of complete trade execution logs to formatted CSV (`TradingOS_Backtest_Trades.csv`).

---

### 10. 📰 Forex Factory Style Live Economic Calendar (`js/newsFeed.js`)
- Macroeconomic feed (CPI Inflation, Non-Farm Payrolls, FOMC/Fed Interest Rate Decisions, ECB, BoE).
- Actual vs Forecast vs Previous statistical releases with live pulse indicator.

---

### 11. 🔒 Multi-Network Crypto & Binance Pay Integration (`js/pineVault.js` & `js/paymentVerifier.js`)
- **Binance Pay ID / UID:** `716216436` (0% Gas Fees)
- **USDT (TRC-20):** `TDH1vjLT9zcDoGd9sVEcEBcomp3Da5Rjjm`
- **USDT (BEP-20):** `0xd6fa32d746d7044b281135f509a7494669a22472`
- **USDT (ERC-20):** `0xd6fa32d746d7044b281135f509a7494669a22472`
- **Flat Price:** `$9.00 USDT`
- **Live TronScan & BscScan On-Chain Auto-Verification** with instant Telegram Sale Alert Bot (`@TrdOsP_bot`, Chat ID: `5334373578`).

---

## 🚀 How to Run Locally

```bash
cd /Users/khalidabdullah/AntiGravity/Trading-OS
/usr/local/bin/python3 server.py
```

Then open your browser:
👉 **`http://localhost:8088`**

---

## 👤 Author & Maintainer

**Khalid Abdullah** — *Lead Architect & Quantitative Software Engineer*
- **GitHub:** [github.com/khalidabdullahh](https://github.com/khalidabdullahh)
- **Repository:** [Trading-OS](https://github.com/khalidabdullahh/Trading-OS)
- **Digital Lab / Portfolio:** [khalid-digital-lab.vercel.app](https://khalid-digital-lab.vercel.app/)
- **Facebook:** [facebook.com/khalidabdullah19](https://www.facebook.com/khalidabdullah19)
- **LinkedIn:** [Khalid Abdullah](https://bd.linkedin.com/in/khalid-abdullah-847724339)
- **X (Twitter):** [@khalid_al_raed](https://x.com/khalid_al_raed)
- **ORCID:** [0009-0006-8945-7593](https://orcid.org/0009-0006-8945-7593)
