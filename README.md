# ⚡ Trading-OS v1.02 — AI-Assisted Quantitative Trading Research & Strategy Validation Platform

A professional, production-grade quantitative trading research platform featuring Google Gemini AI natural language strategy conversion, multi-asset backtesting (Crypto, Forex, Gold, US Stocks), Walk-Forward Testing, Monte Carlo Robustness Lab, Parameter Sensitivity Heatmaps, Market Regime Analysis, Strategy Health Scoring (0–100), AI Trade Explainer, and $9 USDT Binance Pay (UID: 716216436) monetization.

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

**Khalid Abdullah**
- **GitHub:** [github.com/khalidabdullahh](https://github.com/khalidabdullahh)
- **Repository:** [Trading-OS](https://github.com/khalidabdullahh/Trading-OS)
- **LinkedIn:** [Khalid Abdullah](https://bd.linkedin.com/in/khalid-abdullah-847724339)
