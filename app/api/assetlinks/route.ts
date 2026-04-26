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
            // Play Store app signing key (Google-managed)
            "07:AD:F7:59:3B:AB:E0:9D:DE:3E:1A:BD:3E:E2:59:61:ED:47:FF:85:BB:2B:D2:02:63:BE:3D:D8:AA:AD:48:A4",
            // Upload key (local keystore)
            "CA:CF:F5:C1:07:8B:5D:FF:D8:B9:CA:30:9E:D2:09:B1:74:48:1F:04:ED:81:11:4A:8B:73:38:9A:E2:6C:5B:C1",
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
