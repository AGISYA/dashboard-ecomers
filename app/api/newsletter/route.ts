export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email?: string };
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
  }
  try {
    const existing = await (prisma as any).newsletterSubscription.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }
    const newItem = await (prisma as any).newsletterSubscription.create({
      data: { email },
    });
    return NextResponse.json({ id: newItem.id });
  } catch (err) {
    console.error("Newsletter Post Error:", err);
    return NextResponse.json({ error: "Gagal menyimpan email" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const subs = await (prisma as any).newsletterSubscription.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(subs);
  } catch (err) {
    return NextResponse.json({ error: "Gagal mengambil data newsletter" }, { status: 500 });
  }
}
