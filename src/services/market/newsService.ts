/**
 * Trading-OS v2.01 - News Terminal & Economic Calendar Service
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
      date: new Date(Date.now() + 3600000 * 3).toISOString(),
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
      date: new Date(Date.now() + 3600000 * 24).toISOString(),
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
      event: "US Non-Farm Payrolls (NFP) & Unemployment Rate",
      country: "United States",
      currency: "USD",
      date: new Date(Date.now() + 3600000 * 48).toISOString(),
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
    },
    {
      id: "boj_rate",
      event: "Bank of Japan (BOJ) Policy Rate & Yield Curve Control",
      country: "Japan",
      currency: "JPY",
      date: new Date(Date.now() + 3600000 * 36).toISOString(),
      impact: "CRITICAL",
      forecast: "0.25%",
      previous: "0.10%",
      bias: "Global Yen Carry Trade Unwind Watch",
      summary: "Bank of Japan rate normalization directly affects global carry-trade financing across risk assets and sovereign debt.",
      cryptoImpact: "Yen appreciation causes temporary leveraged crypto liquidations as carry trades are unwound.",
      goldImpact: "Safe-haven asset during extreme forex cross volatility.",
      forexImpact: "Causes massive 200+ pip multi-session swings on USD/JPY and GBP/JPY.",
      tradingRule: "Strictly avoid high leverage on JPY crosses during BOJ morning press conference sessions."
    },
    {
      id: "us_gdp",
      event: "US Gross Domestic Product (GDP) Annualized (QoQ)",
      country: "United States",
      currency: "USD",
      date: new Date(Date.now() + 3600000 * 60).toISOString(),
      impact: "HIGH",
      forecast: "2.8%",
      previous: "3.0%",
      bias: "US Economic Growth & Soft Landing Metric",
      summary: "Measures annualized growth in the value of all goods and services produced in the US economy.",
      cryptoImpact: "Solid growth (>2.5%) without runaway inflation is the optimal macro backdrop for risk assets.",
      goldImpact: "Economic resilience limits recession hedge demand temporarily.",
      forexImpact: "Supports USD strength against cyclical currencies.",
      tradingRule: "Trade trend continuations following the 30-minute opening breakout."
    },
    {
      id: "opec_meeting",
      event: "OPEC+ Joint Ministerial Monitoring Committee Meeting",
      country: "International",
      currency: "USD",
      date: new Date(Date.now() + 3600000 * 80).toISOString(),
      impact: "HIGH",
      forecast: "Voluntary Cut Extension",
      previous: "2.2M bpd cut",
      bias: "Crude Oil (USOIL) Supply & Commodity Index Driver",
      summary: "Organization of the Petroleum Exporting Countries reviews crude output quotas and physical inventory balance.",
      cryptoImpact: "Energy price inflation impacts overall macro CPI trajectories.",
      goldImpact: "Higher oil increases commodity basket inflation hedges.",
      forexImpact: "Direct catalyst for commodity currencies: CAD (USD/CAD) and NOK.",
      tradingRule: "Look for mean-reversion order blocks on WTI Crude (USOIL) around support levels."
    },
    {
      id: "ism_services",
      event: "US ISM Services PMI & New Orders Index",
      country: "United States",
      currency: "USD",
      date: new Date(Date.now() + 3600000 * 96).toISOString(),
      impact: "MEDIUM",
      forecast: "51.4",
      previous: "51.0",
      bias: "Services Sector Economic Health",
      summary: "Purchasing Managers Index for the services sector, accounting for over two-thirds of US economic output.",
      cryptoImpact: "Expansion (>50.0) confirms consumer resilience and steady liquidity.",
      goldImpact: "Prints above 53.0 create short-term dollar strength pullbacks on XAU/USD.",
      forexImpact: "Key trigger for US Dollar intraday scalps.",
      tradingRule: "Execute 1:2 R:R continuation trades on 15-minute timeframe."
    }
  ];

  static readonly NEWS_ARTICLES: NewsArticle[] = [
    {
      id: "news_1",
      title: "Bitcoin Institutional Inflows Surge Past $540M as Spot ETF Demand Accelerates",
      source: "Bloomberg / Institutional Crypto Desk",
      publishedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      category: "Crypto",
      impact: "HIGH",
      summary: "Spot Bitcoin ETFs recorded substantial net accumulation, led by sovereign wealth allocators and systematic quant funds as global liquidity metrics expand.",
      aiAnalysis: "Spot order book delta confirms sustained institutional spot bids rather than short-term derivative leverage.",
      symbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
    },
    {
      id: "news_2",
      title: "Gold Spot Holds Historical Highs Above $2,520 on Sovereign Reserve Expansion",
      source: "Yahoo Finance / Commodities Research",
      publishedAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
      category: "Commodities",
      impact: "HIGH",
      summary: "Central banks added over 38 metric tons to gold reserves in the latest monthly settlement, insulating balance sheets against sovereign currency volatility.",
      aiAnalysis: "Gold (XAU/USD) exhibits textbook institutional accumulation. High timeframe 200 EMA remains structural baseline support.",
      symbols: ["XAUUSD", "XAGUSD"]
    },
    {
      id: "news_3",
      title: "NVIDIA Advances 3.2% as AI Datacenter Cloud Hyperscalers Increase Capex",
      source: "Reuters / Technology Equity Desk",
      publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      category: "Equities",
      impact: "HIGH",
      summary: "Next-generation Blackwell architecture deliveries ramp up with expanded supply agreements across major tier-1 cloud providers.",
      aiAnalysis: "Bullish continuation structure intact. Key support level at 21 EMA ($124.00) firmly defended.",
      symbols: ["NVDA", "NAS100", "MSFT"]
    },
    {
      id: "news_4",
      title: "EUR/USD Consolidates Near 1.0890 Ahead of ECB Policy Divergence Signals",
      source: "ForexLive / Global FX Matrix",
      publishedAt: new Date(Date.now() - 3600000 * 5.5).toISOString(),
      category: "Forex",
      impact: "MEDIUM",
      summary: "Euro currency pairs maintain tight ranges as traders balance European wage inflation figures against expected Federal Reserve easing paths.",
      aiAnalysis: "Liquidity sweeps expected around Asian session highs (1.0910). Look for rejection candles before entering short positions.",
      symbols: ["EURUSD", "GBPUSD", "USDJPY"]
    },
    {
      id: "news_5",
      title: "Federal Reserve Signals Data-Dependent Policy Path with Focus on Real Yields",
      source: "Financial Times / Macro Strategy",
      publishedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
      category: "Macro",
      impact: "HIGH",
      summary: "Federal Reserve officials emphasize balance sheet normalization pace while monitoring global interbank funding liquidity.",
      aiAnalysis: "Provides favorable conditions for algorithmic trend-following strategies across indices and risk assets.",
      symbols: ["SPX500", "US30", "NAS100"]
    },
    {
      id: "news_6",
      title: "Solana DeFi Volume Reaches 6-Month Peak on High-Throughput DEX Liquidity",
      source: "CoinDesk / Digital Asset Intelligence",
      publishedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
      category: "Crypto",
      impact: "MEDIUM",
      summary: "On-chain transaction velocity and decentralized exchange liquidity pools surpassed $2.4 billion in 24-hour turnover.",
      aiAnalysis: "High relative strength indicator compared to broader altcoin basket. Key breakout level at $165.00 resistance.",
      symbols: ["SOLUSDT", "BTCUSDT"]
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

    if (cleanSym.includes("BTC") || cleanSym.includes("ETH") || cleanSym.includes("SOL")) {
      return `Digital Asset ${cleanSym} is ${isUp ? "up" : "down"} ${Math.abs(changePct)}% in current session. Catalysts: Institutional ETF spot net accumulation, derivative funding rate normalization, and macro liquidity expansion. Order book delta signals ${isUp ? "sustained spot buying" : "localized resistance profit-taking"}.`;
    }
    if (cleanSym.includes("XAU") || cleanSym.includes("GOLD") || cleanSym.includes("XAG")) {
      return `Precious metal ${cleanSym} is trading at $${currentPrice.toFixed(2)} (${isUp ? "+" : ""}${changePct}%). Key drivers: Central bank reserve accumulation, declining real yields in sovereign bond markets, and geopolitical hedge demand.`;
    }
    if (cleanSym.includes("EUR") || cleanSym.includes("GBP") || cleanSym.includes("JPY") || cleanSym.includes("USD")) {
      return `Forex instrument ${cleanSym} is ${isUp ? "rallying" : "consolidating"} following interest rate differential expectations between central banks. Watch for liquidity sweep triggers around session open levels.`;
    }
    if (cleanSym.includes("NVDA") || cleanSym.includes("NAS") || cleanSym.includes("SPX")) {
      return `Equity instrument ${cleanSym} is moving (${isUp ? "+" : ""}${changePct}%) with strong AI datacenter capex tailwinds and steady corporate earnings growth.`;
    }

    return `Instrument ${cleanSym} is trading (${isUp ? "+" : ""}${changePct}%) in alignment with institutional risk sentiment and technical trend momentum.`;
  }
}
