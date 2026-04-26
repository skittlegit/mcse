import { NextResponse } from "next/server";
import { convexServerClient } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const convex = convexServerClient();
  const investors = await convex.query(api.trading.adminListInvestors, {});
  return NextResponse.json({ users: investors });
}
