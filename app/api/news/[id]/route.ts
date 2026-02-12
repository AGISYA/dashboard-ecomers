export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const post = await (prisma as any).newsPost.findUnique({
    where: { id },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...post,
    publishedAt: post.publishedAt.toISOString(),
  });
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
      category?: string;
      slug?: string;
      excerpt?: string;
      imageUrl?: string;
      publishedAt?: string;
      active?: boolean;
    };

    if (body.slug) {
      const existing = await (prisma as any).newsPost.findFirst({
        where: {
          slug: body.slug,
          id: { not: id },
        },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug sudah dipakai" }, { status: 409 });
      }
    }

    let publishedAt: Date | undefined = undefined;
    if (body.publishedAt) {
      const d = new Date(body.publishedAt);
      if (!Number.isNaN(d.getTime())) {
        publishedAt = d;
      }
    }

    const updatedPost = await (prisma as any).newsPost.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        category: body.category ?? undefined,
        slug: body.slug ?? undefined,
        excerpt: body.excerpt ?? undefined,
        imageUrl: body.imageUrl ?? undefined,
        publishedAt: publishedAt,
        active: body.active ?? undefined,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (err) {
    console.error("News Put Error:", err);
    return NextResponse.json({ error: "Gagal memperbarui news" }, { status: 500 });
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
    await (prisma as any).newsPost.delete({
      where: { id },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("News Delete Error:", err);
    return NextResponse.json({ error: "Gagal menghapus news" }, { status: 500 });
  }
}
