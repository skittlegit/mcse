import { NextResponse, type NextRequest } from "next/server";
import { convexServerClient } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";
import { authenticate } from "@/lib/serverAuth";

export async function GET(req: NextRequest) {
  const investor = await authenticate(req);
  if (!investor) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const convex = convexServerClient();
  const orders = await convex.query(api.trading.getOrders, {
    tokenHash: investor.tokenHash,
    // Active traders blow past the old 100 cap fast. 500 covers a heavy
    // event session per investor; older entries fall off the tail.
    limit: 500,
  });
  if (!orders) return NextResponse.json([]);

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      ticker: o.ticker,
      name: o.stockName,
      type: o.side,
      order_type: o.orderType,
      pricing_type: o.pricingType,
      qty: o.quantity,
      price: o.price,
      total: o.total,
      status: o.status,
      timestamp: o.timestamp,
    })),
  );
}

export async function POST(req: NextRequest) {
  const investor = await authenticate(req);
  if (!investor) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ticker = typeof body.ticker === "string" ? body.ticker : "";
  const side = body.side === "SELL" ? "SELL" : "BUY";
  const orderType = "DELIVERY" as const;
  const pricingType = body.pricing_type === "LIMIT" ? "LIMIT" : "MARKET";
  const quantity = Number(body.qty || body.quantity || 0);
  const limitPrice = body.limit_price != null ? Number(body.limit_price) : undefined;

  const convex = convexServerClient();
  const result = await convex.mutation(api.trading.placeOrder, {
    tokenHash: investor.tokenHash,
    ticker,
    side,
    orderType,
    pricingType,
    quantity,
    limitPrice,
  });

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function DELETE(req: NextRequest) {
  const investor = await authenticate(req);
  if (!investor) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const orderId = typeof body.id === "string" ? body.id : "";
  if (!orderId) {
    return NextResponse.json({ success: false, message: "order id required" }, { status: 400 });
  }

  const convex = convexServerClient();
  const result = await convex.mutation(api.trading.cancelOrder, {
    tokenHash: investor.tokenHash,
    orderId: orderId as never,
  });
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
