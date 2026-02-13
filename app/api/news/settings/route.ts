import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function GET() {
    try {
        const s = await prisma.newsSettings.findFirst({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(s || {
            title: "News",
            buttonText: "See all news",
            buttonLink: "/blogs/news",
        });
    } catch (e) {
        return NextResponse.json({ error: "Gagal mengambil konfigurasi news" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const token = await getAdminAuthTokenFromCookies();
    if (!token || !verifyJWT(token)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();
        const existing = await prisma.newsSettings.findFirst({
            orderBy: { createdAt: "desc" },
        });
        let result;
        if (!existing) {
            result = await prisma.newsSettings.create({
                data: {
                    title: body.title ?? "News",
                    buttonText: body.buttonText ?? "See all news",
                    buttonLink: body.buttonLink ?? "/blogs/news",
                },
            });
        } else {
            result = await prisma.newsSettings.update({
                where: { id: existing.id },
                data: {
                    title: body.title ?? undefined,
                    buttonText: body.buttonText ?? undefined,
                    buttonLink: body.buttonLink ?? undefined,
                },
            });
        }
        return NextResponse.json(result);
    } catch (e) {
        console.error("News Settings Put Error:", e);
        return NextResponse.json({ error: "Gagal menyimpan konfigurasi news" }, { status: 500 });
    }
}
