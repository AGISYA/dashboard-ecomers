import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        let s = await (prisma as any).newsSettings.findFirst();
        if (!s) {
            s = await (prisma as any).newsSettings.create({
                data: {
                    title: "News",
                    buttonText: "See all news",
                    buttonLink: "/blogs/news",
                },
            });
        }
        return NextResponse.json(s);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        let s = await (prisma as any).newsSettings.findFirst();
        if (!s) {
            s = await (prisma as any).newsSettings.create({ data: body });
        } else {
            s = await (prisma as any).newsSettings.update({
                where: { id: s.id },
                data: body,
            });
        }
        return NextResponse.json(s);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
