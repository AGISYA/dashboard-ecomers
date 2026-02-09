export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function toNumber(bi: bigint) {
  const n = Number(bi);
  return Number.isFinite(n) ? n : 0;
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const p = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      categoryId: true,
      price: true,
      imageUrl: true,
      imagesJson: true,
      active: true,
      description: true,
      createdAt: true,
      category: { select: { name: true } },
    },
  });
  if (!p) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const imagesArr =
    Array.isArray(p.imagesJson) ? (p.imagesJson as unknown[]).map((u) => String(u)) : [];
  return NextResponse.json({
    id: p.id,
    name: p.name,
    categoryName: p.category?.name ?? "",
    categoryId: p.categoryId,
    price: toNumber(p.price),
    imageUrl: p.imageUrl ?? null,
    images: imagesArr,
    active: p.active,
    description: p.description,
    createdAt: p.createdAt.toISOString(),
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = (await req.json()) as {
    name?: string;
    description?: string;
    imageUrl?: string | null;
    active?: boolean;
    categoryId?: string;
    imageUrls?: unknown;
    price?: number;
  };
  const updateData: Prisma.ProductUpdateInput = {};
  if (typeof body.name === "string") updateData.name = body.name;
  if (typeof body.description === "string") updateData.description = body.description;
  if (typeof body.imageUrl === "string" || body.imageUrl === null) updateData.imageUrl = body.imageUrl ?? null;
  if (typeof body.active === "boolean") updateData.active = body.active;
  if (typeof body.categoryId === "string") {
    updateData.category = { connect: { id: body.categoryId } };
  }
  const imageUrls: string[] | undefined = Array.isArray(body.imageUrls)
    ? (body.imageUrls as unknown[]).map((s) => String(s))
    : undefined;
  if (body.price !== undefined) {
    const priceNum = Number(body.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: "Harga tidak valid" }, { status: 400 });
    }
    updateData.price = BigInt(Math.round(priceNum));
  }
  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...updateData,
      ...(imageUrls !== undefined
        ? {
          imagesJson: imageUrls as unknown as Prisma.InputJsonValue,
          imageUrl: imageUrls[0] ?? null,
        }
        : {}),
    },
  });
  return NextResponse.json({ id: updated.id });
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
