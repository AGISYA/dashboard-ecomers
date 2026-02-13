"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import Image from "next/image";
import { useWhy, WhyItem } from "@/hooks/useWhy";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Upload,
  Save,
  Sparkles,
  LayoutGrid,
  CheckCircle2,
  Plus,
  Loader2,
  ImageIcon,
  ArrowLeft,
  Trash2,
  FileText,
  Link as LinkIcon
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function WhyPage() {
  const { data, refetch, isLoading } = useWhy();
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionButtonText, setSectionButtonText] = useState("");
  const [sectionButtonLink, setSectionButtonLink] = useState("");

  const [items, setItems] = useState<Partial<WhyItem>[]>(Array(4).fill({ title: "", description: "", imageUrl: "" }));
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/why/settings")
      .then((res) => res.json())
      .then((d) => {
        setSectionTitle(d.title || "");
        setSectionButtonText(d.buttonText || "");
        setSectionButtonLink(d.buttonLink || "");
      });
  }, []);

  useEffect(() => {
    if (data) {
      startTransition(() => {
        const sorted = [...data].sort((a, b) => a.order - b.order);
        const filled = Array(4).fill(null).map((_, i) => sorted[i] || { title: "", description: "", imageUrl: "", order: i });
        setItems(filled);
      });
    }
  }, [data]);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  async function saveAll() {
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      const resSettings = await fetch("/api/why/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sectionTitle,
          buttonText: sectionButtonText,
          buttonLink: sectionButtonLink,
        }),
      });

      if (!resSettings.ok) {
        throw new Error("Gagal menyimpan pengaturan judul.");
      }

      for (const [idx, item] of items.entries()) {
        const payload = { ...item, order: idx, active: true };
        let res;
        if (item.id) {
          res = await fetch(`/api/why/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else if (item.title || item.imageUrl) {
          res = await fetch("/api/why", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
        if (res && !res.ok) {
          throw new Error(`Gagal menyimpan pilar ke-${idx + 1}.`);
        }
      }

      await refetch();
      setSuccessMsg("Pengaturan berhasil disimpan ke database.");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal menyimpan perubahan";
      setSuccessMsg(`Error: ${message}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpload(idx: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    const fd = new FormData();
    fd.set("file", files[0]);
    try {
      const res = await fetch("/api/upload/image", { method: "POST", body: fd });
      const j = await res.json();
      if (res.ok) {
        updateItem(idx, "imageUrl", j.publicUrl);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function updateItem(idx: number, field: keyof WhyItem, value: string | number | boolean | null | undefined) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
      <PageHeader
        title="Mengapa Memilih Kami"
        description="Narasi keunggulan kompetitif dan pilar identitas brand."
        actions={
          <div className="flex items-center gap-3">
            {successMsg && (
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 animate-in slide-in-from-right-2">
                {successMsg}
              </div>
            )}
            <Button
              onClick={saveAll}
              disabled={isSaving}
              className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-slate-200"
            >
              {isSaving ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : <Save className="mr-2 size-3.5" />}
              Simpan Perubahan
            </Button>
          </div>
        }
      />

      <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 py-5 px-8">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <LayoutGrid className="size-4 text-white" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900">Konfigurasi Judul & CTA</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Seksi</label>
              <Input
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Why Choose Us"
                className="h-12 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm px-5 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Label Tombol</label>
              <Input
                value={sectionButtonText}
                onChange={(e) => setSectionButtonText(e.target.value)}
                placeholder="Dapatkan Promo"
                className="h-12 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm px-5 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Tujuan Link</label>
              <div className="relative group">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <Input
                  value={sectionButtonLink}
                  onChange={(e) => setSectionButtonLink(e.target.value)}
                  placeholder="/promo"
                  className="h-12 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 transition-all font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((it, idx) => (
          <Card key={idx} className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white group hover:border-slate-200 transition-all">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 py-4 px-8 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white">
                  0{idx + 1}
                </div>
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-tight">Pilar Keunggulan {idx + 1}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="sm:w-32 shrink-0">
                  <input
                    type="file"
                    className="hidden"
                    ref={(el) => { fileRefs.current[idx] = el; }}
                    onChange={(e) => handleUpload(idx, e.target.files)}
                    accept="image/*"
                  />
                  <div
                    onClick={() => fileRefs.current[idx]?.click()}
                    className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center group/upload cursor-pointer hover:border-slate-900/10 hover:bg-slate-50 transition-all overflow-hidden"
                  >
                    {it.imageUrl ? (
                      <>
                        <Image src={it.imageUrl} alt="icon" fill className="object-contain p-4 transition-transform group-hover/upload:scale-110" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Ubah</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <Upload className="size-5 text-slate-300 mx-auto" />
                        <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">SVG/PNG</p>
                      </div>
                    )}
                  </div>
                  {it.imageUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateItem(idx, "imageUrl", "")}
                      className="w-full mt-2 h-7 rounded-lg text-red-500 hover:bg-red-50 text-[10px] font-bold"
                    >
                      Hapus Ikon
                    </Button>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Pilar</label>
                    <Input
                      value={it.title}
                      onChange={(e) => updateItem(idx, "title", e.target.value)}
                      placeholder="Misal: Export Quality"
                      className="h-10 bg-slate-50/30 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-xl text-xs px-4 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Deskripsi Singkat</label>
                    <textarea
                      value={it.description}
                      onChange={(e) => updateItem(idx, "description", e.target.value)}
                      placeholder="Jelaskan nilai keunggulan ini..."
                      className="w-full h-24 bg-slate-50/30 border border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-xl text-xs p-4 outline-none transition-all leading-relaxed font-medium resize-none placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
