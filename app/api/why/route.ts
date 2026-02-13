export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function GET(_: NextRequest) {
  const items = await prisma.whyItem.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const token = await getAdminAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      title?: string;
      description?: string;
      imageUrl?: string;
      order?: number;
      active?: boolean;
    };
    const newItem = await prisma.whyItem.create({
      data: {
        title: String(body.title ?? "").trim(),
        description: String(body.description ?? ""),
        imageUrl: body.imageUrl ?? null,
        order: typeof body.order === "number" ? body.order : 0,
        active: body.active ?? true,
      },
    });
    return NextResponse.json(newItem);
  } catch (err) {
    console.error("Why Post Error:", err);
    return NextResponse.json({ error: "Gagal membuat item Why" }, { status: 500 });
  }
}
