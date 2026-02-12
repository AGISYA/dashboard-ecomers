export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function GET(_: NextRequest) {
  const row = await (prisma as any).footerSettings.findFirst({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(row || null);
  return NextResponse.json(row || {
    aboutText: "",
    copyright: "",
    email: "",
    instagram: "",
    whatsapp: "",
    logoUrl: ""
  });
}

export async function PUT(req: NextRequest) {
  const token = await getAdminAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      aboutText?: string;
      copyright?: string;
      email?: string;
      instagram?: string;
      whatsapp?: string;
      logoUrl?: string;
    };
    const existing = await (prisma as any).footerSettings.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let result;
    if (!existing) {
      result = await (prisma as any).footerSettings.create({
        data: {
          aboutText: body.aboutText ?? "",
          copyright: body.copyright ?? "",
          email: body.email ?? "",
          instagram: body.instagram ?? "",
          whatsapp: body.whatsapp ?? "",
          logoUrl: body.logoUrl ?? "",
        },
      });
    } else {
      result = await (prisma as any).footerSettings.update({
        where: { id: existing.id },
        data: {
          aboutText: body.aboutText ?? undefined,
          copyright: body.copyright ?? undefined,
          email: body.email ?? undefined,
          instagram: body.instagram ?? undefined,
          whatsapp: body.whatsapp ?? undefined,
          logoUrl: body.logoUrl ?? undefined,
        },
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("Footer Settings Put Error:", err);
    return NextResponse.json({ error: "Gagal menyimpan Footer Settings" }, { status: 500 });
  }
}
