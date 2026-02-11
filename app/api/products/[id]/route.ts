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
  const roomExistsRows = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Room' AND relkind = 'r') AS exists`
  );
  const hasRoom = Boolean(roomExistsRows?.[0]?.exists);
  const rows = await prisma.$queryRawUnsafe<
    {
      id: string;
      name: string;
      categoryId: string;
      roomId: string | null;
      price: bigint;
      imageUrl: string | null;
      imagesJson: unknown;
      active: boolean;
      description: string;
      createdAt: Date;
      categoryName: string | null;
      roomName: string | null;
    }[]
  >(
    `
    SELECT p."id", p."name", p."categoryId", p."roomId",
           p."price", p."imageUrl", p."imagesJson", p."active", p."description", p."createdAt",
           c."name" AS "categoryName",
           ${hasRoom ? `r."name"` : `NULL::text`} AS "roomName"
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c."id"
    ${hasRoom ? `LEFT JOIN "Room" r ON p."roomId" = r."id"` : ``}
    WHERE p."id" = $1
    LIMIT 1
    `,
    id
  );
  const p = rows?.[0];
  if (!p) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const imagesArr =
    Array.isArray(p.imagesJson) ? (p.imagesJson as unknown[]).map((u) => String(u)) : [];
  return NextResponse.json({
    id: p.id,
    name: p.name,
    categoryName: p.categoryName ?? "",
    categoryId: p.categoryId,
    roomName: p.roomName ?? "",
    roomId: p.roomId ?? null,
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
    roomId?: string;
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
  if (typeof body.roomId === "string") {
    (updateData as Record<string, unknown>).roomId = body.roomId;
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
