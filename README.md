# ⚡ Trading-OS — AI Quantitative Strategy Lab & Pine Script Engine

A production-grade AI-powered algorithmic trading strategy builder, backtester, and Pine Script monetization platform.

---

## 🌟 Key Features

- **🤖 Google Gemini AI Strategy Generator:**
  - Users can describe any trading idea in plain natural language (English, Bengali, or Banglish).
  - Gemini AI analyzes the logic, extracts indicator conditions, risk profiles, and converts it into an algorithmic backtesting model + ready-to-run TradingView Pine Script v5 code.
  - Supports quick preset templates (9/21 EMA Cross, Bollinger Mean Reversion, SuperTrend ATR Breakout).
- **🌐 100% Free Live Market Data:** Directly connects to Binance Public Historical API (`/api/v3/klines`) with zero API key configuration across BTC, ETH, SOL, BNB, XRP, ADA, DOGE, AVAX, LINK, NEAR.
- **⚡ Professional Backtesting Analytics (Zero Lookahead Bias):**
  - Win Rate % & Win/Loss Breakdown
  - Net Profit ($ and %)
  - Profit Factor (Gross Profit / Gross Loss)
  - Maximum Drawdown ($ and %)
  - Annualized Sharpe Ratio
  - Bar-by-bar Trade Execution History Log (Entry/Exit Price, Duration, Exit Reason)
  - Equity Growth Curve visualization
- **📈 TradingView Lightweight Candlestick Charts:**
  - Interactive zoom, pan, and volume histogram.
  - Live **BUY (Green arrow up)** and **EXIT (Red arrow down)** markers directly on the candlestick bars.
  - Dynamic indicator overlay lines (Fast EMA, Slow EMA, Trend EMA, Bollinger Bands, SuperTrend).
- **🔒 Pine Script v5 Code Vault & Crypto Paywall ($9 USDT Flat):**
  - Proprietary algorithm source code stays protected and blurred during free backtesting.
  - Exclusive **Crypto-Only Checkout** supporting **USDT (TRC-20, BEP-20, Solana)** with QR code and instant on-chain verification.
  - 1-Click Pine Script v5 Copy-to-Clipboard & `.pine` file download ready for TradingView Pine Editor and Webhook Bots (3Commas, Cornix).

---

## 🚀 How to Run Locally

Run with Python 3:

```bash
cd /Users/khalidabdullah/AntiGravity/Trading-OS
/usr/local/bin/python3 server.py
```

Then open your browser at:
👉 **`http://localhost:8088`**

---

## 📁 Directory Structure

```
Trading-OS/
├── index.html              # Main AI trading dashboard
├── server.py               # Lightweight Python HTTP server
├── vercel.json             # Vercel deployment configuration
├── README.md               # Documentation & setup guide
├── css/
│   └── styles.css          # Dark Bloomberg-grade theme & styling
└── js/
    ├── geminiEngine.js     # Google Gemini AI strategy generator & NLP parser
    ├── api.js              # Binance API client & synthetic market fallback
    ├── indicators.js       # Quantitative indicators (EMA, RSI, MACD, BB, ATR, SuperTrend, Stoch)
    ├── strategies.js       # Strategy registry & Pine Script v5 transpiler
    ├── backtestEngine.js   # Bar-by-bar simulation & metric calculations
    ├── chart.js            # TradingView Lightweight Charts manager
    └── pineVault.js        # $9 USDT crypto paywall & code export
```

---

## 👤 Author & Maintainer

**Khalid Abdullah**
- **GitHub:** [github.com/khalidabdullahh](https://github.com/khalidabdullahh)
- **Repository:** [Trading-OS](https://github.com/khalidabdullahh/Trading-OS)
- **LinkedIn:** [Khalid Abdullah](https://bd.linkedin.com/in/khalid-abdullah-847724339)
