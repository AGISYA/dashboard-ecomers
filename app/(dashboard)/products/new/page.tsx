"use client";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useCreateProduct } from "@/hooks/useCreateProduct";
import { useCategories } from "@/hooks/useCategories";
import { useRooms } from "@/hooks/useRooms";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function NewProductPage() {
  const { data: cats } = useCategories();
  const { data: rooms } = useRooms();
  const create = useCreateProduct();
  const router = useRouter();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [priceText, setPriceText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUploadFiles(files?: FileList | null) {
    if (!files || files.length === 0) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setError("Tidak ada koneksi internet. Upload membutuhkan koneksi.");
      return;
    }
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
          const url = String(j.publicUrl || "")
            .trim()
            .replace(/[)\\s]+$/g, "");
          uploaded.push(url);
        } else {
          setError(j.error || "Upload gagal");
        }
      } catch {
        setError("Gagal upload: koneksi terputus");
        break;
      }
    }
    if (uploaded.length) setImages((prev) => [...prev, ...uploaded]);
  }

  async function onConfirm() {
    setError(null);
    await create.mutateAsync({
      name,
      categoryId,
      roomId: roomId || undefined,
      price,
      imageUrls: images,
      active,
      description,
    });
    router.replace("/products");
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1">Nama</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama produk"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Kategori</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Pilih kategori</option>
          {cats?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Ruangan</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        >
          <option value="">Pilih ruangan</option>
          {rooms?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Harga</label>
        <Input
          type="text"
          value={priceText}
          onChange={(e) => {
            const raw = e.target.value;
            const digits = raw.replace(/\D/g, "");
            const num = Number(digits || "0");
            setPrice(num);
            const formatted = digits
              ? digits.replace(/^0+/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              : "";
            setPriceText(formatted);
          }}
          placeholder="contoh: 90.000"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Gambar</label>
        <Input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          multiple
          onChange={(e) => handleUploadFiles(e.target.files)}
        />
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          Upload Gambar
        </Button>
        {images.length > 0 && (
          <div className="mt-2 grid grid-cols-4 gap-3">
            {images.map((url) => (
              <div key={url} className="h-24 w-full relative">
                <Image
                  src={url}
                  alt="preview"
                  fill
                  className="object-cover rounded"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        <span>Aktif</span>
      </div>
      <div>
        <label className="block text-sm mb-1">Deskripsi</label>
        <textarea
          className="border rounded px-3 py-2 w-full"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <ConfirmDialog
        title="Simpan Produk?"
        description="Data akan disimpan dan ditampilkan di daftar."
        onConfirm={onConfirm}
        trigger={
          <button className="px-3 py-2 bg-black text-white rounded">
            Simpan
          </button>
        }
      />
    </div>
  );
}
