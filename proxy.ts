import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/products", "/categories", "/carousel", "/users"];

export default function proxy(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const token = req.cookies.get("admin_token")?.value || null;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  return NextResponse.next();
}
