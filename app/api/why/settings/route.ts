import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function GET(_: NextRequest) {
    const row = await (prisma as any).whySettings.findFirst({
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(row || {
        title: "Why Choose FURSIA",
        buttonText: "Complete the why",
        buttonLink: "/about"
    });
}

export async function PUT(req: NextRequest) {
    const token = await getAdminAuthTokenFromCookies();
    if (!token || !verifyJWT(token)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();
        const existing = await (prisma as any).whySettings.findFirst({
            orderBy: { createdAt: "desc" },
        });

        let result;
        if (!existing) {
            result = await (prisma as any).whySettings.create({
                data: {
                    title: body.title ?? "Why Choose FURSIA",
                    buttonText: body.buttonText ?? "Complete the why",
                    buttonLink: body.buttonLink ?? "/about",
                },
            });
        } else {
            result = await (prisma as any).whySettings.update({
                where: { id: existing.id },
                data: {
                    title: body.title ?? undefined,
                    buttonText: body.buttonText ?? undefined,
                    buttonLink: body.buttonLink ?? undefined,
                },
            });
        }
        return NextResponse.json(result);
    } catch (err) {
        console.error("Why Settings Put Error:", err);
        return NextResponse.json({ error: "Gagal menyimpan Why Settings" }, { status: 500 });
    }
}
