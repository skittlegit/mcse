// ─── Portfolio ───────────────────────────────────────────
export const portfolio = {
  value: 15136.32,
  changePercent: 2.11,
  history: [
    { date: "Jan", value: 12400 },
    { date: "Feb", value: 12800 },
    { date: "Mar", value: 13100 },
    { date: "Apr", value: 12900 },
    { date: "May", value: 13600 },
    { date: "Jun", value: 14200 },
    { date: "Jul", value: 14500 },
    { date: "Aug", value: 14100 },
    { date: "Sep", value: 14800 },
    { date: "Oct", value: 15136 },
  ],
};

// ─── Watchlist ──────────────────────────────────────────
export interface WatchlistStock {
  ticker: string;
  name: string;
  price: number;
  refPrice: number;
  changePercent: number;
  color: string;
  sparkline: { v: number }[];
}

export const watchlist: WatchlistStock[] = [
  {
    ticker: "ADB",
    name: "Adobe Inc",
    price: 643.58,
    refPrice: 620.0,
    changePercent: 5.49,
    color: "#FF3E5B",
    sparkline: [
      { v: 600 },
      { v: 610 },
      { v: 605 },
      { v: 625 },
      { v: 630 },
      { v: 640 },
      { v: 643 },
    ],
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc",
    price: 909.68,
    refPrice: 890.25,
    changePercent: 2.18,
    color: "#E31937",
    sparkline: [
      { v: 870 },
      { v: 880 },
      { v: 875 },
      { v: 895 },
      { v: 900 },
      { v: 905 },
      { v: 909 },
    ],
  },
  {
    ticker: "NVDA",
    name: "Nvidia Corp",
    price: 227.26,
    refPrice: 221.0,
    changePercent: 3.14,
    color: "#76B900",
    sparkline: [
      { v: 215 },
      { v: 218 },
      { v: 220 },
      { v: 219 },
      { v: 223 },
      { v: 225 },
      { v: 227 },
    ],
  },
];

// ─── Stocks Activity ────────────────────────────────────
export interface StockActivity {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  totalValue: number;
  shares: number;
  color: string;
}

export const stocksActivity: StockActivity[] = [
  {
    ticker: "NVDA",
    name: "Nvidia Corp",
    price: 25.94,
    changePercent: 0.14,
    totalValue: 227.26,
    shares: 10,
    color: "#76B900",
  },
  {
    ticker: "ADB",
    name: "Adobe Inc",
    price: 33.49,
    changePercent: 5.49,
    totalValue: 643.58,
    shares: 20,
    color: "#FF3E5B",
  },
  {
    ticker: "APPL",
    name: "Apple Inc",
    price: 29.88,
    changePercent: -1.82,
    totalValue: 1114.9,
    shares: 27,
    color: "#A2AAAD",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp",
    price: 42.15,
    changePercent: 1.23,
    totalValue: 842.96,
    shares: 20,
    color: "#00A4EF",
  },
  {
    ticker: "GOOG",
    name: "Alphabet Inc",
    price: 138.21,
    changePercent: -0.65,
    totalValue: 1382.1,
    shares: 10,
    color: "#4285F4",
  },
];

// ─── TSLA Chart Data (per time range) ───────────────────
export const tslaChartData: Record<string, { day: string; price: number }[]> = {
  "1D": [
    { day: "9AM", price: 902 },
    { day: "10AM", price: 905 },
    { day: "11AM", price: 900 },
    { day: "12PM", price: 908 },
    { day: "1PM", price: 906 },
    { day: "2PM", price: 910 },
    { day: "3PM", price: 909 },
  ],
  "1W": [
    { day: "Sun", price: 870 },
    { day: "Mon", price: 885 },
    { day: "Tue", price: 890 },
    { day: "Wed", price: 878 },
    { day: "Thu", price: 675.75 },
    { day: "Fri", price: 895 },
    { day: "Sat", price: 909.68 },
  ],
  "1M": [
    { day: "W1", price: 820 },
    { day: "W2", price: 855 },
    { day: "W3", price: 840 },
    { day: "W4", price: 909 },
  ],
  "1Y": [
    { day: "Jan", price: 700 },
    { day: "Mar", price: 650 },
    { day: "May", price: 720 },
    { day: "Jul", price: 680 },
    { day: "Sep", price: 800 },
    { day: "Nov", price: 870 },
    { day: "Dec", price: 909 },
  ],
  ALL: [
    { day: "2020", price: 120 },
    { day: "2021", price: 400 },
    { day: "2022", price: 300 },
    { day: "2023", price: 250 },
    { day: "2024", price: 600 },
    { day: "2025", price: 909 },
  ],
};

export const tslaOverview = {
  open: 909.68,
  dayLow: 902.11,
  dayHigh: 910.18,
};

// ─── Market Indices ─────────────────────────────────────
export interface MarketIndex {
  name: string;
  value: number;
  changePercent: number;
  variant: "light" | "dark";
  sparkline: { v: number }[];
}

export const marketIndices: MarketIndex[] = [
  {
    name: "Dow Jones",
    value: 35819.56,
    changePercent: 0.25,
    variant: "light",
    sparkline: [
      { v: 35500 },
      { v: 35600 },
      { v: 35550 },
      { v: 35700 },
      { v: 35750 },
      { v: 35800 },
      { v: 35819 },
    ],
  },
  {
    name: "S&P 500",
    value: 4605.38,
    changePercent: 0.19,
    variant: "dark",
    sparkline: [
      { v: 4560 },
      { v: 4570 },
      { v: 4565 },
      { v: 4580 },
      { v: 4590 },
      { v: 4600 },
      { v: 4605 },
    ],
  },
  {
    name: "NASDAQ",
    value: 15498.39,
    changePercent: 0.42,
    variant: "light",
    sparkline: [
      { v: 15300 },
      { v: 15350 },
      { v: 15320 },
      { v: 15400 },
      { v: 15420 },
      { v: 15480 },
      { v: 15498 },
    ],
  },
  {
    name: "Russell 2000",
    value: 2287.98,
    changePercent: -0.12,
    variant: "dark",
    sparkline: [
      { v: 2300 },
      { v: 2295 },
      { v: 2290 },
      { v: 2292 },
      { v: 2289 },
      { v: 2288 },
      { v: 2287 },
    ],
  },
];

// ─── Market Movers ──────────────────────────────────────
export const marketMovers: StockActivity[] = [
  {
    ticker: "NVDA",
    name: "Nvidia Corp",
    price: 25.94,
    changePercent: 0.14,
    totalValue: 227.26,
    shares: 10,
    color: "#76B900",
  },
  {
    ticker: "ADB",
    name: "Adobe Inc",
    price: 33.49,
    changePercent: 5.49,
    totalValue: 643.58,
    shares: 20,
    color: "#FF3E5B",
  },
  {
    ticker: "APPL",
    name: "Apple Inc",
    price: 29.88,
    changePercent: -1.82,
    totalValue: 1114.9,
    shares: 27,
    color: "#A2AAAD",
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc",
    price: 19.43,
    changePercent: 1.75,
    totalValue: 909.68,
    shares: 15,
    color: "#E31937",
  },
  {
    ticker: "AMZN",
    name: "Amazon.com",
    price: 45.12,
    changePercent: 2.34,
    totalValue: 3158.4,
    shares: 70,
    color: "#FF9900",
  },
];

// ─── Stock Directory (lookup any ticker) ────────────────
export interface StockInfo {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  color: string;
  chartData: Record<string, { day: string; price: number }[]>;
  overview: { open: number; dayLow: number; dayHigh: number };
}

function generateChartData(basePrice: number): Record<string, { day: string; price: number }[]> {
  const rng = (p: number, pct: number) => +(p * (1 + (Math.random() - 0.5) * pct)).toFixed(2);
  return {
    "1D": [
      { day: "9AM", price: rng(basePrice, 0.02) },
      { day: "10AM", price: rng(basePrice, 0.02) },
      { day: "11AM", price: rng(basePrice, 0.03) },
      { day: "12PM", price: rng(basePrice, 0.02) },
      { day: "1PM", price: rng(basePrice, 0.02) },
      { day: "2PM", price: rng(basePrice, 0.01) },
      { day: "3PM", price: basePrice },
    ],
    "1W": [
      { day: "Sun", price: rng(basePrice, 0.06) },
      { day: "Mon", price: rng(basePrice, 0.05) },
      { day: "Tue", price: rng(basePrice, 0.04) },
      { day: "Wed", price: rng(basePrice, 0.05) },
      { day: "Thu", price: rng(basePrice, 0.03) },
      { day: "Fri", price: rng(basePrice, 0.02) },
      { day: "Sat", price: basePrice },
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
  { ticker: "TSLA", name: "Tesla Inc", price: 909.68, changePercent: 2.18, color: "#E31937" },
  { ticker: "ADB", name: "Adobe Inc", price: 643.58, changePercent: 5.49, color: "#FF3E5B" },
  { ticker: "NVDA", name: "Nvidia Corp", price: 227.26, changePercent: 0.14, color: "#76B900" },
  { ticker: "APPL", name: "Apple Inc", price: 1114.9, changePercent: -1.82, color: "#A2AAAD" },
  { ticker: "MSFT", name: "Microsoft Corp", price: 842.96, changePercent: 1.23, color: "#00A4EF" },
  { ticker: "GOOG", name: "Alphabet Inc", price: 1382.1, changePercent: -0.65, color: "#4285F4" },
  { ticker: "AMZN", name: "Amazon.com", price: 3158.4, changePercent: 2.34, color: "#FF9900" },
];

export const stockDirectory: Record<string, StockInfo> = {};
for (const s of allStocksRaw) {
  stockDirectory[s.ticker] = {
    ...s,
    chartData: s.ticker === "TSLA" ? tslaChartData : generateChartData(s.price),
    overview: s.ticker === "TSLA"
      ? tslaOverview
      : { open: s.price, dayLow: +(s.price * 0.99).toFixed(2), dayHigh: +(s.price * 1.01).toFixed(2) },
  };
}
