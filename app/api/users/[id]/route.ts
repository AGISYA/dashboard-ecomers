export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT, scryptHash } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const token = await getAdminAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me || (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const u = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, phone: true, email: true, role: true, active: true, createdAt: true, updatedAt: true },
  });
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(u);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const token = await getAdminAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me || (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const target = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = (await req.json()) as {
    name?: string;
    phone?: string;
    email?: string;
    role?: "USER" | "ADMIN" | "SUPER_ADMIN";
    active?: boolean;
    password?: string;
  };
  const data: Prisma.UserUpdateInput = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.phone === "string") data.phone = body.phone.trim();
  if (typeof body.email === "string") data.email = body.email.trim();
  if (typeof body.role === "string" && ["USER", "ADMIN", "SUPER_ADMIN"].includes(body.role)) {
    // Only SUPER_ADMIN may set ADMIN/SUPER_ADMIN; ADMIN can only set USER
    if (me.role === "ADMIN" && body.role !== "USER") {
      return NextResponse.json({ error: "ADMIN tidak boleh mengubah peran admin" }, { status: 403 });
    }
    data.role = body.role;
  }
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.password === "string" && body.password) {
    data.password = await scryptHash(body.password);
  }
  // ADMIN cannot modify existing ADMIN/SUPER_ADMIN accounts
  if (me.role === "ADMIN" && (target.role === "ADMIN" || target.role === "SUPER_ADMIN")) {
    return NextResponse.json({ error: "ADMIN hanya dapat mengubah pengguna ecomers" }, { status: 403 });
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
  const token = await getAdminAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me || (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const target = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (me.role === "ADMIN" && (target.role === "ADMIN" || target.role === "SUPER_ADMIN")) {
    return NextResponse.json({ error: "ADMIN tidak boleh menghapus admin" }, { status: 403 });
  }
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}
