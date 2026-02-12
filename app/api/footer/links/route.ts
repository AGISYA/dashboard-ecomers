export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function GET(_: NextRequest) {
  const links = await (prisma as any).footerLink.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const token = await getAdminAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      group: string;
      label: string;
      url: string;
      order?: number;
      active?: boolean;
    };
    const newLink = await (prisma as any).footerLink.create({
      data: {
        group: body.group,
        label: body.label,
        url: body.url,
        order: body.order ?? 0,
        active: body.active ?? true,
      },
    });
    return NextResponse.json(newLink);
  } catch (err) {
    console.error("Footer Link Post Error:", err);
    return NextResponse.json({ error: "Gagal menambah link" }, { status: 500 });
  }
}
