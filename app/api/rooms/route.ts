export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const roomExistsRows = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Room' AND relkind = 'r') AS exists`
  );
  if (!roomExistsRows?.[0]?.exists) {
    return NextResponse.json([]);
  }
  const data = await prisma.$queryRawUnsafe<{ id: string; name: string; active: boolean; createdAt: Date }[]>(
    `SELECT "id","name","active","createdAt" FROM "Room" ORDER BY "name" ASC`
  );
  return NextResponse.json(
    data.map((r) => ({
      id: r.id,
      name: r.name,
      active: r.active,
      createdAt: r.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const active = body?.active ?? true;
    if (!name) {
      return NextResponse.json({ error: "Nama ruangan wajib" }, { status: 400 });
    }
    try {
      const roomExistsRows = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
        `SELECT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Room' AND relkind = 'r') AS exists`
      );
      if (!roomExistsRows?.[0]?.exists) {
        return NextResponse.json({ error: "Tabel Room belum tersedia. Jalankan migrasi." }, { status: 400 });
      }
      const dup = await prisma.room.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
      });
      if (dup?.id) {
        return NextResponse.json({ error: "Nama ruangan sudah ada" }, { status: 409 });
      }
      const created = await prisma.room.create({
        data: { name, active: Boolean(active) },
        select: { id: true },
      });
      return NextResponse.json({ id: created.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (typeof msg === "string" && msg.toLowerCase().includes("duplicate key")) {
        return NextResponse.json({ error: "Nama ruangan sudah ada" }, { status: 409 });
      }
      return NextResponse.json({ error: "Gagal membuat ruangan" }, { status: 500 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    return NextResponse.json({ error: msg || "Terjadi kesalahan" }, { status: 500 });
  }
}
