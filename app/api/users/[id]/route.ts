export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthTokenFromCookies, verifyJWT, scryptHash } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const token = await getAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me || (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const u = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, phone: true, role: true, active: true, createdAt: true, updatedAt: true },
  });
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(u);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const token = await getAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me || (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = (await req.json()) as {
    name?: string;
    phone?: string;
    role?: "USER" | "ADMIN" | "SUPER_ADMIN";
    active?: boolean;
    password?: string;
  };
  const data: any = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.phone === "string") data.phone = body.phone.trim();
  if (typeof body.role === "string" && ["USER", "ADMIN", "SUPER_ADMIN"].includes(body.role)) {
    data.role = body.role;
  }
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.password === "string" && body.password) {
    data.password = await scryptHash(body.password);
  }
  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true },
    });
    return NextResponse.json({ id: updated.id });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui user" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const token = await getAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me || (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}
