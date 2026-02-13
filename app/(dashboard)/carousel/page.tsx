"use client";

import { useCarousel, Slide } from "@/hooks/useCarousel";
import { useUpdateCarousel } from "@/hooks/useUpdateCarousel";
import { useEffect, useRef, useState, startTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, X, Save, Upload, Loader2, Image as ImageIcon, Sparkles, CheckCircle2, LayoutGrid } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";

export default function CarouselPage() {
  const { data, refetch, isLoading } = useCarousel();
  const update = useUpdateCarousel();
  const [slides, setSlides] = useState<Slide[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      startTransition(() => {
        setSlides(Array.isArray(data.slides) ? data.slides : []);
      });
    }
  }, [data]);

  async function handleUploadFiles(files?: FileList | null) {
    if (!files || files.length === 0) return;
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      try {
        const res = await fetch("/api/upload/image", {
          method: "POST",
          body: fd,
        });
        const j = await res.json().catch(() => ({}));
        if (res.ok) {
          const url = String(j.publicUrl || "").trim();
          uploaded.push(url);
        }
      } catch {
        break;
      }
    }
    if (uploaded.length) {
      setSlides((prev) => [
        ...prev,
        ...uploaded.map((url) => ({
          imageUrl: url,
          title: "",
          subTitle: "",
          buttonText: "Shop Now",
        })),
      ]);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeSlide(index: number) {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSlide(index: number, field: keyof Slide, value: string) {
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  }

  async function saveConfig() {
    setIsSaving(true);
    try {
      await update.mutateAsync({ slides });
      await refetch();
      setSuccessMsg("Hero configuration published successfully.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader
        title="Carousel Hero"
        description="Kelola pengalaman visual utama di halaman depan dengan mengatur gambar carousel yang menarik."
        actions={
          successMsg && (
            <div className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100 animate-in fade-in duration-300">
              <CheckCircle2 className="size-3.5 mr-1.5 inline text-emerald-500" />
              {successMsg}
            </div>
          )
        }
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleUploadFiles(e.target.files)}
      />
      <div className="flex items-center gap-3 justify-end">
        <Button onClick={() => fileRef.current?.click()} variant="outline" className="rounded-lg border-slate-200 font-semibold text-xs uppercase tracking-wide h-9 px-4">
          <Plus className="mr-2 size-3.5" />
          Tambah Slide Baru
        </Button>
        <Button
          onClick={saveConfig}
          disabled={isSaving || update.isPending}
          className="rounded-lg shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 font-semibold text-xs uppercase tracking-wide h-9 px-5"
        >
          {isSaving ? (
            <Loader2 className="mr-2 size-3.5 animate-spin" />
          ) : (
            <Save className="mr-2 size-3.5" />
          )}
          Publikasikan Layout
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 space-y-4 text-slate-300">
          <Loader2 className="size-12 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading gallery...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-800">
              <Sparkles className="size-4 text-slate-400" />
              <h3 className="text-sm font-semibold">Slide inventory</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full uppercase">
              {slides.length} Entities
            </span>
          </div>
          <div className="p-24 flex flex-col items-center justify-center text-center space-y-6">
            <div className="size-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
              <ImageIcon className="size-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-800">Gallery is Empty</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">Upload cinematic visuals to showcase your furniture collections on the homepage.</p>
            </div>
            <Button
              onClick={() => fileRef.current?.click()}
              className="h-11 px-8 rounded-lg font-semibold text-sm"
            >
              Start Curating
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {slides.map((s, idx) => (
            <Card key={idx + s.imageUrl} className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white group animate-in zoom-in-95 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                <Image
                  src={s.imageUrl}
                  alt="Slide preview"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                <div className="absolute top-3 right-3 flex gap-2">
                  <div className="h-7 px-2.5 rounded-md bg-black/40 backdrop-blur-md text-white text-[10px] font-medium uppercase tracking-wide flex items-center justify-center border border-white/10">
                    Pos {idx + 1}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="size-7 rounded-md shadow-xl transition-all scale-90 group-hover:scale-100"
                    onClick={() => removeSlide(idx)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-emerald-500" /> Judul Utama
                  </label>
                  <Input
                    value={s.title}
                    onChange={(e) => updateSlide(idx, "title", e.target.value)}
                    placeholder="Grand Furniture Sale"
                    className="h-9 bg-slate-50 border-slate-200 focus:bg-white rounded-lg shadow-inner font-semibold text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-500">Sub-judul Sekunder</label>
                  <Input
                    value={s.subTitle}
                    onChange={(e) => updateSlide(idx, "subTitle", e.target.value)}
                    placeholder="Diskon hingga 70%"
                    className="h-9 bg-slate-50 border-slate-200 focus:bg-white rounded-lg shadow-inner font-medium text-sm italic"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                    <LayoutGrid className="size-3.5" /> Label Tombol CTA
                  </label>
                  <Input
                    value={s.buttonText}
                    onChange={(e) => updateSlide(idx, "buttonText", e.target.value)}
                    placeholder="Belanja Sekarang"
                    className="h-10 bg-slate-50 border-transparent focus:bg-white rounded-xl shadow-inner font-bold text-slate-900"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <div
            onClick={() => fileRef.current?.click()}
            className="aspect-video w-full rounded-2xl border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/30 hover:bg-slate-50/50 transition-all group"
          >
            <div className="size-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:text-primary transition-all duration-500">
              <Plus className="size-8" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tambah Slide Baru</p>
          </div>
        </div>
      )}
    </div>
  );
}
