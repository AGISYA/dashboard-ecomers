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
  const roomName = url.searchParams.get("room") ?? "";
  const skip = Math.max(0, (page - 1) * limit);

  const roomExistsRows = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Room' AND relkind = 'r') AS exists`
  );
  const hasRoom = Boolean(roomExistsRows?.[0]?.exists);

  const conds: string[] = [];
  const params: unknown[] = [];
  if (q) {
    params.push(`%${q}%`);
    conds.push(`p."name" ILIKE $${params.length}`);
  }
  if (categoryName) {
    params.push(categoryName);
    conds.push(`c."name" = $${params.length}`);
  }
  if (roomName && hasRoom) {
    params.push(roomName);
    conds.push(`r."name" = $${params.length}`);
  }
  const whereSql = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  params.push(limit);
  params.push(skip);
  const data = await prisma.$queryRawUnsafe<
    {
      id: string;
      name: string;
      categoryName: string | null;
      roomName: string | null;
      price: bigint;
      imageUrl: string | null;
      active: boolean;
      description: string;
      createdAt: Date;
    }[]
  >(
    `
    SELECT p."id", p."name",
           c."name" AS "categoryName",
           ${hasRoom ? `r."name"` : `NULL::text`} AS "roomName",
           p."price", p."imageUrl", p."active", p."description", p."createdAt"
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c."id"
    ${hasRoom ? `LEFT JOIN "Room" r ON p."roomId" = r."id"` : ``}
    ${whereSql}
    ORDER BY p."createdAt" DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
    `,
    ...params
  );
  const totalRows = await prisma.$queryRawUnsafe<{ count: number }[]>(
    `
    SELECT COUNT(*)::int AS count
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c."id"
    ${hasRoom ? `LEFT JOIN "Room" r ON p."roomId" = r."id"` : ``}
    ${whereSql}
    `,
    ...params.slice(0, params.length - 2)
  );
  const total = totalRows?.[0]?.count ?? 0;

  const result = data.map((p) => ({
    id: p.id,
    name: p.name,
    categoryName: p.categoryName ?? "",
    roomName: p.roomName ?? "",
    price: toNumber(p.price),
    imageUrl: p.imageUrl ?? null,
    active: p.active,
    description: p.description,
    createdAt: p.createdAt.toISOString(),
  }));

  return NextResponse.json({ data: result, page, limit, total });
}

import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function POST(req: Request) {
  const token = await getAdminAuthTokenFromCookies();
  if (!token || !verifyJWT(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      name?: string;
      price?: number;
      categoryId?: string;
      roomId?: string;
      imageUrl?: string | null;
      imageUrls?: unknown;
      active?: boolean;
      description?: string;
    };
    const name = String(body?.name ?? "");
    const priceNum = Number(body?.price ?? 0);
    const categoryId = String(body?.categoryId ?? "");
    const roomId = body?.roomId ? String(body.roomId) : undefined;
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
        ...(roomId ? { roomId } : {}),
        imageUrl: imageUrl ?? imageUrls[0] ?? null,
        imagesJson: imageUrls.length ? (imageUrls as unknown as Prisma.InputJsonValue) : undefined,
        active,
        description,
      },
    });

    return NextResponse.json({ id: created.id });
  } catch (err) {
    console.error("Product Post Error:", err);
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}
