export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { getAdminAuthTokenFromCookies, getShopAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function GET(_: NextRequest) {
  let token = await getAdminAuthTokenFromCookies();
  let payload = token ? verifyJWT(token) : null;

  if (!payload) {
    // try shop token
    const shopToken = await getShopAuthTokenFromCookies();
    if (shopToken) {
      payload = verifyJWT(shopToken);
    }
  }

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(payload);
}
