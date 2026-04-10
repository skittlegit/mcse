// ─── Indian Market Indices ───────────────────────────────
export interface IndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export const indices: IndexData[] = [
  { name: "AEON 50", value: 23519.35, change: 187.45, changePercent: 0.80 },
  { name: "AEDEX", value: 77478.93, change: 602.75, changePercent: 0.78 },
  { name: "BANKAEON", value: 50892.15, change: -123.40, changePercent: -0.24 },
  { name: "MIDCAPEON", value: 11245.60, change: 89.30, changePercent: 0.80 },
  { name: "FINAEON", value: 23412.80, change: 45.20, changePercent: 0.19 },
];

// ─── Portfolio / Investments ────────────────────────────
export const investments = {
  currentValue: 487693.69,
  investedValue: 421500.0,
  totalReturns: 66193.69,
  totalReturnsPercent: 15.71,
  dayReturns: 2847.30,
  dayReturnsPercent: 0.59,
};

// ─── Holdings ───────────────────────────────────────────
export interface Holding {
  ticker: string;
  name: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  dayChange: number;
  dayChangePercent: number;
  returns: number;
  returnsPercent: number;
  currentValue: number;
  investedValue: number;
  sparkline: number[];
}

export const holdings: Holding[] = [
  {
    ticker: "MATHSOC",
    name: "Math Society",
    qty: 25,
    avgPrice: 2380.0,
    currentPrice: 2892.45,
    dayChange: 34.20,
    dayChangePercent: 1.20,
    returns: 12811.25,
    returnsPercent: 21.52,
    currentValue: 72311.25,
    investedValue: 59500.0,
    sparkline: [2820, 2845, 2830, 2860, 2875, 2890, 2892],
  },
  {
    ticker: "ENIGMA",
    name: "Enigma Computer Science",
    qty: 15,
    avgPrice: 3450.0,
    currentPrice: 3987.60,
    dayChange: -22.40,
    dayChangePercent: -0.56,
    returns: 8064.0,
    returnsPercent: 15.59,
    currentValue: 59814.0,
    investedValue: 51750.0,
    sparkline: [4010, 3995, 3980, 3990, 3985, 3988, 3987],
  },
  {
    ticker: "GASMONKEYS",
    name: "Gas Monkeys",
    qty: 40,
    avgPrice: 1320.0,
    currentPrice: 1578.90,
    dayChange: 18.75,
    dayChangePercent: 1.20,
    returns: 10356.0,
    returnsPercent: 19.61,
    currentValue: 63156.0,
    investedValue: 52800.0,
    sparkline: [1550, 1555, 1560, 1570, 1575, 1578, 1578],
  },
  {
    ticker: "MASTERSHOT",
    name: "MasterShot",
    qty: 30,
    avgPrice: 1560.0,
    currentPrice: 1689.25,
    dayChange: 12.30,
    dayChangePercent: 0.73,
    returns: 3877.50,
    returnsPercent: 8.28,
    currentValue: 50677.50,
    investedValue: 46800.0,
    sparkline: [1670, 1675, 1680, 1682, 1685, 1688, 1689],
  },
  {
    ticker: "ERUDITE",
    name: "Erudite",
    qty: 50,
    avgPrice: 920.0,
    currentPrice: 1087.40,
    dayChange: -8.60,
    dayChangePercent: -0.78,
    returns: 8370.0,
    returnsPercent: 18.20,
    currentValue: 54370.0,
    investedValue: 46000.0,
    sparkline: [1095, 1092, 1090, 1088, 1086, 1087, 1087],
  },
  {
    ticker: "INSIGHT",
    name: "Insight",
    qty: 100,
    avgPrice: 385.0,
    currentPrice: 468.55,
    dayChange: 5.45,
    dayChangePercent: 1.18,
    returns: 8355.0,
    returnsPercent: 21.70,
    currentValue: 46855.0,
    investedValue: 38500.0,
    sparkline: [460, 462, 464, 465, 467, 468, 468],
  },
  {
    ticker: "CELESTE",
    name: "Celeste",
    qty: 20,
    avgPrice: 1280.0,
    currentPrice: 1645.30,
    dayChange: 28.90,
    dayChangePercent: 1.79,
    returns: 7306.0,
    returnsPercent: 28.52,
    currentValue: 32906.0,
    investedValue: 25600.0,
    sparkline: [1610, 1620, 1625, 1635, 1640, 1644, 1645],
  },
];

// ─── Watchlist ──────────────────────────────────────────
export interface WatchlistStock {
  ticker: string;
  name: string;
  shares?: number;
  price: number;
  dayChange: number;
  dayChangePercent: number;
  volume: string;
  w52Low: number;
  w52High: number;
  sparkline: number[];
}

export const watchlist: WatchlistStock[] = [
  {
    ticker: "MATHSOC",
    name: "Math Society",
    shares: 45,
    price: 972.40,
    dayChange: 15.80,
    dayChangePercent: 1.65,
    volume: "12.4M",
    w52Low: 620,
    w52High: 1080,
    sparkline: [950, 955, 960, 965, 968, 970, 972],
  },
  {
    ticker: "ENIGMA",
    name: "Enigma Computer Science",
    shares: 60,
    price: 487.25,
    dayChange: -3.75,
    dayChangePercent: -0.76,
    volume: "8.2M",
    w52Low: 380,
    w52High: 540,
    sparkline: [492, 490, 489, 488, 487, 487, 487],
  },
  {
    ticker: "MASTERSHOT",
    name: "MasterShot",
    shares: 80,
    price: 812.60,
    dayChange: 9.40,
    dayChangePercent: 1.17,
    volume: "18.7M",
    w52Low: 555,
    w52High: 890,
    sparkline: [800, 803, 806, 808, 810, 812, 812],
  },
  {
    ticker: "INSIGHT",
    name: "Insight",
    price: 2934.15,
    dayChange: -42.85,
    dayChangePercent: -1.44,
    volume: "5.6M",
    w52Low: 2100,
    w52High: 3450,
    sparkline: [2980, 2970, 2960, 2950, 2940, 2935, 2934],
  },
  {
    ticker: "CELESTE",
    name: "Celeste",
    shares: 10,
    price: 7245.80,
    dayChange: 58.20,
    dayChangePercent: 0.81,
    volume: "3.1M",
    w52Low: 5850,
    w52High: 7800,
    sparkline: [7180, 7195, 7210, 7225, 7235, 7242, 7245],
  },
  {
    ticker: "ERUDITE",
    name: "Erudite",
    price: 1534.90,
    dayChange: 22.10,
    dayChangePercent: 1.46,
    volume: "4.8M",
    w52Low: 1050,
    w52High: 1620,
    sparkline: [1510, 1515, 1520, 1525, 1530, 1533, 1534],
  },
];

// ─── Most Traded ────────────────────────────────────────
export interface MostTradedStock {
  ticker: string;
  name: string;
  price: number;
  dayChange: number;
  dayChangePercent: number;
}

export const mostTraded: MostTradedStock[] = [
  { ticker: "MATHSOC", name: "Math Society", price: 2892.45, dayChange: 34.20, dayChangePercent: 1.20 },
  { ticker: "ENIGMA", name: "Enigma Computer Science", price: 3987.60, dayChange: -22.40, dayChangePercent: -0.56 },
  { ticker: "MASTERSHOT", name: "MasterShot", price: 1689.25, dayChange: 12.30, dayChangePercent: 0.73 },
  { ticker: "ERUDITE", name: "Erudite", price: 1578.90, dayChange: 18.75, dayChangePercent: 1.20 },
];

// ─── Top Movers ─────────────────────────────────────────
export interface MoverStock {
  ticker: string;
  name: string;
  price: number;
  dayChangePercent: number;
  volume: string;
  sparkline: number[];
}

export const topGainers: MoverStock[] = [
  { ticker: "CELESTE", name: "Celeste", price: 1645.30, dayChangePercent: 1.79, volume: "9.2M", sparkline: [1610, 1620, 1625, 1635, 1640, 1644, 1645] },
  { ticker: "GASMONKEYS", name: "Gas Monkeys", price: 1578.90, dayChangePercent: 1.20, volume: "12.4M", sparkline: [1550, 1555, 1560, 1570, 1575, 1578, 1578] },
  { ticker: "MATHSOC", name: "Math Society", price: 2892.45, dayChangePercent: 1.20, volume: "15.8M", sparkline: [2820, 2845, 2830, 2860, 2875, 2890, 2892] },
  { ticker: "INSIGHT", name: "Insight", price: 468.55, dayChangePercent: 1.18, volume: "22.1M", sparkline: [460, 462, 464, 465, 467, 468, 468] },
  { ticker: "MASTERSHOT", name: "MasterShot", price: 1689.25, dayChangePercent: 0.73, volume: "8.5M", sparkline: [1670, 1675, 1680, 1682, 1685, 1688, 1689] },
];

export const topLosers: MoverStock[] = [
  { ticker: "ERUDITE", name: "Erudite", price: 1087.40, dayChangePercent: -0.78, volume: "14.3M", sparkline: [1095, 1092, 1090, 1088, 1086, 1087, 1087] },
  { ticker: "ENIGMA", name: "Enigma Computer Science", price: 3987.60, dayChangePercent: -0.56, volume: "7.8M", sparkline: [4010, 3995, 3980, 3990, 3985, 3988, 3987] },
];

export const volumeShockers: MoverStock[] = [
  { ticker: "MATHSOC", name: "Math Society", price: 2892.45, dayChangePercent: 1.20, volume: "15.8M", sparkline: [2820, 2845, 2830, 2860, 2875, 2890, 2892] },
  { ticker: "GASMONKEYS", name: "Gas Monkeys", price: 1578.90, dayChangePercent: 1.20, volume: "12.4M", sparkline: [1550, 1555, 1560, 1570, 1575, 1578, 1578] },
  { ticker: "ENIGMA", name: "Enigma Computer Science", price: 3987.60, dayChangePercent: -0.56, volume: "11.2M", sparkline: [4010, 3995, 3980, 3990, 3985, 3988, 3987] },
  { ticker: "CELESTE", name: "Celeste", price: 1645.30, dayChangePercent: 1.79, volume: "9.2M", sparkline: [1610, 1620, 1625, 1635, 1640, 1644, 1645] },
  { ticker: "INSIGHT", name: "Insight", price: 468.55, dayChangePercent: 1.18, volume: "8.5M", sparkline: [460, 462, 464, 465, 467, 468, 468] },
];

// ─── Products & Tools ───────────────────────────────────
export const productsAndTools = [
  { label: "IPO", icon: "target" },
  { label: "BONDS", icon: "landmark" },
  { label: "ETFs", icon: "layers" },
  { label: "INTRADAY SCREENER", icon: "scan" },
  { label: "STOCKS SIP", icon: "repeat" },
  { label: "MTF STOCKS", icon: "trending-up" },
  { label: "EVENTS CALENDAR", icon: "calendar" },
];

// ─── Ticker Tape Data ───────────────────────────────────
export const tickerTapeItems = [
  ...holdings.map(h => ({ ticker: h.ticker, price: h.currentPrice, changePercent: h.dayChangePercent })),
  ...watchlist.map(w => ({ ticker: w.ticker, price: w.price, changePercent: w.dayChangePercent })),
];

// ─── User Profile ───────────────────────────────────────
export const userProfile = {
  name: "Deepak Aeleni",
  email: "aeleni@mcse.in",
  balance: 693.69,
  joined: "Mar 2024",
  phone: "+91 98765 43210",
  kycStatus: "VERIFIED",
};

// ─── Portfolio Analysis ─────────────────────────────────
export const portfolioAnalysis = {
  currentValue: 487693.69,
  investedValue: 421500.0,
  totalReturns: 66193.69,
  totalReturnsPercent: 15.71,
  xirr: 13.29,
  benchmarkName: "AEON 50",
  benchmarkReturn: 2.40,
  outperformance: 10.89,
  performanceChart: [
    { month: "Apr", portfolio: 421500, benchmark: 421500 },
    { month: "May", portfolio: 428200, benchmark: 423800 },
    { month: "Jun", portfolio: 435800, benchmark: 425100 },
    { month: "Jul", portfolio: 441200, benchmark: 428200 },
    { month: "Aug", portfolio: 438600, benchmark: 426900 },
    { month: "Sep", portfolio: 449800, benchmark: 429300 },
    { month: "Oct", portfolio: 458900, benchmark: 431200 },
    { month: "Nov", portfolio: 465200, benchmark: 428700 },
    { month: "Dec", portfolio: 472100, benchmark: 430100 },
    { month: "Jan", portfolio: 478800, benchmark: 429800 },
    { month: "Feb", portfolio: 482400, benchmark: 431500 },
    { month: "Mar", portfolio: 487693, benchmark: 431600 },
  ],
};

// ─── News Items ─────────────────────────────────────────
export interface NewsItem {
  ticker: string;
  name: string;
  headline: string;
  time: string;
  price: number;
  dayChange: number;
  dayChangePercent: number;
}

export const newsItems: NewsItem[] = [
  {
    ticker: "MATHSOC",
    name: "Math Society",
    headline: "Math Society announces annual inter-college competition with record participation expected from 45+ colleges. Prize pool increased to \u20B950,000.",
    time: "6 minutes ago",
    price: 2892.45,
    dayChange: 34.20,
    dayChangePercent: 1.20,
  },
  {
    ticker: "ENIGMA",
    name: "Enigma CS",
    headline: "Enigma Computer Science clarifies recent membership surge is organic. Club confirms no pending restructuring plans for the upcoming semester.",
    time: "7 minutes ago",
    price: 3987.60,
    dayChange: -22.40,
    dayChangePercent: -0.56,
  },
  {
    ticker: "GASMONKEYS",
    name: "Gas Monkeys",
    headline: "Gas Monkeys secures sponsorship deal with leading automotive brand for their flagship racing event this April.",
    time: "12 minutes ago",
    price: 1578.90,
    dayChange: 18.75,
    dayChangePercent: 1.20,
  },
  {
    ticker: "CELESTE",
    name: "Celeste",
    headline: "Celeste astronomy club to host public telescope viewing event. Expected to attract 500+ attendees this weekend.",
    time: "18 minutes ago",
    price: 1645.30,
    dayChange: 28.90,
    dayChangePercent: 1.79,
  },
];

// ─── Trading Screens ────────────────────────────────────
export interface TradingScreen {
  signal: "Bullish" | "Bearish";
  label: string;
  sparkline: number[];
}

export const tradingScreens: TradingScreen[] = [
  { signal: "Bullish", label: "Resistance breakouts", sparkline: [40, 42, 41, 45, 48, 52, 55] },
  { signal: "Bullish", label: "MACD above signal line", sparkline: [30, 32, 35, 38, 42, 45, 50] },
  { signal: "Bearish", label: "RSI overbought", sparkline: [60, 58, 55, 52, 48, 45, 42] },
  { signal: "Bullish", label: "RSI oversold", sparkline: [35, 38, 42, 40, 44, 48, 52] },
];

// ─── Stock Directory (lookup any ticker) ────────────────
export interface StockFundamentals {
  marketCap: string;
  pe: number;
  eps: number;
  bookValue: number;
  dividendYield: number;
  roe: number;
  debtToEquity: number;
  w52High: number;
  w52Low: number;
  volume: string;
  avgVolume: string;
  sector: string;
}

export interface StockInfo {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  chartData: Record<string, { day: string; price: number }[]>;
  overview: { open: number; dayLow: number; dayHigh: number };
  fundamentals: StockFundamentals;
}

function generateChartData(basePrice: number): Record<string, { day: string; price: number }[]> {
  const rng = (p: number, pct: number) => +(p * (1 + (Math.random() - 0.5) * pct)).toFixed(2);
  return {
    "1D": [
      { day: "9:15", price: rng(basePrice, 0.02) },
      { day: "10:00", price: rng(basePrice, 0.02) },
      { day: "11:00", price: rng(basePrice, 0.03) },
      { day: "12:00", price: rng(basePrice, 0.02) },
      { day: "13:00", price: rng(basePrice, 0.02) },
      { day: "14:00", price: rng(basePrice, 0.01) },
      { day: "15:30", price: basePrice },
    ],
    "1W": [
      { day: "Mon", price: rng(basePrice, 0.06) },
      { day: "Tue", price: rng(basePrice, 0.05) },
      { day: "Wed", price: rng(basePrice, 0.04) },
      { day: "Thu", price: rng(basePrice, 0.05) },
      { day: "Fri", price: rng(basePrice, 0.03) },
    ],
    "1M": [
      { day: "W1", price: rng(basePrice, 0.1) },
      { day: "W2", price: rng(basePrice, 0.08) },
      { day: "W3", price: rng(basePrice, 0.05) },
      { day: "W4", price: basePrice },
    ],
    "1Y": [
      { day: "Jan", price: rng(basePrice, 0.3) },
      { day: "Mar", price: rng(basePrice, 0.25) },
      { day: "May", price: rng(basePrice, 0.2) },
      { day: "Jul", price: rng(basePrice, 0.15) },
      { day: "Sep", price: rng(basePrice, 0.1) },
      { day: "Nov", price: rng(basePrice, 0.05) },
      { day: "Dec", price: basePrice },
    ],
    ALL: [
      { day: "2020", price: rng(basePrice, 0.6) },
      { day: "2021", price: rng(basePrice, 0.4) },
      { day: "2022", price: rng(basePrice, 0.35) },
      { day: "2023", price: rng(basePrice, 0.2) },
      { day: "2024", price: rng(basePrice, 0.1) },
      { day: "2025", price: basePrice },
    ],
  };
}

const allStocksRaw = [
  { ticker: "MATHSOC", name: "Math Society", price: 2892.45, changePercent: 1.20 },
  { ticker: "ENIGMA", name: "Enigma Computer Science", price: 3987.60, changePercent: -0.56 },
  { ticker: "GASMONKEYS", name: "Gas Monkeys", price: 1578.90, changePercent: 1.20 },
  { ticker: "MASTERSHOT", name: "MasterShot", price: 1689.25, changePercent: 0.73 },
  { ticker: "ERUDITE", name: "Erudite", price: 1087.40, changePercent: -0.78 },
  { ticker: "INSIGHT", name: "Insight", price: 468.55, changePercent: 1.18 },
  { ticker: "CELESTE", name: "Celeste", price: 1645.30, changePercent: 1.79 },
];

const stockFundamentals: Record<string, StockFundamentals> = {
  MATHSOC: { marketCap: "14.5Cr", pe: 28.4, eps: 101.84, bookValue: 1820.0, dividendYield: 0.8, roe: 18.2, debtToEquity: 0.12, w52High: 3120.0, w52Low: 1950.0, volume: "15.8M", avgVolume: "12.1M", sector: "Education" },
  ENIGMA: { marketCap: "19.9Cr", pe: 34.2, eps: 116.60, bookValue: 2540.0, dividendYield: 0.0, roe: 22.5, debtToEquity: 0.08, w52High: 4250.0, w52Low: 2680.0, volume: "7.8M", avgVolume: "9.3M", sector: "Technology" },
  GASMONKEYS: { marketCap: "7.9Cr", pe: 15.8, eps: 99.93, bookValue: 980.0, dividendYield: 1.2, roe: 14.6, debtToEquity: 0.35, w52High: 1820.0, w52Low: 1020.0, volume: "12.4M", avgVolume: "10.8M", sector: "Automotive" },
  MASTERSHOT: { marketCap: "8.4Cr", pe: 22.1, eps: 76.44, bookValue: 1120.0, dividendYield: 0.5, roe: 16.8, debtToEquity: 0.18, w52High: 1890.0, w52Low: 1150.0, volume: "8.5M", avgVolume: "7.2M", sector: "Media & Entertainment" },
  ERUDITE: { marketCap: "5.4Cr", pe: 19.6, eps: 55.48, bookValue: 720.0, dividendYield: 1.5, roe: 20.1, debtToEquity: 0.05, w52High: 1240.0, w52Low: 680.0, volume: "14.3M", avgVolume: "11.5M", sector: "Education" },
  INSIGHT: { marketCap: "2.3Cr", pe: 12.4, eps: 37.79, bookValue: 310.0, dividendYield: 2.0, roe: 24.3, debtToEquity: 0.02, w52High: 520.0, w52Low: 290.0, volume: "22.1M", avgVolume: "18.4M", sector: "Analytics" },
  CELESTE: { marketCap: "8.2Cr", pe: 31.5, eps: 52.23, bookValue: 1050.0, dividendYield: 0.3, roe: 15.4, debtToEquity: 0.15, w52High: 1780.0, w52Low: 980.0, volume: "9.2M", avgVolume: "7.6M", sector: "Science & Research" },
};

export const stockDirectory: Record<string, StockInfo> = {};
for (const s of allStocksRaw) {
  stockDirectory[s.ticker] = {
    ...s,
    chartData: generateChartData(s.price),
    overview: { open: s.price, dayLow: +(s.price * 0.985).toFixed(2), dayHigh: +(s.price * 1.012).toFixed(2) },
    fundamentals: stockFundamentals[s.ticker],
  };
}
