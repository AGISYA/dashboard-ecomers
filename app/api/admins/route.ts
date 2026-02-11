export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = await getAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  const adminCount = await prisma.user.count({
    where: { OR: [{ role: "ADMIN" }, { role: "SUPER_ADMIN" }] },
  });
  const bootstrap = adminCount === 0;
  if (!bootstrap) {
    if (!me || me.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  try {
    const body = (await req.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      active?: boolean;
      password?: string;
    };
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const active = body.active ?? true;
    const password = String(body.password ?? "");
    if (!name || (!phone && !email) || !password) {
      return NextResponse.json({ error: "Nama, Phone/Email, dan password wajib" }, { status: 400 });
    }
    if (phone) {
      const existsPhone = await prisma.user.findUnique({ where: { phone } });
      if (existsPhone) {
        return NextResponse.json({ error: "Nomor sudah terdaftar" }, { status: 409 });
      }
    }
    let hasEmailCol = false;
    const emailColRows = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'email'
       ) AS exists`
    );
    hasEmailCol = Boolean(emailColRows?.[0]?.exists);
    if (email && hasEmailCol) {
      const existsEmail = await prisma.user.findUnique({ where: { email } });
      if (existsEmail) {
        return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
      }
    }
    const hashed = await (await import("@/lib/auth")).scryptHash(password);
    const created = await prisma.user.create({
      data: {
        name,
        ...(phone ? { phone } : {}),
        ...(email && hasEmailCol ? { email } : {}),
        role: bootstrap ? "SUPER_ADMIN" : "ADMIN",
        active,
        password: hashed,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: created.id });
  } catch {
    return NextResponse.json({ error: "Gagal membuat admin" }, { status: 500 });
  }
}
