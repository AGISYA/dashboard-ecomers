export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scryptVerify, signJWT, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body?.phone ?? "");
    const password = String(body?.password ?? "");
    if (!phone || !password) {
      return NextResponse.json({ error: "Phone dan password wajib" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !user.password) {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 401 });
    }

    const ok = await scryptVerify(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    const token = signJWT({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    });
  } catch (e) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
