export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email?: string };
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
  }
  try {
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }
    const newItem = await prisma.newsletterSubscription.create({
      data: { email },
    });
    return NextResponse.json({ id: newItem.id });
  } catch (err) {
    console.error("Newsletter Post Error:", err);
    return NextResponse.json({ error: "Gagal menyimpan email" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = await getAdminAuthTokenFromCookies();
  if (!token || !verifyJWT(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const subs = await prisma.newsletterSubscription.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(subs);
  } catch (err) {
    return NextResponse.json({ error: "Gagal mengambil data newsletter" }, { status: 500 });
  }
}
