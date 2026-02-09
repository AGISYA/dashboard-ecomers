import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

const AUTH_COOKIE = "auth_token";
const AUTH_MAX_AGE = 7 * 24 * 60 * 60;

type JwtPayload = {
  id: string;
  name: string;
  phone: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
};

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function signJWT(payload: JwtPayload) {
  const secret = process.env.AUTH_SECRET || "";
  const header = { alg: "HS256", typ: "JWT" };
  const encHeader = base64url(Buffer.from(JSON.stringify(header)));
  const encPayload = base64url(Buffer.from(JSON.stringify(payload)));
  const data = `${encHeader}.${encPayload}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest();
  return `${data}.${base64url(signature)}`;
}

export function verifyJWT(token: string): JwtPayload | null {
  try {
    const secret = process.env.AUTH_SECRET || "";
    const [encHeader, encPayload, encSig] = token.split(".");
    if (!encHeader || !encPayload || !encSig) return null;
    const data = `${encHeader}.${encPayload}`;
    const expected = base64url(
      crypto.createHmac("sha256", secret).update(data).digest()
    );
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(encSig))) {
      const payload = JSON.parse(
        Buffer.from(encPayload.replace(/-/g, "+").replace(/_/g, "/"), "base64")
          .toString()
      ) as JwtPayload;
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function scryptHash(password: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, s, 32, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `scrypt:${s}:${derived.toString("hex")}`;
}

export async function scryptVerify(password: string, stored: string) {
  if (!stored?.startsWith("scrypt:")) return false;
  const [, salt, hashHex] = stored.split(":");
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 32, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  const match = crypto.timingSafeEqual(
    Buffer.from(hashHex, "hex"),
    derived
  );
  return match;
}

export async function setAuthCookie(token: string) {
  const c = await cookies();
  c.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_MAX_AGE,
  });
}

export async function clearAuthCookie() {
  const c = await cookies();
  c.set({
    name: AUTH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthTokenFromCookies() {
  const c = await cookies();
  return c.get(AUTH_COOKIE)?.value ?? null;
}

export async function redirectToLoginIfNoAuth(pathname: string) {
  const token = await getAuthTokenFromCookies();
  const protectedPrefixes = ["/dashboard", "/products", "/categories", "/carousel", "/users"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  }
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  }
  return null;
}
