"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, X, Briefcase, Sparkles, Send, Layout, Image as ImageIcon, Trash2, CheckCircle2, ArrowRight } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function BusinessPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [active, setActive] = useState(true);
  const [waNumber, setWaNumber] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/business");
      if (res.ok) {
        const j = await res.json();
        if (j) {
          setTitle(j.title || "");
          setDescription(j.description || "");
          setButtonText(j.buttonText || "");
          const link = j.buttonLink || "";
          if (link.includes("wa.me/")) {
            const parts = link.split("wa.me/")[1].split("?text=");
            let num = parts[0] || "";
            if (num.startsWith("62")) num = num.substring(2);
            setWaNumber(num);
            setWaMessage(decodeURIComponent(parts[1] || ""));
          } else {
            setWaNumber("");
            setWaMessage("");
          }
          setImageUrl(j.imageUrl || "");
          setActive(j.active);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  async function handleUploadFiles(files?: FileList | null) {
    if (!files || files.length === 0) return;
    const fd = new FormData();
    fd.set("file", files[0]);
    try {
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: fd,
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        const url = String(j.publicUrl || "").trim();
        setImageUrl(url);
      }
    } catch { }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function save() {
    const finalLink = waNumber ? `https://wa.me/62${waNumber.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}` : "";
    const res = await fetch("/api/business", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        buttonText,
        buttonLink: finalLink,
        imageUrl,
        active,
      }),
    });
    if (res.ok) {
      setSuccessMsg("Konten Business Promo berhasil diperbarui.");
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader
        title="Promo Bisnis"
        description="Kelola banner promosi utama yang ditampilkan di seluruh etalase bisnis."
        actions={
          successMsg && (
            <div className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100 animate-in fade-in duration-300">
              <CheckCircle2 className="size-3.5 mr-1.5 inline text-emerald-500" />
              {successMsg}
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 py-4 px-6">
              <div className="flex items-center gap-2.5 text-slate-800">
                <Sparkles className="size-4 text-slate-400" />
                <CardTitle className="text-sm font-semibold">Narasi Promosi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500">Judul Kampanye</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Koleksi Musim Gugur 2026"
                  className="bg-white border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg font-semibold h-12"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500">Deskripsi Narasi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Konteks detail tentang promosi..."
                  className="w-full h-32 bg-white border border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg text-sm p-4 outline-none transition-all leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-500">Teks Tombol CTA</label>
                  <Input
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Beli Sekarang"
                    className="bg-white border-slate-200 rounded-lg font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-500">Nomor WhatsApp</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">62</span>
                    <Input
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      placeholder="8123456789"
                      className="bg-white border-slate-200 rounded-lg font-mono text-xs pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-500">Pesan Otomatis</label>
                  <Input
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="Halo, saya tertarik dengan promo ini..."
                    className="bg-white border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 py-2 px-4 bg-slate-50/50 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-800">Status Publik</span>
                    <span className="text-[10px] text-slate-400 font-medium">Terlihat oleh pelanggan</span>
                  </div>
                </div>

                <ConfirmDialog
                  title="Perbarui Detail Kampanye?"
                  description="Sinkronkan perubahan ini dengan etalase langsung."
                  onConfirm={save}
                  trigger={
                    <Button size="lg" className="rounded-lg bg-slate-900 hover:bg-slate-800 h-11 px-8 font-medium text-xs">
                      Sinkronkan dengan Live
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 py-4 px-6">
              <div className="flex items-center gap-2.5 text-slate-800">
                <ImageIcon className="size-4 text-slate-400" />
                <CardTitle className="text-sm font-semibold">Visual Utama</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadFiles(e.target.files)} />

              <div
                className="relative aspect-[3/4] rounded-lg border border-dashed border-slate-200 bg-slate-50/30 overflow-hidden flex flex-col items-center justify-center group cursor-pointer hover:bg-slate-50 transition-all shadow-inner"
                onClick={() => fileRef.current?.click()}
              >
                {!imageUrl ? (
                  <div className="text-center space-y-4 p-6">
                    <div className="size-12 rounded-lg bg-white border border-slate-100 shadow-sm mx-auto flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                      <Upload className="size-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-900">Ganti gambar Hero</p>
                      <p className="text-[10px] text-slate-400 font-medium italic">Lanskap atau Potret</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Image src={imageUrl} alt="preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-4 border-white/20 rounded-lg m-2 backdrop-blur-[2px]">
                      <Button variant="secondary" className="rounded-lg text-[10px] font-semibold h-8 bg-white/90 text-slate-900 shadow-sm">Ganti Media</Button>
                    </div>
                  </>
                )}
              </div>

              {imageUrl && (
                <Button
                  variant="ghost"
                  onClick={() => setImageUrl("")}
                  className="w-full h-11 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 text-xs font-black gap-2"
                >
                  <Trash2 className="size-4" />
                  Hapus Visual
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
