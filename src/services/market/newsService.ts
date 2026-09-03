/**
 * Trading-OS v2.0 - News Terminal & Economic Calendar Service
 * Authorized macro events, cross-asset impact matrix, and AI "Why Is This Moving?" engine
 */

import { EconomicEvent, NewsArticle } from "../../types/domain";

export class NewsService {
  static readonly ECONOMIC_EVENTS: EconomicEvent[] = [
    {
      id: "cpi_usd",
      event: "US Core CPI Inflation Rate (MoM & YoY)",
      country: "United States",
      currency: "USD",
      date: new Date(Date.now() + 3600000 * 4).toISOString(),
      impact: "HIGH",
      forecast: "0.3%",
      previous: "0.2%",
      bias: "Bullish Volatility for Gold & Crypto",
      summary: "Core Consumer Price Index excludes volatile food and energy components, serving as the Federal Reserve's primary structural inflation gauge.",
      cryptoImpact: "Lower-than-forecast prints (<0.2%) trigger aggressive digital asset breakout rallies due to falling real Treasury yields.",
      goldImpact: "Gold (XAU/USD) rallies on softer inflation numbers as real bond yields decline.",
      forexImpact: "Hot CPI triggers Dollar Index (DXY) dominance and heavy downside pressure on EUR/USD and GBP/USD.",
      tradingRule: "Expect rapid 1.5% - 2.5% volatility spikes within the first 3 minutes of release. Wait for the 5-minute bar close before confirming continuation."
    },
    {
      id: "fomc_rate",
      event: "FOMC Federal Reserve Interest Rate Decision & Press Conference",
      country: "United States",
      currency: "USD",
      date: new Date(Date.now() + 3600000 * 28).toISOString(),
      impact: "CRITICAL",
      forecast: "5.25%",
      previous: "5.50%",
      bias: "Macro Catalyst across all global assets",
      summary: "Fed Chair Jerome Powell's press conference and the dot-plot economic projections provide the ultimate framework for global liquidity and interest rate trajectories.",
      cryptoImpact: "A dovish rate cut or forward guidance unlocks institutional liquidity rotation into Bitcoin and major altcoins.",
      goldImpact: "Non-yielding Gold surges toward record highs during dovish interest rate pivots.",
      forexImpact: "Directly resets global interest rate differentials. A dovish stance triggers significant Dollar sell-offs.",
      tradingRule: "Highest volatility catalyst. Do not trade headline print blind. Maintain conservative leverage (1x - 3x) and strictly enforced stop losses."
    },
    {
      id: "nfp_jobs",
      event: "US Non-Farm Payrolls (NFP) & Average Hourly Earnings",
      country: "United States",
      currency: "USD",
      date: new Date(Date.now() + 3600000 * 72).toISOString(),
      impact: "HIGH",
      forecast: "175K",
      previous: "187K",
      bias: "Labor Market Health & Wage Inflation",
      summary: "Measures net monthly job creation in the United States, providing a snapshot of economic expansion and consumer spending momentum.",
      cryptoImpact: "A cooling labor market (<150k) raises expectations for Federal Reserve policy easing, supporting speculative demand.",
      goldImpact: "Weak job numbers accelerate safe-haven bids in Gold. Blowout prints (>220k) cause temporary pullbacks.",
      forexImpact: "EUR/USD, GBP/USD, and USD/JPY experience their widest liquidity ranges of the week on NFP Fridays.",
      tradingRule: "The initial 15-minute high/low range establishes the market structure for the following 48 to 72 hours."
    },
    {
      id: "ecb_rate",
      event: "ECB Monetary Policy Decision & Christine Lagarde Speech",
      country: "Eurozone",
      currency: "EUR",
      date: new Date(Date.now() + 3600000 * 12).toISOString(),
      impact: "HIGH",
      forecast: "3.75%",
      previous: "4.00%",
      bias: "Forex EUR/USD Liquidity Injection",
      summary: "European Central Bank sets benchmark rates for the 20 EU nations sharing the Euro currency.",
      cryptoImpact: "Expansion of European M2 money supply provides indirect structural tailwinds for digital assets.",
      goldImpact: "Gold priced in Euros (XAU/EUR) achieves new records during rapid rate-cutting cycles.",
      forexImpact: "The dominant driver for EUR/USD and EUR/GBP trends.",
      tradingRule: "Monitor EUR/USD liquidity sweeps around psychological round numbers (1.0800, 1.0900) before entering."
    }
  ];

  static readonly NEWS_ARTICLES: NewsArticle[] = [
    {
      id: "news_1",
      title: "Bitcoin Institutional Inflows Accelerate as Global Liquidity Expands",
      source: "Institutional Digital Assets Desk",
      publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      category: "Crypto",
      impact: "HIGH",
      summary: "Spot Bitcoin exchange-traded funds recorded over $420 million in net daily inflows, driven by pension funds and systematic macro managers.",
      aiAnalysis: "Rising spot order book depth indicates structural accumulation rather than leveraged speculative buying.",
      symbols: ["BTCUSDT", "ETHUSDT"]
    },
    {
      id: "news_2",
      title: "Gold Spot Holds Above $2,500 on Central Bank Reserve Accumulation",
      source: "Global Commodities Research",
      publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      category: "Commodities",
      impact: "HIGH",
      summary: "Sovereign reserve managers continued diversification into physical Gold, maintaining strong support above $2,500/oz.",
      aiAnalysis: "Gold remains in an institutional accumulation trend. Dips toward 200 EMA continue to find aggressive institutional demand.",
      symbols: ["XAUUSD"]
    },
    {
      id: "news_3",
      title: "NVIDIA Advances on Datacenter AI Accelerator Demand",
      source: "Equity Quant Analysis",
      publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      category: "Equities",
      impact: "MEDIUM",
      summary: "Next-generation architecture production ramps up with strong pre-orders across cloud hyperscalers.",
      aiAnalysis: "Bullish continuation pattern intact above the 21 EMA support line.",
      symbols: ["NVDA", "NAS100"]
    }
  ];

  static getEconomicEvents(): EconomicEvent[] {
    return this.ECONOMIC_EVENTS;
  }

  static getNewsArticles(): NewsArticle[] {
    return this.NEWS_ARTICLES;
  }

  /**
   * AI "Why Is This Moving?" Diagnostic Engine
   */
  static getWhyIsThisMoving(symbol: string, currentPrice: number, changePct: number): string {
    const cleanSym = symbol.toUpperCase();
    const isUp = changePct >= 0;

    if (cleanSym.includes("BTC") || cleanSym.includes("ETH")) {
      return `Bitcoin / Crypto is ${isUp ? "up" : "down"} ${Math.abs(changePct)}% over the session. Primary drivers: Sustained net ETF spot inflows and shifting market expectations around upcoming FOMC rate paths. Order book delta indicates ${isUp ? "aggressive spot accumulation" : "localized profit-taking at resistance"}.`;
    }
    if (cleanSym.includes("XAU") || cleanSym.includes("GOLD")) {
      return `Gold Spot is trading at $${currentPrice.toFixed(2)} (${isUp ? "+" : ""}${changePct}%). Key catalyst: Central bank reserve diversification and falling real yields in sovereign bond markets. Institutional support holds above major structural swing levels.`;
    }
    if (cleanSym.includes("EUR") || cleanSym.includes("GBP") || cleanSym.includes("USD")) {
      return `Forex pair ${cleanSym} is ${isUp ? "rallying" : "pulling back"} following interest rate differential adjustments between the Federal Reserve and European Central Bank. Watch for liquidity sweeps around daily session open levels.`;
    }

    return `Instrument ${cleanSym} is moving (${isUp ? "+" : ""}${changePct}%) in alignment with broader equity and macroeconomic sentiment. Technical momentum indicates confluence around key moving average levels.`;
  }
}
