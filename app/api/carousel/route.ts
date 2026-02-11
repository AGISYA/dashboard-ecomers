export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.$queryRawUnsafe<{ id: string; createdAt: Date; imagesJson: unknown }[]>(
    `SELECT "id","createdAt","imagesJson" FROM "Carousel" LIMIT 1`
  );
  const row = rows?.[0];
  if (!row) {
    return NextResponse.json({ id: "", slides: [], createdAt: new Date().toISOString() });
  }
  const v = row.imagesJson;
  let raw: unknown = v;
  if (typeof v === "string") {
    try {
      raw = v ? JSON.parse(v) : null;
    } catch {
      raw = null;
    }
  }
  const slides =
    Array.isArray(raw)
      ? (raw as unknown[]).map((u) => {
        const o = typeof u === "object" && u ? (u as Record<string, unknown>) : {};
        return {
          imageUrl: String(o.imageUrl ?? ""),
          title: String(o.title ?? ""),
          subTitle: String(o.subTitle ?? ""),
          buttonText: String(o.buttonText ?? ""),
        };
      })
      : [];
  return NextResponse.json({
    id: row.id,
    slides,
    createdAt: row.createdAt.toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slides: {
      imageUrl: string;
      title: string;
      subTitle: string;
      buttonText: string;
    }[] = Array.isArray(body?.slides)
        ? (body.slides as unknown[]).map((u) => {
          const o = typeof u === "object" && u ? (u as Record<string, unknown>) : {};
          return {
            imageUrl: String(o.imageUrl ?? ""),
            title: String(o.title ?? ""),
            subTitle: String(o.subTitle ?? ""),
            buttonText: String(o.buttonText ?? ""),
          };
        })
        : [];
    if (!slides.length) {
      return NextResponse.json({ error: "Slides wajib diisi" }, { status: 400 });
    }
    if (!slides.length || slides.some((s) => !s.imageUrl)) {
      return NextResponse.json({ error: "Slides tidak valid" }, { status: 400 });
    }
    const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(`SELECT "id" FROM "Carousel" LIMIT 1`);
    if (!rows?.[0]?.id) {
      const created = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `INSERT INTO "Carousel"("imagesJson","createdAt","updatedAt") VALUES ($1::jsonb,NOW(),NOW()) RETURNING "id"`,
        JSON.stringify(slides)
      );
      return NextResponse.json({ id: created[0]?.id ?? "" });
    } else {
      const id = rows[0].id;
      await prisma.$executeRawUnsafe(
        `UPDATE "Carousel" SET "imagesJson" = $1::jsonb, "updatedAt" = NOW() WHERE "id" = $2`,
        JSON.stringify(slides),
        id
      );
      return NextResponse.json({ id });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
