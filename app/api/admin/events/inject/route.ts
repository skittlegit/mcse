import { NextResponse, type NextRequest } from "next/server";
import { convexServerClient } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";
import { requireAdmin } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const body = await req.json().catch(() => ({}));
  const ticker = typeof body.ticker === "string" ? body.ticker : "";
  const eventType = typeof body.eventType === "string" ? body.eventType : "";
  const message = typeof body.message === "string" ? body.message : undefined;

  if (!ticker || !eventType) {
    return NextResponse.json(
      { success: false, error: "ticker and eventType required" },
      { status: 400 },
    );
  }

  const convex = convexServerClient();
  const result = await convex.mutation(api.priceEngine.injectMarketEvent, {
    ticker, eventType, message,
  });
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
