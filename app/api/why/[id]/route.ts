export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const item = await prisma.whyItem.findUnique({
    where: { id },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const token = await getAdminAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = (await req.json()) as {
      title?: string;
      description?: string;
      imageUrl?: string | null;
      order?: number;
      active?: boolean;
    };
    const updatedItem = await prisma.whyItem.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        description: body.description ?? undefined,
        imageUrl: body.imageUrl ?? undefined,
        order: body.order ?? undefined,
        active: body.active ?? undefined,
      },
    });
    return NextResponse.json(updatedItem);
  } catch (err) {
    console.error("Why Put Error:", err);
    return NextResponse.json({ error: "Gagal memperbarui item Why" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const token = await getAdminAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.whyItem.delete({
      where: { id },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Why Delete Error:", err);
    return NextResponse.json({ error: "Gagal menghapus item Why" }, { status: 500 });
  }
}
