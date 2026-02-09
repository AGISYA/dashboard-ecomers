export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(
    data.map((c) => ({
      id: c.id,
      name: c.name,
      active: c.active,
      createdAt: c.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "");
    const active = body?.active ?? true;
    if (!name) {
      return NextResponse.json({ error: "Nama kategori wajib" }, { status: 400 });
    }
    try {
      const created = await prisma.category.create({ data: { name, active } });
      return NextResponse.json({ id: created.id });
    } catch (e: any) {
      return NextResponse.json({ error: "Konflik nama" }, { status: 409 });
    }
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
