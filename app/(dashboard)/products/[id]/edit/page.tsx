"use client";

import { useUpdateProduct } from "@/hooks/useUpdateProduct";
import { useCategories } from "@/hooks/useCategories";
import { useRooms } from "@/hooks/useRooms";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Package,
  ArrowLeft,
  Upload,
  X,
  CheckCircle2,
  ShoppingBag,
  Layers,
  Home,
  FileText,
  Save,
} from "lucide-react";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

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
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const j = await res.json();
          setName(j.name || "");
          setCategoryId(j.categoryId || "");
          setRoomId(j.roomId || "");
          setPrice(j.price || 0);
          setPriceText(String(j.price || 0).replace(/\B(?=(\d{3})+(?!\d))/g, "."));
          if (Array.isArray(j.images) && j.images.length) {
            setImages(j.images);
          } else if (j.imageUrl) {
            setImages([j.imageUrl]);
          } else {
            setImages([]);
          }
          setActive(j.active ?? true);
          setDescription(j.description || "");
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      }
    })();
  }, [id]);

  async function handleUploadFiles(files?: FileList | null) {
    if (!files || files.length === 0) return;
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      try {
        const res = await fetch("/api/upload/image", { method: "POST", body: fd });
        const j = await res.json().catch(() => ({}));
        if (res.ok) {
          uploaded.push(String(j.publicUrl || "").trim());
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (uploaded.length) setImages((prev) => [...prev, ...uploaded]);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onConfirm() {
    setError(null);
    try {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan perubahan";
      setError(message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
      <PageHeader
        title="Edit Produk"
        description="Perbarui informasi dan detail produk Anda."
        actions={
          <Link href="/products">
            <Button variant="ghost" className="text-slate-400 hover:text-slate-900 group">
              <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
              Kembali
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 py-5 px-8">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
                  <Package className="size-4 text-white" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900">Informasi Produk</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Nama Produk</label>
                <div className="relative group">
                  <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Sofa Minimalis Velvet Blue"
                    className="h-14 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Kategori</label>
                  <div className="relative group">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 z-10" />
                    <select
                      className="w-full h-14 bg-slate-50/50 border border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 pr-4 outline-none transition-all font-medium appearance-none"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Pilih Kategori</option>
                      {cats?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Ruangan</label>
                  <div className="relative group">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 z-10" />
                    <select
                      className="w-full h-14 bg-slate-50/50 border border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 pr-4 outline-none transition-all font-medium appearance-none"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                    >
                      <option value="">Pilih Ruangan</option>
                      {rooms?.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Harga (Rp)</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 font-bold text-xs border-r border-slate-200 pr-3">
                    Rp
                  </div>
                  <Input
                    type="text"
                    value={priceText}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      const num = Number(digits || "0");
                      setPrice(num);
                      setPriceText(digits.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
                    }}
                    placeholder="0"
                    className="h-14 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-16 transition-all font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Deskripsi Produk</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-5 size-4 text-slate-300" />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan detail material, ukuran, dan keunggulan produk..."
                    className="w-full h-40 bg-slate-50/50 border border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm p-5 pl-12 outline-none transition-all leading-relaxed font-medium placeholder:text-slate-300 resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Images & Status */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 py-5 px-8">
              <CardTitle className="text-sm font-bold text-slate-900">Media Produk</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                multiple
                onChange={(e) => handleUploadFiles(e.target.files)}
              />

              <div
                onClick={() => fileRef.current?.click()}
                className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center group cursor-pointer hover:border-slate-900/20 hover:bg-slate-50 transition-all overflow-hidden"
              >
                <div className="size-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                  <Upload className="size-6" />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-[11px] font-bold text-slate-900">Upload Media</p>
                  <p className="text-[9px] text-slate-400 font-medium">Bisa pilih banyak gambar</p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                      <Image src={url} alt="Product" fill className="object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImages(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 size-6 rounded-lg bg-white/90 shadow-sm flex items-center justify-center text-red-500 transition-opacity"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`size-8 rounded-lg flex items-center justify-center ${active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <CheckCircle2 className="size-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Terbitkan</span>
            </div>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="size-5 rounded border-slate-200 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <ConfirmDialog
            title="Simpan Perubahan?"
            description="Pastikan data yang diubah sudah benar."
            onConfirm={onConfirm}
            trigger={
              <Button className="w-full h-14 rounded-3xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5">
                <Save className="mr-2 size-4" />
                Simpan Perubahan
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
