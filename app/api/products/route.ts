export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function toNumber(bi: bigint) {
  const n = Number(bi);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "10");
  const q = url.searchParams.get("q") ?? "";
  const categoryName = url.searchParams.get("category") ?? "";
  const skip = Math.max(0, (page - 1) * limit);

  const where: Prisma.ProductWhereInput = {};
  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }
  if (categoryName) {
    where.category = { is: { name: { equals: categoryName } } };
  }

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const result = data.map((p) => ({
    id: p.id,
    name: p.name,
    categoryName: p.category?.name ?? "",
    price: toNumber(p.price),
    imageUrl: p.imageUrl ?? null,
    active: p.active,
    description: p.description,
    createdAt: p.createdAt.toISOString(),
  }));

  return NextResponse.json({ data: result, page, limit, total });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      price?: number;
      categoryId?: string;
      imageUrl?: string | null;
      imageUrls?: unknown;
      active?: boolean;
      description?: string;
    };
    const name = String(body?.name ?? "");
    const priceNum = Number(body?.price ?? 0);
    const categoryId = String(body?.categoryId ?? "");
    const imageUrl = body?.imageUrl != null ? String(body.imageUrl) : null;
    const imageUrls: string[] = Array.isArray(body?.imageUrls)
      ? (body.imageUrls as unknown[]).map((s) => String(s))
      : [];
    const active = body?.active ?? true;
    const description = String(body?.description ?? "");

    if (!name || !categoryId || !Number.isFinite(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
    }

    const created = await prisma.product.create({
      data: {
        name,
        price: BigInt(Math.round(priceNum)),
        categoryId,
        imageUrl: imageUrl ?? imageUrls[0] ?? null,
        imagesJson: imageUrls.length ? (imageUrls as unknown as Prisma.InputJsonValue) : undefined,
        active,
        description,
      },
    });

    return NextResponse.json({ id: created.id });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
