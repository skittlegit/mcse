"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

export interface WSMessage {
  type: string;
  payload: unknown;
  timestamp: string;
}

export interface MarketTickData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  bid: number;
  ask: number;
  book?: { bids: [number, number][]; asks: [number, number][] };
}

export interface DayTickUpdate {
  dayNumber: number;
  dayTickCounter: number;
  ticksPerDay: number;
  marketOpen: boolean;
}

export interface NotificationPush {
  notificationId: string;
  kind: string;
  title: string;
  body: string;
  relatedTicker: string | null;
}

interface WebSocketState {
  status: WebSocketStatus;
  lastMessage: WSMessage | null;
  marketTicks: Record<string, MarketTickData>;
  dayTick: DayTickUpdate | null;
  notifications: NotificationPush[];
  unreadCount: number;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  send: (message: object) => void;
  clearNotification: (id: string) => void;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const WebSocketContext = createContext<WebSocketState>({
  status: "disconnected",
  lastMessage: null,
  marketTicks: {},
  dayTick: null,
  notifications: [],
  unreadCount: 0,
  subscribe: () => {},
  unsubscribe: () => {},
  send: () => {},
  clearNotification: () => {},
});

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || "";

// ─── Provider ──────────────────────────────────────────────────────────────────

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [marketTicks, setMarketTicks] = useState<Record<string, MarketTickData>>({});
  // Starts null — populated only by real "admin:day" messages from the WS.
  // Consumers should treat null as "no realtime tick info yet".
  const [dayTick, setDayTick] = useState<DayTickUpdate | null>(null);
  const [notifications, setNotifications] = useState<NotificationPush[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const connectRef = useRef<() => Promise<void>>(undefined);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!WS_BASE_URL) {
      // No realtime backend configured — pages fall back to REST polling
      // (TradingContext refreshes every 15 s, stock pages every 5 s).
      setStatus("disconnected");
      return;
    }

    // Real WebSocket connection
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    // /stream/market is public; do not attach authentication tokens to the URL
    const ws = new WebSocket(`${WS_BASE_URL}/stream/market`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      // Re-subscribe to channels after reconnect
      subscriptionsRef.current.forEach((channel) => {
        ws.send(JSON.stringify({ type: "subscribe", channel }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as Record<string, unknown> & { type: string };
        setLastMessage({ type: message.type, payload: message, timestamp: new Date().toISOString() });

        // Route message to appropriate state
        switch (message.type) {
          case "PRICES_UPDATE": {
            const prices = (message.prices as { ticker: string; price: number }[]) ?? [];
            const orderbooks = (message.orderbooks as { ticker: string; book: { bids: [number, number][]; asks: [number, number][] } }[]) ?? [];
            const orderbooksByTicker = new Map(orderbooks.map((ob) => [ob.ticker, ob]));
            const newTicks: Record<string, MarketTickData> = {};
            for (const p of prices) {
              const book = orderbooksByTicker.get(p.ticker)?.book;
              newTicks[p.ticker] = {
                ticker: p.ticker,
                price: p.price,
                change: 0,
                changePercent: 0,
                volume: 0,
                bid: book?.bids?.[0]?.[0] ?? p.price,
                ask: book?.asks?.[0]?.[0] ?? p.price,
                book,
              };
            }
            setMarketTicks((prev) => ({ ...prev, ...newTicks }));
            break;
          }

          case "market:tick": {
            const tickData = message as unknown as MarketTickData;
            setMarketTicks((prev) => ({ ...prev, [tickData.ticker]: tickData }));
            break;
          }

          case "admin:day":
            setDayTick(message as unknown as DayTickUpdate);
            break;

          case "notification": {
            const notif = message as unknown as NotificationPush;
            setNotifications((prev) => [notif, ...prev.slice(0, 49)]);
            setUnreadCount((prev) => prev + 1);
            break;
          }

          default:
            // Unknown message type - log in dev
            if (process.env.NODE_ENV === "development") {
              console.log("[WS] Unknown message type:", message.type);
            }
        }
      } catch (err) {
        console.error("[WS] Parse error:", err);
      }
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = () => {
      setStatus("disconnected");
      wsRef.current = null;

      // Attempt reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => connectRef.current?.(), 5000);
    };
  }, []);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  // Subscribe to a channel
  const subscribe = useCallback((channel: string) => {
    subscriptionsRef.current.add(channel);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "subscribe", channel }));
    }
  }, []);

  // Unsubscribe from a channel
  const unsubscribe = useCallback((channel: string) => {
    subscriptionsRef.current.delete(channel);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "unsubscribe", channel }));
    }
  }, []);

  // Send a message
  const send = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Clear a notification
  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    // Defer to avoid synchronous setState in effect body
    const id = requestAnimationFrame(() => connect());
    return () => {
      cancelAnimationFrame(id);
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <WebSocketContext.Provider
      value={{
        status,
        lastMessage,
        marketTicks,
        dayTick,
        notifications,
        unreadCount,
        subscribe,
        unsubscribe,
        send,
        clearNotification,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useWebSocket() {
  return useContext(WebSocketContext);
}

// Convenience hook for subscribing to market data
export function useMarketTick(ticker: string): MarketTickData | null {
  const { marketTicks, subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    subscribe(`market:${ticker}`);
    return () => unsubscribe(`market:${ticker}`);
  }, [ticker, subscribe, unsubscribe]);

  return marketTicks[ticker] || null;
}

// Convenience hook for day/tick counter
export function useDayTick(): DayTickUpdate | null {
  const { dayTick, subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    subscribe("admin:day");
    return () => unsubscribe("admin:day");
  }, [subscribe, unsubscribe]);

  return dayTick;
}

// Convenience hook for notifications
export function useNotifications() {
  const { notifications, unreadCount, clearNotification, subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    subscribe("user:notifications");
    return () => unsubscribe("user:notifications");
  }, [subscribe, unsubscribe]);

  return { notifications, unreadCount, clearNotification };
}
