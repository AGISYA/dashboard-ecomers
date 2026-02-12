export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function GET(_: NextRequest) {
  const posts = await (prisma as any).newsPost.findMany({
    orderBy: { publishedAt: "desc" },
  });
  return NextResponse.json(
    posts.map((p: { publishedAt: Date }) => ({
      ...p,
      publishedAt: p.publishedAt.toISOString(),
    }))
  );
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
      slug?: string;
      category?: string;
      excerpt?: string;
      imageUrl?: string;
      publishedAt?: string;
      active?: boolean;
    };
    const title = String(body.title ?? "").trim();
    const slug = String(body.slug ?? "").trim();
    if (!title || !slug) {
      return NextResponse.json({ error: "Judul dan slug wajib" }, { status: 400 });
    }

    const existing = await (prisma as any).newsPost.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Slug sudah dipakai" }, { status: 409 });
    }

    let publishedAt = new Date();
    if (body.publishedAt) {
      const d = new Date(body.publishedAt);
      if (!Number.isNaN(d.getTime())) {
        publishedAt = d;
      }
    }

    const newPost = await (prisma as any).newsPost.create({
      data: {
        title,
        category: String(body.category ?? "Berita").trim(),
        slug,
        excerpt: body.excerpt ?? "",
        imageUrl: body.imageUrl ?? null,
        publishedAt,
        active: body.active ?? true,
      },
    });
    return NextResponse.json(newPost);
  } catch (err) {
    console.error("News Post Error:", err);
    return NextResponse.json({ error: "Gagal membuat news" }, { status: 500 });
  }
}
