"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import Image from "next/image";
import { useWhy, WhyItem } from "@/hooks/useWhy";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, X, Save, Sparkles, LayoutGrid, CheckCircle2, Plus, Loader2, ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
    try {
      // Save settings
      await fetch("/api/why/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sectionTitle,
          buttonText: sectionButtonText,
          buttonLink: sectionButtonLink,
        }),
      });

      // Save each item
      for (const [idx, item] of items.entries()) {
        const payload = { ...item, order: idx, active: true };
        if (item.id) {
          await fetch(`/api/why/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else if (item.title || item.imageUrl) {
          await fetch("/api/why", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      }

      await refetch();
      setSuccessMsg("Seluruh konfigurasi berhasil diperbarui.");
    } catch (err) {
      console.error(err);
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

  function updateItem(idx: number, field: keyof WhyItem, value: any) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader
        title="Mengapa Memilih Kami"
        description="Kelola pilar identitas brand dan nilai-nilai inti yang ditampilkan di halaman Utama."
        actions={
          <div className="flex items-center gap-3">
            {successMsg && (
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium border border-emerald-100 animate-in fade-in duration-300">
                <CheckCircle2 className="size-3.5 mr-1.5 inline" />
                {successMsg}
              </div>
            )}
            <Button
              onClick={saveAll}
              disabled={isSaving}
              className="rounded-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 font-semibold text-xs uppercase tracking-wide h-10 px-6"
            >
              {isSaving ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : <Save className="mr-2 size-3.5" />}
              Simpan Perubahan
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* General Settings */}
        <div className="lg:col-span-12">
          <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 py-4 px-6 flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2.5 text-slate-800">
                <LayoutGrid className="size-4 text-slate-400" />
                <CardTitle className="text-sm font-semibold">Konfigurasi Umum</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500">Judul Utama</label>
                <Input
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="Contoh: Why Choose FURSIA"
                  className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500">Label Tombol</label>
                <Input
                  value={sectionButtonText}
                  onChange={(e) => setSectionButtonText(e.target.value)}
                  placeholder="Contoh: Complete the why"
                  className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500">Link Tombol</label>
                <Input
                  value={sectionButtonLink}
                  onChange={(e) => setSectionButtonLink(e.target.value)}
                  placeholder="Contoh: /about"
                  className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pillars Grid */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((it, idx) => (
            <Card key={idx} className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white group">
              <CardHeader className="bg-slate-50/20 border-b border-slate-100/50 py-3 px-6 flex-row items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-800">
                  <div className="size-6 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                    {idx + 1}
                  </div>
                  <CardTitle className="text-sm font-semibold text-slate-600">Pilar Ke-{idx + 1}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col xl:flex-row gap-8">
                  {/* Image Part */}
                  <div className="xl:w-48 space-y-3">
                    <div
                      onClick={() => fileRefs.current[idx]?.click()}
                      className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/30 hover:bg-slate-50/50 transition-all overflow-hidden group/img"
                    >
                      {it.imageUrl ? (
                        <>
                          <Image src={it.imageUrl} alt="Pillar icon" fill className="object-cover transition-transform group-hover/img:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest">
                            Ganti Gambar
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="size-6 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Upload</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      ref={(el) => { fileRefs.current[idx] = el; }}
                      onChange={(e) => handleUpload(idx, e.target.files)}
                      accept="image/*"
                    />
                  </div>

                  {/* Content Part */}
                  <div className="flex-1 space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-500">Judul Pilar</label>
                      <Input
                        value={it.title}
                        onChange={(e) => updateItem(idx, "title", e.target.value)}
                        placeholder="Contoh: Export Quality"
                        className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-500">Deskripsi Singkat</label>
                      <textarea
                        value={it.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                        placeholder="Jelaskan secara singkat nilai pilar ini..."
                        className="w-full h-24 bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:bg-white rounded-lg text-sm p-4 outline-none transition-all placeholder:text-slate-400 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
