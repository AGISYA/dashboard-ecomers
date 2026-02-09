export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { getAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function GET(_: NextRequest) {
  const token = await getAuthTokenFromCookies();
  if (!token) return NextResponse.json(null, { status: 200 });
  const payload = verifyJWT(token);
  return NextResponse.json(payload ?? null);
}
