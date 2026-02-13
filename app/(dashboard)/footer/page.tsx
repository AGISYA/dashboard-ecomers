"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  Mail,
  Instagram,
  MessageSquare,
  CheckCircle2,
  Layout,
  Share2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function FooterPage() {
  const [aboutText, setAboutText] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      // Fetch Footer Settings
      const footerRes = await fetch("/api/footer/settings");
      let footerData = null;
      if (footerRes.ok) {
        footerData = await footerRes.json();
        if (footerData) {
          setAboutText(footerData.aboutText || "");
          setEmail(footerData.email || "");
          setInstagram(footerData.instagram || "");
          setWhatsapp(footerData.whatsapp || "");
          setLogoUrl(footerData.logoUrl || "");
        }
      }

      // Fetch Business Settings for WhatsApp Sync
      if (!footerData?.whatsapp) {
        const businessRes = await fetch("/api/business");
        if (businessRes.ok) {
          const businessData = await businessRes.json();
          if (businessData?.buttonLink?.includes("wa.me/")) {
            const waMatch = businessData.buttonLink.match(/wa.me\/(62\d+|[1-9]\d+)/);
            if (waMatch) {
              setWhatsapp(waMatch[1]);
            }
          }
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
        setLogoUrl(url);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function saveSettings() {
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/footer/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aboutText,
          email,
          instagram,
          whatsapp,
          logoUrl,
          copyright: `© ${new Date().getFullYear()} TUKANG BIKIN. All rights reserved.`
        }),
      });
      if (res.ok) {
        setSuccessMsg("Pengaturan footer berhasil diperbarui.");
      } else {
        const j = await res.json().catch(() => ({}));
        setSuccessMsg(`Gagal: ${j.error || "Terjadi kesalahan"}`);
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg("Error: Gagal terhubung ke database.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700 pb-10">
      <PageHeader
        title="Pengaturan Footer"
        description="Konfigurasi identitas visual dan saluran komunikasi publik."
        actions={
          <div className="flex items-center gap-3">
            {successMsg && (
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 animate-in slide-in-from-right-2 duration-300">
                {successMsg}
              </div>
            )}
            <Button
              onClick={saveSettings}
              className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
              Simpan Perubahan
            </Button>
          </div>
        }
      />

      <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Media & About */}
            <div className="lg:col-span-5 p-8 bg-slate-50/50 border-r border-slate-100 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="size-5 rounded-md bg-slate-900 flex items-center justify-center">
                    <Layout className="size-3 text-white" />
                  </div>
                  <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Logo Website</label>
                </div>

                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadFiles(e.target.files)} />
                <div
                  className="relative aspect-[3/1.2] w-full rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center group cursor-pointer hover:border-slate-900/20 hover:bg-slate-50 transition-all overflow-hidden shadow-sm"
                  onClick={() => fileRef.current?.click()}
                >
                  {logoUrl ? (
                    <>
                      <Image src={logoUrl} alt="Logo" fill className="object-contain p-6 transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                        <Button variant="secondary" className="rounded-xl text-[10px] font-bold h-8 bg-white text-slate-900">Ganti Logo</Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                        <Upload className="size-5" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Upload Logo</p>
                    </div>
                  )}
                </div>
                {logoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLogoUrl("")}
                    className="w-full text-red-500 hover:bg-red-50 rounded-xl font-bold text-[10px] h-8 border border-red-100/50"
                  >
                    <Trash2 className="size-3 mr-2" />
                    Hapus Media
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="size-5 rounded-md bg-slate-900 flex items-center justify-center">
                    <Sparkles className="size-3 text-white" />
                  </div>
                  <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Deskripsi Singkat</label>
                </div>
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  placeholder="Ceritakan singkat tentang bisnis Anda..."
                  className="w-full h-40 bg-white border border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-xs p-5 outline-none transition-all leading-relaxed font-medium shadow-sm placeholder:text-slate-300 resize-none"
                />
              </div>
            </div>

            {/* Right: Social Ecosystem */}
            <div className="lg:col-span-7 p-8 space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Share2 className="size-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ekosistem Digital</h3>
                  <p className="text-[10px] text-slate-400 font-medium tracking-tight">Hubungkan brand Anda dengan pelanggan</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">WhatsApp Business</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <MessageSquare className="size-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-400 border-r border-slate-200 pr-2">62</span>
                    </div>
                    <Input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="81234567890"
                      className="bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-emerald-500/5 focus:border-emerald-500 rounded-2xl text-sm pl-20 h-14 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 italic px-1">* Otomatis terhubung dengan menu Business Promo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Instagram</label>
                    <div className="relative group">
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-pink-500 pointer-events-none" />
                      <Input
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="tukangbikin.official"
                        className="bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-pink-500/5 focus:border-pink-500 rounded-2xl text-sm pl-12 h-14 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Gmail Account</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-blue-500 pointer-events-none" />
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hello@tukangbikin.com"
                        className="bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-blue-500/5 focus:border-blue-500 rounded-2xl text-sm pl-12 h-14 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50">
                <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-xl shadow-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <CheckCircle2 className="size-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Status Konfigurasi</p>
                      <p className="text-[10px] text-slate-400">Semua perubahan publik langsung terupdate.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
