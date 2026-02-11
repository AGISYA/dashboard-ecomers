"use client";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useUpdateProduct } from "@/hooks/useUpdateProduct";
import { useCategories } from "@/hooks/useCategories";
import { useRooms } from "@/hooks/useRooms";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const update = useUpdateProduct(id);
  const { data: cats } = useCategories();
  const { data: rooms } = useRooms();
  const router = useRouter();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [priceText, setPriceText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) {
        const j = await res.json();
        setName(j.name);
        setCategoryId(j.categoryId);
        setRoomId(j.roomId || "");
        setPrice(j.price);
        setPriceText(String(j.price).replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        if (Array.isArray(j.images) && j.images.length) {
          setImages(j.images);
        } else if (j.imageUrl) {
          setImages([j.imageUrl]);
        } else {
          setImages([]);
        }
        setActive(j.active);
        setDescription(j.description);
      }
    })();
  }, [id]);

  async function handleUploadFiles(files?: FileList | null) {
    if (!files || files.length === 0) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      // optionally surface via UI state
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
        }
      } catch {
        break;
      }
    }
    if (uploaded.length) setImages((prev) => [...prev, ...uploaded]);
  }

  async function onConfirm() {
    await update.mutateAsync({
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
      <div>
        <label className="block text-sm mb-1">Nama</label>
        <input
          className="border rounded px-3 py-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        <label className="block text-sm mb-1">Harga</label>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
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
        title="Simpan Perubahan?"
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
