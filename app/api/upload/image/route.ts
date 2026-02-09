export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Token Blob tidak ada" }, { status: 400 });
    }
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }
    const fileName = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { url, pathname } = await put(fileName, file, {
      access: "public",
      token,
    });
    return NextResponse.json({ key: pathname, publicUrl: url });
  } catch {
    return NextResponse.json({ error: "Gagal upload" }, { status: 500 });
  }
}
