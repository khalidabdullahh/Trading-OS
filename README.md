# ⚡ Trading-OS — AI Strategy Lab, Multi-Market Backtester & Economic Calendar

A production-grade algorithmic trading strategy platform with Google Gemini AI natural language strategy conversion, multi-asset backtesting (Crypto, Forex, Gold, US Stocks), Forex Factory-style live economic calendar, and $9 USDT Binance Pay (UID: 716216436) monetization.

---

## 🌟 Key Capabilities

### 1. 🌐 Universal Multi-Market Coverage
Directly test and execute strategies across all global financial asset classes:
- **🪙 Crypto (Binance Free Public API):** `BTC/USDT`, `ETH/USDT`, `SOL/USDT`, `BNB/USDT`, `XRP/USDT`, `ADA/USDT`, `DOGE/USDT`, `AVAX/USDT`, `LINK/USDT`, `NEAR/USDT`
- **💱 Forex Majors (Global FX Interbank):** `EUR/USD`, `GBP/USD`, `USD/JPY`, `AUD/USD`, `USD/CAD`
- **🏆 Precious Metals & Commodities:** `Gold (XAU/USD)`, `Silver (XAG/USD)`, `WTI Crude Oil (Oil/USD)`
- **📈 US Equities & Indices:** `Apple (AAPL)`, `Tesla (TSLA)`, `Nvidia (NVDA)`, `S&P 500 ETF (SPY)`, `Microsoft (MSFT)`

---

### 2. 📰 Forex Factory Style Live Economic Calendar (`js/newsFeed.js`)
- **Live Macroeconomic Feed:** High/Medium/Low impact macroeconomic events (CPI Inflation, Non-Farm Payrolls, FOMC/Fed Interest Rate Decisions, ECB, BoE, BoJ).
- **Actual vs Forecast vs Previous** statistical releases.
- **Breaking Financial Wire:** Real-time headlines across Crypto, Forex, Gold, and Equities.
- **Auto-Refresh Engine:** Automatically updates with live pulse indicator.

---

### 3. 🤖 Google Gemini AI Strategy Generator (`js/geminiEngine.js`)
- Type your strategy in plain natural language (English or Bengali).
- Gemini AI automatically parses rules, indicators (EMA, RSI, MACD, Bollinger Bands, SuperTrend), calculates Win Rate, Profit/Loss, Drawdown on live data, and generates complete **Pine Script v5** code.

---

### 4. 🔒 Multi-Network Crypto & Binance Pay Integration (`js/pineVault.js`)
- **Binance Pay ID / UID:** `716216436` (0% Gas Fees)
- **USDT (TRC-20):** `TDH1vjLT9zcDoGd9sVEcEBcomp3Da5Rjjm`
- **USDT (BEP-20):** `0xd6fa32d746d7044b281135f509a7494669a22472`
- **USDT (ERC-20):** `0xd6fa32d746d7044b281135f509a7494669a22472`
- **Flat Price:** `$9.00 USDT`

---

### 5. 🛡️ Triple-Layer Verification & Alert Engine (`js/paymentVerifier.js`)
1. **TronScan & BscScan On-Chain Validation:** Queries real-time public blockchain explorer APIs to verify that transactions are confirmed, sent to your exact deposit address, and matches $9 USDT.
2. **Binance Pay Reference Verification:** Validates 19-digit Binance Pay order identifiers and prevents double-spending / reuse.
3. **Telegram Instant Admin Alert Bot:** Sends real-time notifications to your Telegram when an order is completed.

---

## 🚀 How to Run Locally

```bash
cd /Users/khalidabdullah/AntiGravity/Trading-OS
/usr/local/bin/python3 server.py
```

Then open:
👉 **`http://localhost:8088`**

---

## 👤 Author & Maintainer

**Khalid Abdullah**
- **GitHub:** [github.com/khalidabdullahh](https://github.com/khalidabdullahh)
- **Repository:** [Trading-OS](https://github.com/khalidabdullahh/Trading-OS)
- **LinkedIn:** [Khalid Abdullah](https://bd.linkedin.com/in/khalid-abdullah-847724339)
