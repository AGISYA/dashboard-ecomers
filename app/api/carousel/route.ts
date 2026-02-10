export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  const cfg = await prisma.carousel.findFirst({
    select: { id: true, createdAt: true, imagesJson: true },
  });
  if (!cfg) {
    return NextResponse.json({
      id: "",
      slides: [],
      createdAt: new Date().toISOString(),
    });
  }
  let raw: unknown = (cfg as any).imagesJson as unknown;
  if (!Array.isArray(raw)) {
    try {
      const rows = (await prisma.$queryRawUnsafe<{ link?: string }[]>(
        `SELECT "link" FROM "Carousel" WHERE "id" = $1 LIMIT 1`,
        cfg.id
      )) as { link?: string }[];
      const s = rows?.[0]?.link ?? "";
      raw = s ? JSON.parse(s) : null;
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
    const exists = await prisma.carousel.findFirst();
    if (!exists) {
      try {
        const created = await prisma.carousel.create({
          data: {
            imagesJson: slides as unknown as Prisma.InputJsonValue,
          },
        });
        return NextResponse.json({ id: created.id });
      } catch (err: any) {
        const msg = String(err?.message || "");
        if (msg.includes("Unknown argument `imagesJson`")) {
          const created = await prisma.carousel.create({
            data: { link: JSON.stringify(slides) },
          });
          return NextResponse.json({ id: created.id });
        }
        throw err;
      }
    } else {
      try {
        const updated = await prisma.carousel.update({
          where: { id: exists.id },
          data: {
            imagesJson: slides as unknown as Prisma.InputJsonValue,
          },
        });
        return NextResponse.json({ id: updated.id });
      } catch (err: any) {
        const msg = String(err?.message || "");
        if (msg.includes("Unknown argument `imagesJson`")) {
          const u = await prisma.carousel.update({
            where: { id: exists.id },
            data: { link: JSON.stringify(slides) },
          });
          return NextResponse.json({ id: u.id });
        }
        throw err;
      }
    }
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : "Terjadi kesalahan";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
