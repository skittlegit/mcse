import { NextResponse, type NextRequest } from "next/server";
import { convexServerClient } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";

// Range → window in milliseconds. Anything older than (now − window) is
// dropped from the response. priceHistory is pruned to the last 200 rows
// per stock by the engine, so for ranges longer than ~50 min you'll get
// "everything available".
const WINDOW_MS: Record<string, number> = {
  "1H": 60 * 60 * 1000,
  "3H": 3 * 60 * 60 * 1000,
  "1D": 24 * 60 * 60 * 1000,
  "3D": 3 * 24 * 60 * 60 * 1000,
  ALL: Number.POSITIVE_INFINITY,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  const range = req.nextUrl.searchParams.get("range") ?? "1D";
  const windowMs = WINDOW_MS[range] ?? WINDOW_MS["1D"];
  const cutoff = windowMs === Number.POSITIVE_INFINITY ? 0 : Date.now() - windowMs;

  const convex = convexServerClient();
  const rows = await convex.query(api.market.getPriceHistory, {
    ticker,
    limit: 200,
  });
  const filtered = rows.filter((r) => r.timestamp >= cutoff);

  return NextResponse.json(
    filtered.map((r) => ({
      price: r.price,
      timestamp: r.timestamp,
    })),
  );
}
