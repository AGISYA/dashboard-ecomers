"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Upload,
  X,
  Briefcase,
  Sparkles,
  Send,
  Layout,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Save,
  MessageCircle,
  Phone,
  Settings2,
  ExternalLink
} from "lucide-react";
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
  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(true);
    setSuccessMsg(null);
    const finalLink = waNumber ? `https://wa.me/62${waNumber.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}` : "";
    try {
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
        setSuccessMsg("Konten berhasil diperbarui.");
      } else {
        const j = await res.json().catch(() => ({}));
        setSuccessMsg(`Gagal: ${j.error || "Terjadi kesalahan"}`);
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg("Error: Gagal menyimpan ke database.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
      <PageHeader
        title="Promo Bisnis"
        description="Konfigurasi banner promosi utama dan CTA WhatsApp untuk pelanggan."
        actions={
          <div className="flex items-center gap-3">
            {successMsg && (
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 animate-in slide-in-from-right-2">
                {successMsg}
              </div>
            )}
            <ConfirmDialog
              title="Perbarui Promo?"
              description="Perubahan akan langsung tampil di halaman depan aplikasi."
              onConfirm={save}
              trigger={
                <Button className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-slate-200">
                  <Save className="mr-2 size-3.5" />
                  Simpan Perubahan
                </Button>
              }
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 py-5 px-8">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
                  <Sparkles className="size-4 text-white" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900">Narasi & Konten</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Kampanye</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Koleksi Teakwood Terbaru 2026"
                  className="h-14 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm px-5 transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Deskripsi Promosi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan detail penawaran menarik Anda..."
                  className="w-full h-40 bg-slate-50/50 border border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm p-5 outline-none transition-all leading-relaxed font-medium resize-none placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Teks Tombol CTA</label>
                  <div className="relative group">
                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="Chat WhatsApp"
                      className="h-12 bg-slate-50/20 border-slate-200 rounded-xl text-xs pl-12 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Status Publikasi</label>
                  <div className="flex items-center justify-between h-12 px-5 bg-slate-50/20 border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Aktifkan Banner</span>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="size-5 rounded border-slate-200 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 py-5 px-8">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <MessageCircle className="size-4 text-white" />
                </div>
                <CardTitle className="text-sm font-bold text-slate-900">Konfigurasi WhatsApp</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Nomor WhatsApp</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 font-bold text-xs border-r border-slate-200 pr-3">
                      +62
                    </div>
                    <Input
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      placeholder="81234..."
                      className="h-12 bg-slate-50/50 border-slate-200 rounded-xl text-sm pl-16 font-mono"
                    />
                  </div>
                </div>
                <div className="md:col-span-7 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Pesan Otomatis</label>
                  <div className="relative">
                    <Input
                      value={waMessage}
                      onChange={(e) => setWaMessage(e.target.value)}
                      placeholder="Halo Admin, saya tertarik dengan promo..."
                      className="h-12 bg-slate-50/50 border-slate-200 rounded-xl text-xs px-5"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Visual */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 py-5 px-8">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 text-slate-400" />
                <CardTitle className="text-sm font-bold text-slate-900">Visual Banner</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadFiles(e.target.files)} />

              <div
                onClick={() => fileRef.current?.click()}
                className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center group cursor-pointer hover:border-slate-900/10 hover:bg-slate-50 transition-all overflow-hidden"
              >
                {!imageUrl ? (
                  <div className="text-center space-y-3">
                    <div className="size-12 rounded-xl bg-white border border-slate-100 shadow-sm mx-auto flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                      <Upload className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-900 uppercase">Upload Hero</p>
                      <p className="text-[9px] text-slate-400 font-medium">Portrait (3:4) Recommended</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Image src={imageUrl} alt="preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                      <Button variant="secondary" className="rounded-xl text-[10px] font-bold h-9 bg-white text-slate-900 border-none shadow-xl">Ganti Media</Button>
                    </div>
                  </>
                )}
              </div>

              {imageUrl && (
                <Button
                  variant="ghost"
                  onClick={() => setImageUrl("")}
                  className="w-full h-10 rounded-xl text-red-500 hover:bg-red-50 text-[10px] font-bold gap-2"
                >
                  <Trash2 className="size-3.5" />
                  Hapus Visual Utama
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="p-6 bg-slate-900 rounded-3xl shadow-xl shadow-slate-200 overflow-hidden relative group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
            <h4 className="text-white font-bold text-sm relative z-10 flex items-center gap-2">
              <Settings2 className="size-4" />
              Tautan Cepat
            </h4>
            <div className="mt-4 space-y-2 relative z-10">
              <p className="text-[10px] text-slate-400 leading-relaxed">Pastikan nomor WhatsApp aktif untuk menerima pertanyaan dari pelanggan melalui banner promo ini.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
