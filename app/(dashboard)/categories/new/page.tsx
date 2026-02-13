"use client";

import { useCreateCategory } from "@/hooks/useCreateCategory";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Layers, CheckCircle2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function NewCategoryPage() {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const create = useCreateCategory();
  const router = useRouter();

  async function onConfirm() {
    await create.mutateAsync({ name, active });
    router.replace("/categories");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700">
      <PageHeader
        title="Tambah Kategori"
        description="Buat klasifikasi produk baru untuk mengorganisir katalog Anda."
        actions={
          <Link href="/categories">
            <Button variant="ghost" className="text-slate-400 hover:text-slate-900 group">
              <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
              Kembali
            </Button>
          </Link>
        }
      />

      <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 py-6 px-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-slate-900 flex items-center justify-center">
              <Layers className="size-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Detail Kategori</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">Tentukan nama dan status publikasi</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Nama Kategori</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kursi Ruang Tamu, Meja Makan..."
              className="h-14 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm px-5 transition-all font-medium"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200/50 text-slate-400'}`}>
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Status Visibilitas</p>
                <p className="text-[10px] text-slate-400 font-medium">Kategori akan langsung muncul di etalase jika aktif</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="size-6 rounded-lg border-slate-200 text-slate-900 focus:ring-slate-900 transition-all cursor-pointer"
            />
          </div>

          <div className="pt-4">
            <ConfirmDialog
              title="Simpan Kategori Baru?"
              description="Pastikan nama kategori sudah benar sebelum disimpan."
              onConfirm={onConfirm}
              trigger={
                <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5">
                  <Save className="mr-2 size-4" />
                  Simpan Kategori
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
