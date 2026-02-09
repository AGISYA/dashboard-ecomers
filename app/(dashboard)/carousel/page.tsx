"use client";
import Topbar from "@/components/layout/Topbar";
import { useCarousel } from "@/hooks/useCarousel";
import { useUpdateCarousel } from "@/hooks/useUpdateCarousel";
import { useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function CarouselPage() {
  const { data, refetch } = useCarousel();
  const update = useUpdateCarousel();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [active, setActive] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUploadFiles(files?: FileList | null) {
    if (!files || files.length === 0) return;
    // Jika banyak file: langsung buat banyak slide
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
        await update.mutateAsync({
          imageUrl: url,
          title,
          link,
          sortOrder,
          active,
        });
      }
    }
    // refresh list
    refetch();
  }

  async function addSlide() {
    if (!imageUrl) return;
    await update.mutateAsync({ imageUrl, title, link, sortOrder, active });
    setTitle("");
    setLink("");
    setSortOrder(0);
    setActive(true);
    setImageUrl("");
    refetch();
  }

  return (
    <div>
      <Topbar title="Carousel" />
      <div className="container px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4 card p-4">
          <div>
            <label className="block text-sm mb-1">Gambar</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUploadFiles(e.target.files)}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              Upload Gambar
            </Button>
            {imageUrl && (
              <div className="mt-2 h-24 w-24 relative">
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Link</label>
            <input
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Sort Order</label>
            <input
              type="number"
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <span>Aktif</span>
          </div>
          <button onClick={addSlide} className="btn btn-primary">
            Tambah
          </button>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data ?? []).map((item) => (
            <div key={item.id} className="card p-3">
              <div className="h-32 w-full relative">
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="mt-2 text-sm">
                <div className="font-medium">
                  {item.title || "(tanpa judul)"}
                </div>
                <div className="text-gray-600">{item.link || "-"}</div>
                <div className="text-gray-600">Sort: {item.sortOrder}</div>
                <div className="text-gray-600">
                  Aktif: {item.active ? "Ya" : "Tidak"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
