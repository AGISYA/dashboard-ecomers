export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const token = await getAdminAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = (await req.json()) as {
      group?: string;
      label?: string;
      url?: string;
      order?: number;
      active?: boolean;
    };
    const updatedLink = await (prisma as any).footerLink.update({
      where: { id },
      data: {
        group: body.group ?? undefined,
        label: body.label ?? undefined,
        url: body.url ?? undefined,
        order: body.order ?? undefined,
        active: body.active ?? undefined,
      },
    });
    return NextResponse.json(updatedLink);
  } catch (err) {
    console.error("Footer Link Put Error:", err);
    return NextResponse.json({ error: "Gagal memperbarui link" }, { status: 500 });
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
    await (prisma as any).footerLink.delete({
      where: { id },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Footer Link Delete Error:", err);
    return NextResponse.json({ error: "Gagal menghapus link" }, { status: 500 });
  }
}
