import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.mcse.stockmarket",
          sha256_cert_fingerprints: [
            "07:AD:F7:59:3B:AB:E0:9D:DE:3E:1A:BD:3E:E2:59:61:ED:47:FF:85:BB:2B:D2:02:63:BE:3D:D8:AA:AD:48:A4",
          ],
        },
      },
    ],
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    },
  );
}
