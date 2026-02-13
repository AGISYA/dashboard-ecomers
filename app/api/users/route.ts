export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function GET(_: NextRequest) {
  const token = await getAdminAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me || (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const emailColExistsRows = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'email') AS exists`
  );
  const hasEmail = Boolean(emailColExistsRows?.[0]?.exists);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      active: true,
      ...(hasEmail ? { email: true } : {}),
    },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const token = await getAdminAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  let bootstrapAdmin = false;
  if (!me || (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN")) {
    const adminCount = await prisma.user.count({
      where: { OR: [{ role: "ADMIN" }, { role: "SUPER_ADMIN" }] },
    });
    if (adminCount > 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    bootstrapAdmin = true;
  }
  try {
    const body = (await req.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      role?: "USER" | "ADMIN" | "SUPER_ADMIN";
      active?: boolean;
      password?: string;
    };
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const requestedRole = (body.role ?? "USER") as "USER" | "ADMIN" | "SUPER_ADMIN";
    // ADMIN can only create USER; SUPER_ADMIN can create any role
    const role =
      bootstrapAdmin
        ? "SUPER_ADMIN"
        : me?.role === "ADMIN"
          ? "USER"
          : requestedRole;
    const active = body.active ?? true;
    const password = body.password ? String(body.password) : undefined;
    if (!name || (!phone && !email) || !["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
    }
    const emailColExistsRows2 = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'email') AS exists`
    );
    const hasEmail2 = Boolean(emailColExistsRows2?.[0]?.exists);
    const hashed = password ? await (await import("@/lib/auth")).scryptHash(password) : undefined;
    const created = await prisma.user.create({
      data: {
        name,
        ...(phone ? { phone } : {}),
        ...(email && hasEmail2 ? { email } : {}),
        role,
        active,
        password: hashed,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: created.id });
  } catch (e: unknown) {
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 });
  }
}
