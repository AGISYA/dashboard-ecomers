export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function GET(_: NextRequest) {
  const token = await getAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me || (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, phone: true, role: true, active: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const token = await getAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me || (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = (await req.json()) as {
      name?: string;
      phone?: string;
      role?: "USER" | "ADMIN" | "SUPER_ADMIN";
      active?: boolean;
      password?: string;
    };
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const role = (body.role ?? "USER") as "USER" | "ADMIN" | "SUPER_ADMIN";
    const active = body.active ?? true;
    const password = body.password ? String(body.password) : undefined;
    if (!name || !phone || !["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
    }
    const created = await prisma.user.create({
      data: {
        name,
        phone,
        role,
        active,
        password: password ? await (await import("@/lib/auth")).scryptHash(password) : undefined,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: created.id });
  } catch (e: any) {
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 });
  }
}
