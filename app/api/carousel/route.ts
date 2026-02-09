export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.carousel.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(
    items.map((i) => ({
      id: i.id,
      title: i.title,
      imageUrl: i.imageUrl,
      link: i.link,
      sortOrder: i.sortOrder,
      active: i.active,
      createdAt: i.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const imageUrl = String(body?.imageUrl ?? "");
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl wajib" }, { status: 400 });
    }
    const title = String(body?.title ?? "");
    const link = String(body?.link ?? "");
    const sortOrder = Number(body?.sortOrder ?? 0);
    const active = body?.active ?? true;
    const created = await prisma.carousel.create({
      data: { imageUrl, title, link, sortOrder, active },
    });
    return NextResponse.json({ id: created.id });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
