"use client";
import Topbar from "@/components/layout/Topbar";
import { useCarousel, Slide } from "@/hooks/useCarousel";
import { useUpdateCarousel } from "@/hooks/useUpdateCarousel";
import { useEffect, useRef, useState, startTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, X, Save, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CarouselPage() {
  const { data, refetch, isLoading } = useCarousel();
  const update = useUpdateCarousel();
  const [slides, setSlides] = useState<Slide[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    // Show loading state or toast ideally, for now just await
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: fd,
      });
      const j = await res.json();
      if (res.ok) {
        const url = String(j.publicUrl || "")
          .trim()
          .replace(/[)\s]+$/g, "");
        uploaded.push(url);
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
    // Reset input
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
      // Ideally show success toast
    } catch (e) {
      console.error(e);
      // Ideally show error toast
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Carousel Manager
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your homepage hero slides.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUploadFiles(e.target.files)}
          />
          <Button onClick={() => fileRef.current?.click()} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Slide
          </Button>
          <Button onClick={saveConfig} disabled={isSaving || update.isPending}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-slate-50 text-muted-foreground">
          <Upload className="h-10 w-10 mb-4 opacity-50" />
          <p className="text-lg font-medium">No slides active</p>
          <p className="text-sm">Upload an image to get started</p>
          <Button
            onClick={() => fileRef.current?.click()}
            className="mt-4"
            variant="secondary"
          >
            Upload Image
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((s, idx) => (
            <Card key={idx + s.imageUrl} className="overflow-hidden group">
              <div className="relative aspect-video w-full bg-slate-100">
                <Image
                  src={s.imageUrl}
                  alt="Slide preview"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeSlide(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded backdrop-blur-sm">
                  Slide {idx + 1}
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Title
                  </label>
                  <Input
                    value={s.title}
                    onChange={(e) => updateSlide(idx, "title", e.target.value)}
                    placeholder="Slide Title"
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Subtitle
                  </label>
                  <Input
                    value={s.subTitle}
                    onChange={(e) =>
                      updateSlide(idx, "subTitle", e.target.value)
                    }
                    placeholder="Slide Subtitle"
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Button Text
                  </label>
                  <Input
                    value={s.buttonText}
                    onChange={(e) =>
                      updateSlide(idx, "buttonText", e.target.value)
                    }
                    placeholder="CTA Button"
                    className="h-8"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
