// ─── Indian Market Indices ───────────────────────────────
export interface IndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export const indices: IndexData[] = [
  { name: "NIFTY 50", value: 23519.35, change: 187.45, changePercent: 0.80 },
  { name: "SENSEX", value: 77478.93, change: 602.75, changePercent: 0.78 },
  { name: "BANKNIFTY", value: 50892.15, change: -123.40, changePercent: -0.24 },
  { name: "MIDCPNIFTY", value: 11245.60, change: 89.30, changePercent: 0.80 },
  { name: "FINNIFTY", value: 23412.80, change: 45.20, changePercent: 0.19 },
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
    ticker: "RELIANCE",
    name: "Reliance Industries",
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
    ticker: "TCS",
    name: "Tata Consultancy Services",
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
    ticker: "INFY",
    name: "Infosys Ltd",
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
    ticker: "HDFCBANK",
    name: "HDFC Bank Ltd",
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
    ticker: "ICICIBANK",
    name: "ICICI Bank Ltd",
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
    ticker: "ITC",
    name: "ITC Limited",
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
    ticker: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
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
    ticker: "TATAMOTORS",
    name: "Tata Motors Ltd",
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
    ticker: "WIPRO",
    name: "Wipro Limited",
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
    ticker: "SBIN",
    name: "State Bank of India",
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
    ticker: "ADANIENT",
    name: "Adani Enterprises",
    price: 2934.15,
    dayChange: -42.85,
    dayChangePercent: -1.44,
    volume: "5.6M",
    w52Low: 2100,
    w52High: 3450,
    sparkline: [2980, 2970, 2960, 2950, 2940, 2935, 2934],
  },
  {
    ticker: "BAJFINANCE",
    name: "Bajaj Finance Ltd",
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
    ticker: "SUNPHARMA",
    name: "Sun Pharmaceutical",
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
  { ticker: "RELIANCE", name: "Reliance Industries", price: 2892.45, dayChange: 34.20, dayChangePercent: 1.20 },
  { ticker: "TCS", name: "Tata Consultancy", price: 3987.60, dayChange: -22.40, dayChangePercent: -0.56 },
  { ticker: "HDFCBANK", name: "HDFC Bank Ltd", price: 1689.25, dayChange: 12.30, dayChangePercent: 0.73 },
  { ticker: "INFY", name: "Infosys Ltd", price: 1578.90, dayChange: 18.75, dayChangePercent: 1.20 },
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
  { ticker: "BHARTIARTL", name: "Bharti Airtel Ltd", price: 1645.30, dayChangePercent: 1.79, volume: "9.2M", sparkline: [1610, 1620, 1625, 1635, 1640, 1644, 1645] },
  { ticker: "TATAMOTORS", name: "Tata Motors Ltd", price: 972.40, dayChangePercent: 1.65, volume: "12.4M", sparkline: [950, 955, 960, 965, 968, 970, 972] },
  { ticker: "SUNPHARMA", name: "Sun Pharmaceutical", price: 1534.90, dayChangePercent: 1.46, volume: "4.8M", sparkline: [1510, 1515, 1520, 1525, 1530, 1533, 1534] },
  { ticker: "RELIANCE", name: "Reliance Industries", price: 2892.45, dayChangePercent: 1.20, volume: "15.8M", sparkline: [2820, 2845, 2830, 2860, 2875, 2890, 2892] },
  { ticker: "INFY", name: "Infosys Ltd", price: 1578.90, dayChangePercent: 1.20, volume: "11.2M", sparkline: [1550, 1555, 1560, 1570, 1575, 1578, 1578] },
  { ticker: "ITC", name: "ITC Limited", price: 468.55, dayChangePercent: 1.18, volume: "22.1M", sparkline: [460, 462, 464, 465, 467, 468, 468] },
];

export const topLosers: MoverStock[] = [
  { ticker: "ADANIENT", name: "Adani Enterprises", price: 2934.15, dayChangePercent: -1.44, volume: "5.6M", sparkline: [2980, 2970, 2960, 2950, 2940, 2935, 2934] },
  { ticker: "ICICIBANK", name: "ICICI Bank Ltd", price: 1087.40, dayChangePercent: -0.78, volume: "14.3M", sparkline: [1095, 1092, 1090, 1088, 1086, 1087, 1087] },
  { ticker: "WIPRO", name: "Wipro Limited", price: 487.25, dayChangePercent: -0.76, volume: "8.2M", sparkline: [492, 490, 489, 488, 487, 487, 487] },
  { ticker: "TCS", name: "Tata Consultancy", price: 3987.60, dayChangePercent: -0.56, volume: "7.8M", sparkline: [4010, 3995, 3980, 3990, 3985, 3988, 3987] },
  { ticker: "HCLTECH", name: "HCL Technologies", price: 1432.80, dayChangePercent: -0.42, volume: "6.1M", sparkline: [1440, 1438, 1436, 1434, 1433, 1432, 1432] },
];

export const volumeShockers: MoverStock[] = [
  { ticker: "ITC", name: "ITC Limited", price: 468.55, dayChangePercent: 1.18, volume: "22.1M", sparkline: [460, 462, 464, 465, 467, 468, 468] },
  { ticker: "SBIN", name: "State Bank of India", price: 812.60, dayChangePercent: 1.17, volume: "18.7M", sparkline: [800, 803, 806, 808, 810, 812, 812] },
  { ticker: "RELIANCE", name: "Reliance Industries", price: 2892.45, dayChangePercent: 1.20, volume: "15.8M", sparkline: [2820, 2845, 2830, 2860, 2875, 2890, 2892] },
  { ticker: "ICICIBANK", name: "ICICI Bank Ltd", price: 1087.40, dayChangePercent: -0.78, volume: "14.3M", sparkline: [1095, 1092, 1090, 1088, 1086, 1087, 1087] },
  { ticker: "TATAMOTORS", name: "Tata Motors Ltd", price: 972.40, dayChangePercent: 1.65, volume: "12.4M", sparkline: [950, 955, 960, 965, 968, 970, 972] },
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
  name: "AELENI JAMES",
  email: "aeleni@mcse.in",
  balance: 693.69,
};

// ─── Stock Directory (lookup any ticker) ────────────────
export interface StockInfo {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  chartData: Record<string, { day: string; price: number }[]>;
  overview: { open: number; dayLow: number; dayHigh: number };
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
  { ticker: "RELIANCE", name: "Reliance Industries", price: 2892.45, changePercent: 1.20 },
  { ticker: "TCS", name: "Tata Consultancy Services", price: 3987.60, changePercent: -0.56 },
  { ticker: "INFY", name: "Infosys Ltd", price: 1578.90, changePercent: 1.20 },
  { ticker: "HDFCBANK", name: "HDFC Bank Ltd", price: 1689.25, changePercent: 0.73 },
  { ticker: "ICICIBANK", name: "ICICI Bank Ltd", price: 1087.40, changePercent: -0.78 },
  { ticker: "ITC", name: "ITC Limited", price: 468.55, changePercent: 1.18 },
  { ticker: "BHARTIARTL", name: "Bharti Airtel Ltd", price: 1645.30, changePercent: 1.79 },
  { ticker: "TATAMOTORS", name: "Tata Motors Ltd", price: 972.40, changePercent: 1.65 },
  { ticker: "WIPRO", name: "Wipro Limited", price: 487.25, changePercent: -0.76 },
  { ticker: "SBIN", name: "State Bank of India", price: 812.60, changePercent: 1.17 },
  { ticker: "ADANIENT", name: "Adani Enterprises", price: 2934.15, changePercent: -1.44 },
  { ticker: "BAJFINANCE", name: "Bajaj Finance Ltd", price: 7245.80, changePercent: 0.81 },
  { ticker: "SUNPHARMA", name: "Sun Pharmaceutical", price: 1534.90, changePercent: 1.46 },
  { ticker: "HCLTECH", name: "HCL Technologies", price: 1432.80, changePercent: -0.42 },
];

export const stockDirectory: Record<string, StockInfo> = {};
for (const s of allStocksRaw) {
  stockDirectory[s.ticker] = {
    ...s,
    chartData: generateChartData(s.price),
    overview: { open: s.price, dayLow: +(s.price * 0.985).toFixed(2), dayHigh: +(s.price * 1.012).toFixed(2) },
  };
}
