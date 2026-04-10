"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

export interface Order {
  id: string;
  ticker: string;
  name: string;
  type: "BUY" | "SELL";
  orderType: "DELIVERY" | "INTRADAY";
  qty: number;
  price: number;
  total: number;
  status: "COMPLETED" | "PENDING" | "CANCELLED";
  timestamp: number;
}

export interface Position {
  ticker: string;
  name: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface Transaction {
  id: string;
  type: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAWAL";
  ticker?: string;
  name?: string;
  qty?: number;
  price?: number;
  amount: number;
  balance: number;
  timestamp: number;
  description: string;
}

interface TradingState {
  orders: Order[];
  positions: Position[];
  transactions: Transaction[];
  balance: number;
  placeOrder: (order: Omit<Order, "id" | "status" | "timestamp" | "total">) => { success: boolean; message: string };
  getOrdersForTicker: (ticker: string) => Order[];
  getBuyCount: (ticker?: string) => number;
  getSellCount: (ticker?: string) => number;
}

const INITIAL_BALANCE = 693.69;

const MOCK_ORDERS: Order[] = [
  { id: "ORD-001", ticker: "MATHSOC", name: "Math Society", type: "BUY", orderType: "DELIVERY", qty: 5, price: 2840.00, total: 14200.00, status: "COMPLETED", timestamp: Date.now() - 86400000 * 3 },
  { id: "ORD-002", ticker: "ENIGMA", name: "Enigma Computer Science", type: "BUY", orderType: "DELIVERY", qty: 3, price: 3920.50, total: 11761.50, status: "COMPLETED", timestamp: Date.now() - 86400000 * 2 },
  { id: "ORD-003", ticker: "CELESTE", name: "Celeste", type: "BUY", orderType: "INTRADAY", qty: 10, price: 1610.00, total: 16100.00, status: "COMPLETED", timestamp: Date.now() - 86400000 },
  { id: "ORD-004", ticker: "MATHSOC", name: "Math Society", type: "SELL", orderType: "DELIVERY", qty: 2, price: 2892.45, total: 5784.90, status: "COMPLETED", timestamp: Date.now() - 43200000 },
  { id: "ORD-005", ticker: "GASMONKEYS", name: "Gas Monkeys", type: "BUY", orderType: "DELIVERY", qty: 8, price: 1560.00, total: 12480.00, status: "COMPLETED", timestamp: Date.now() - 21600000 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "TXN-001", type: "DEPOSIT", amount: 50000, balance: 50693.69, timestamp: Date.now() - 86400000 * 5, description: "Initial deposit" },
  { id: "TXN-002", type: "BUY", ticker: "MATHSOC", name: "Math Society", qty: 5, price: 2840.00, amount: -14200.00, balance: 36493.69, timestamp: Date.now() - 86400000 * 3, description: "Bought 5 MATHSOC @ \u20B92,840.00" },
  { id: "TXN-003", type: "BUY", ticker: "ENIGMA", name: "Enigma Computer Science", qty: 3, price: 3920.50, amount: -11761.50, balance: 24732.19, timestamp: Date.now() - 86400000 * 2, description: "Bought 3 ENIGMA @ \u20B93,920.50" },
  { id: "TXN-004", type: "BUY", ticker: "CELESTE", name: "Celeste", qty: 10, price: 1610.00, amount: -16100.00, balance: 8632.19, timestamp: Date.now() - 86400000, description: "Bought 10 CELESTE @ \u20B91,610.00" },
  { id: "TXN-005", type: "SELL", ticker: "MATHSOC", name: "Math Society", qty: 2, price: 2892.45, amount: 5784.90, balance: 14417.09, timestamp: Date.now() - 43200000, description: "Sold 2 MATHSOC @ \u20B92,892.45" },
  { id: "TXN-006", type: "BUY", ticker: "GASMONKEYS", name: "Gas Monkeys", qty: 8, price: 1560.00, amount: -12480.00, balance: 1937.09, timestamp: Date.now() - 21600000, description: "Bought 8 GASMONKEYS @ \u20B91,560.00" },
  { id: "TXN-007", type: "WITHDRAWAL", amount: -1243.40, balance: 693.69, timestamp: Date.now() - 7200000, description: "Withdrawal to bank" },
];

const TradingContext = createContext<TradingState>({
  orders: [],
  positions: [],
  transactions: [],
  balance: INITIAL_BALANCE,
  placeOrder: () => ({ success: false, message: "" }),
  getOrdersForTicker: () => [],
  getBuyCount: () => 0,
  getSellCount: () => 0,
});

export function TradingProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [balance, setBalance] = useState(INITIAL_BALANCE);

  // Derive positions from orders
  const positions = useMemo(() => {
    const posMap = new Map<string, { ticker: string; name: string; totalQty: number; totalCost: number }>();
    for (const order of orders) {
      if (order.status !== "COMPLETED") continue;
      const existing = posMap.get(order.ticker) || { ticker: order.ticker, name: order.name, totalQty: 0, totalCost: 0 };
      if (order.type === "BUY") {
        existing.totalCost += order.total;
        existing.totalQty += order.qty;
      } else {
        existing.totalCost -= order.price * order.qty;
        existing.totalQty -= order.qty;
      }
      posMap.set(order.ticker, existing);
    }
    const result: Position[] = [];
    for (const [, pos] of posMap) {
      if (pos.totalQty <= 0) continue;
      const avgPrice = pos.totalCost / pos.totalQty;
      // Use a simple mock current price (in real app, this comes from API)
      const currentPrices: Record<string, number> = {
        MATHSOC: 2892.45, ENIGMA: 3987.60, GASMONKEYS: 1578.90,
        MASTERSHOT: 1689.25, ERUDITE: 1087.40, INSIGHT: 468.55, CELESTE: 1645.30,
      };
      const currentPrice = currentPrices[pos.ticker] || avgPrice;
      const pnl = (currentPrice - avgPrice) * pos.totalQty;
      const pnlPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
      result.push({ ticker: pos.ticker, name: pos.name, qty: pos.totalQty, avgPrice, currentPrice, pnl, pnlPercent });
    }
    return result;
  }, [orders]);

  const placeOrder = useCallback((orderInput: Omit<Order, "id" | "status" | "timestamp" | "total">) => {
    const total = orderInput.price * orderInput.qty;

    if (orderInput.type === "BUY" && total > balance) {
      return { success: false, message: `Insufficient balance. Need \u20B9${Math.round(total).toLocaleString("en-IN")} but have \u20B9${Math.round(balance).toLocaleString("en-IN")}` };
    }

    const newOrder: Order = {
      ...orderInput,
      id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      total,
      status: "COMPLETED",
      timestamp: Date.now(),
    };

    const newBalance = orderInput.type === "BUY" ? +(balance - total).toFixed(2) : +(balance + total).toFixed(2);

    const newTxn: Transaction = {
      id: `TXN-${Date.now()}`,
      type: orderInput.type,
      ticker: orderInput.ticker,
      name: orderInput.name,
      qty: orderInput.qty,
      price: orderInput.price,
      amount: orderInput.type === "BUY" ? -total : total,
      balance: newBalance,
      timestamp: Date.now(),
      description: `${orderInput.type === "BUY" ? "Bought" : "Sold"} ${orderInput.qty} ${orderInput.ticker} @ \u20B9${orderInput.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    };

    setOrders(prev => [newOrder, ...prev]);
    setTransactions(prev => [newTxn, ...prev]);
    setBalance(newBalance);

    return { success: true, message: `${orderInput.type} order for ${orderInput.qty} ${orderInput.ticker} placed successfully` };
  }, [balance]);

  const getOrdersForTicker = useCallback((ticker: string) => {
    return orders.filter(o => o.ticker === ticker);
  }, [orders]);

  const getBuyCount = useCallback((ticker?: string) => {
    return orders.filter(o => o.type === "BUY" && (!ticker || o.ticker === ticker)).length;
  }, [orders]);

  const getSellCount = useCallback((ticker?: string) => {
    return orders.filter(o => o.type === "SELL" && (!ticker || o.ticker === ticker)).length;
  }, [orders]);

  return (
    <TradingContext.Provider value={{ orders, positions, transactions, balance, placeOrder, getOrdersForTicker, getBuyCount, getSellCount }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  return useContext(TradingContext);
}
