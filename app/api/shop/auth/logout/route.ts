export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { clearShopAuthCookie } from "@/lib/auth";

export async function POST(_: NextRequest) {
  await clearShopAuthCookie();
  return NextResponse.json({ ok: true });
}
