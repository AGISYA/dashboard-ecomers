export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(_: NextRequest) {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}
