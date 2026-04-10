"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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

interface TradingState {
  orders: Order[];
  balance: number;
  placeOrder: (order: Omit<Order, "id" | "status" | "timestamp" | "total">) => { success: boolean; message: string };
  getOrdersForTicker: (ticker: string) => Order[];
  getBuyCount: (ticker?: string) => number;
  getSellCount: (ticker?: string) => number;
}

const TradingContext = createContext<TradingState>({
  orders: [],
  balance: 693.69,
  placeOrder: () => ({ success: false, message: "" }),
  getOrdersForTicker: () => [],
  getBuyCount: () => 0,
  getSellCount: () => 0,
});

export function TradingProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [balance, setBalance] = useState(693.69);

  const placeOrder = useCallback((orderInput: Omit<Order, "id" | "status" | "timestamp" | "total">) => {
    const total = orderInput.price * orderInput.qty;

    if (orderInput.type === "BUY" && total > balance) {
      return { success: false, message: `Insufficient balance. Need ₹${total.toLocaleString("en-IN")} but have ₹${balance.toLocaleString("en-IN")}` };
    }

    const newOrder: Order = {
      ...orderInput,
      id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      total,
      status: "COMPLETED",
      timestamp: Date.now(),
    };

    setOrders(prev => [newOrder, ...prev]);

    if (orderInput.type === "BUY") {
      setBalance(prev => +(prev - total).toFixed(2));
    } else {
      setBalance(prev => +(prev + total).toFixed(2));
    }

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
    <TradingContext.Provider value={{ orders, balance, placeOrder, getOrdersForTicker, getBuyCount, getSellCount }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  return useContext(TradingContext);
}
