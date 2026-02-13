import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_PATHS = [
    "/dashboard",
    "/products",
    "/categories",
    "/carousel",
    "/users",
    "/rooms",
    "/why",
    "/business",
    "/news",
    "/footer",
    "/pengguna",
];

const SHOP_PROTECTED_PATHS = [
    "/shop/profile",
    "/shop/checkout",
    "/shop/orders",
];

export async function middleware(req: NextRequest) {
    const { pathname, origin } = req.nextUrl;
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "default_secret");

    // --- CORS HANDLING ---
    // Handle OPTIONS request for preflight
    if (req.method === "OPTIONS") {
        const preflightResponse = new NextResponse(null, { status: 204 });
        preflightResponse.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        preflightResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        preflightResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        preflightResponse.headers.set("Access-Control-Allow-Credentials", "true");
        return preflightResponse;
    }

    // 1. Handle Admin Dashboard Protection
    const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
    if (isAdminPath) {
        const adminToken = req.cookies.get("admin_token")?.value;
        if (!adminToken) {
            return NextResponse.redirect(new URL("/login", origin));
        }

        try {
            const { payload } = await jwtVerify(adminToken, secret);
            const role = payload.role as string;
            if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
                // Logged in as SHOP user but trying to access ADMIN area
                return NextResponse.redirect(new URL("/login?error=forbidden", origin));
            }
        } catch (err) {
            return NextResponse.redirect(new URL("/login", origin));
        }
    }

    // 2. Handle Shop Protection (Example: Profile/Checkout)
    const isShopProtectedPath = SHOP_PROTECTED_PATHS.some((p) => pathname.startsWith(p));
    if (isShopProtectedPath) {
        const shopToken = req.cookies.get("shop_auth")?.value;
        if (!shopToken) {
            return NextResponse.redirect(new URL("/login", origin));
        }

        try {
            await jwtVerify(shopToken, secret);
        } catch (err) {
            return NextResponse.redirect(new URL("/login", origin));
        }
    }

    // 3. Prevent logged-in users from accessing Login page
    if (pathname === "/login") {
        const adminToken = req.cookies.get("admin_token")?.value;
        const shopToken = req.cookies.get("shop_auth")?.value;

        if (adminToken) {
            try {
                const { payload } = await jwtVerify(adminToken, secret);
                const role = payload.role as string;
                if (role === "ADMIN" || role === "SUPER_ADMIN") {
                    return NextResponse.redirect(new URL("/dashboard", origin));
                }
            } catch { }
        }

        if (shopToken) {
            try {
                await jwtVerify(shopToken, secret);
                return NextResponse.redirect(new URL("/shop", origin));
            } catch { }
        }
    }

    const res = NextResponse.next();
    // Add CORS headers to all normal responses
    res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
    res.headers.set("Access-Control-Allow-Credentials", "true");
    return res;
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/products/:path*",
        "/categories/:path*",
        "/carousel/:path*",
        "/users/:path*",
        "/rooms/:path*",
        "/why/:path*",
        "/business/:path*",
        "/news/:path*",
        "/footer/:path*",
        "/pengguna/:path*",
        "/shop/:path*",
        "/login",
    ],
};
