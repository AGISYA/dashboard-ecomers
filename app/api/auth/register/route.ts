export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scryptHash, signJWT, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const password = String(body?.password ?? "");
    if (!name || !phone || !password) {
      return NextResponse.json({ error: "Nama, phone, dan password wajib" }, { status: 400 });
    }
    const exists = await prisma.user.findUnique({ where: { phone } });
    if (exists) {
      return NextResponse.json({ error: "Nomor sudah terdaftar" }, { status: 409 });
    }
    const hashed = await scryptHash(password);
    const created = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashed,
        role: "USER",
        active: true,
      },
      select: { id: true, name: true, phone: true, role: true },
    });
    const token = signJWT({
      id: created.id,
      name: created.name,
      phone: created.phone,
      role: "USER",
    });
    await setAuthCookie(token);
    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
