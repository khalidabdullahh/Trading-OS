# ⚡ Trading-OS — Quantitative Strategy Backtester & Pine Script Engine

A production-grade algorithmic trading strategy backtester and Pine Script monetization platform. Built for quantitative analysts, Pine Script creators, and crypto/forex traders.

---

## 🌟 Key Features

- **🌐 100% Free Live Market Data:** Connects directly to Binance Public Historical API (`/api/v3/klines`) with zero API keys required. Supports BTC, ETH, SOL, BNB, XRP, ADA, DOGE, AVAX, LINK, NEAR across `1m`, `5m`, `15m`, `1h`, `4h`, and `1d` intervals.
- **📊 Algorithmic Strategy Suite:**
  1. **Dynamic EMA Ribbon Trend Scalper** (Fast EMA + Slow EMA + 200 EMA Trend Filter + TP/SL)
  2. **Smart Money RSI & MACD Divergence Hunter** (Liquidity sweep & momentum flip)
  3. **SuperTrend ATR Volatility Breakout Pro** (ATR Trailing Stop & trend expansion)
  4. **Bollinger Band Mean Reversion & Stochastic Trap** (Band penetration & oversold reversal)
- **📈 TradingView Lightweight Candlestick Charts:** Interactive candlestick charting with volume bars, customizable indicator overlays, and live Buy/Exit execution markers.
- **⚡ Professional Backtesting Analytics:**
  - Win Rate % & Win/Loss Count
  - Total Net Profit ($ and %)
  - Profit Factor (Gross Profit / Gross Loss)
  - Maximum Drawdown ($ and %)
  - Annualized Sharpe Ratio
  - Bar-by-bar Trade Execution History Log (Entry/Exit Price, Duration, Exit Reason)
  - Equity Growth Curve visualization
- **🔒 Pine Script v5 Code Vault & Monetization Paywall:**
  - Server-side algorithm protection (users backtest for free without seeing the raw proprietary code).
  - Obfuscated preview with checkout modal supporting **bKash**, **Nagad**, **USDT (TRC20/BEP20)**, and **Credit Cards (Stripe)**.
  - 1-Click Pine Script v5 Copy-to-Clipboard & `.pine` file download ready for TradingView Pine Editor and Webhook Bots (3Commas, Cornix).

---

## 🚀 How to Run Locally

With zero external dependencies, simply run with Python 3:

```bash
cd /Users/khalidabdullah/AntiGravity/Trading-OS
python3 server.py
```

Then open your web browser at:
👉 **`http://localhost:8088`**

---

## 📁 Directory Structure

```
Trading-OS/
├── index.html              # Main responsive trading dashboard
├── server.py               # Lightweight Python HTTP server
├── README.md               # Documentation & setup guide
├── css/
│   └── styles.css          # Dark Bloomberg-grade theme & styling
└── js/
    ├── api.js              # Binance API client & synthetic market fallback
    ├── indicators.js       # SMA, EMA, RSI, MACD, Bollinger, ATR, SuperTrend, Stoch
    ├── strategies.js       # Strategy registry & Pine Script v5 transpiler
    ├── backtestEngine.js   # Bar-by-bar backtest simulation & metric calculations
    ├── chart.js            # TradingView Lightweight Charts manager
    └── pineVault.js        # Strategy protection, checkout modal & code export
```

---

## 👤 Author & Maintainer

**Khalid Abdullah**
- **GitHub:** [github.com/khalidabdullahh](https://github.com/khalidabdullahh)
- **Repository:** [Trading-OS](https://github.com/khalidabdullahh/Trading-OS)
- **LinkedIn:** [Khalid Abdullah](https://bd.linkedin.com/in/khalid-abdullah-847724339)
