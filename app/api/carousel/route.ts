export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cfg = await prisma.carousel.findFirst({ select: { id: true, createdAt: true } });
  if (!cfg) {
    return NextResponse.json({
      id: "",
      slides: [],
      createdAt: new Date().toISOString(),
    });
  }
  let raw: unknown;
  try {
    const rows = await prisma.$queryRawUnsafe<{ imagesJson?: unknown; link?: string }[]>(
      `SELECT "imagesJson","link" FROM "Carousel" WHERE "id" = $1 LIMIT 1`,
      cfg.id
    );
    const v = rows?.[0]?.imagesJson ?? rows?.[0]?.link ?? null;
    if (typeof v === "string") {
      raw = v ? JSON.parse(v) : null;
    } else {
      raw = v as unknown;
    }
  } catch {
    raw = null;
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
    id: cfg.id,
    slides,
    createdAt: cfg.createdAt.toISOString(),
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
    const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT "id" FROM "Carousel" LIMIT 1`
    );
    const firstImage = slides[0]?.imageUrl ?? "";
    if (!rows?.[0]?.id) {
      const created = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `INSERT INTO "Carousel"("link","imageUrl","sortOrder","active","createdAt","updatedAt") VALUES ($1,$2,0,true,NOW(),NOW()) RETURNING "id"`,
        JSON.stringify(slides),
        firstImage
      );
      return NextResponse.json({ id: created[0]?.id ?? "" });
    } else {
      const id = rows[0].id;
      await prisma.$executeRawUnsafe(
        `UPDATE "Carousel" SET "link" = $1, "imageUrl" = $2, "updatedAt" = NOW() WHERE "id" = $3`,
        JSON.stringify(slides),
        firstImage,
        id
      );
      return NextResponse.json({ id });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
