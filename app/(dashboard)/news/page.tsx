"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Upload,
  Search,
  Newspaper,
  Trash2,
  Globe,
  Calendar,
  CheckCircle2,
  Plus,
  Sparkles,
  Layout,
  Link as LinkIcon,
  Save,
  Clock,
  Tag,
  FileText,
  ChevronRight,
  Monitor
} from "lucide-react";
import { useNews, type NewsItem } from "@/hooks/useNews";
import { useNewsSettings } from "@/hooks/useNewsSettings";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function NewsPage() {
  const { data, refetch } = useNews();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Berita");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [active, setActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: settings, refetch: refetchSettings } = useNewsSettings();
  const [stitle, setStitle] = useState("");
  const [sbtnText, setSbtnText] = useState("");
  const [sbtnLink, setSbtnLink] = useState("");

  useEffect(() => {
    if (settings) {
      setStitle(settings.title || "");
      setSbtnText(settings.buttonText || "");
      setSbtnLink(settings.buttonLink || "");
    }
  }, [settings]);

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
      const res = await fetch("/api/upload/image", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        const url = String(j.publicUrl || "").trim();
        setImageUrl(url);
      }
    } catch { }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function create() {
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, slug, excerpt, imageUrl, publishedAt, active }),
      });
      if (res.ok) {
        setTitle(""); setCategory("Berita"); setSlug(""); setExcerpt(""); setImageUrl(""); setPublishedAt(""); setActive(true);
        refetch();
        setSuccessMsg("Artikel diterbitkan.");
      } else {
        const j = await res.json().catch(() => ({}));
        setSuccessMsg(`Gagal: ${j.error || "Terjadi kesalahan sistem"}`);
      }
    } catch (err) {
      setSuccessMsg("Error: Tidak dapat terhubung ke server");
    }
  }

  async function saveSettings() {
    try {
      const res = await fetch("/api/news/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: stitle, buttonText: sbtnText, buttonLink: sbtnLink }),
      });
      if (res.ok) {
        refetchSettings();
        setSuccessMsg("Konfigurasi diupdate.");
      } else {
        setSuccessMsg("Gagal mengupdate konfigurasi.");
      }
    } catch {
      setSuccessMsg("Error koneksi server.");
    }
  }

  async function update(id: string, partial: Partial<NewsItem>) {
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      if (res.ok) {
        refetch();
        setSuccessMsg("Berita diperbarui.");
      } else {
        setSuccessMsg("Gagal memperbarui berita.");
      }
    } catch {
      setSuccessMsg("Error koneksi server.");
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        refetch();
        setSuccessMsg("Berita dihapus.");
      } else {
        setSuccessMsg("Gagal menghapus berita.");
      }
    } catch {
      setSuccessMsg("Error koneksi server.");
    }
  }

  const filteredNews = (data ?? []).filter(it =>
    it.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    it.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
      <PageHeader
        title="News & Artikel"
        description="Kelola narasi editorial dan publikasi berita terbaru untuk pelanggan."
        actions={
          <div className="flex items-center gap-3">
            {successMsg && (
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 animate-in slide-in-from-right-2">
                {successMsg}
              </div>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* News Settings */}
        <div className="lg:col-span-12">
          <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 py-4 px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
                    <Layout className="size-4 text-white" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900 uppercase">Navigasi Global News</CardTitle>
                </div>
                <Button onClick={saveSettings} className="h-9 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase shadow-md">
                  Update Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Halaman</label>
                  <Input value={stitle} onChange={(e) => setStitle(e.target.value)} className="h-12 bg-slate-50/50 border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Label Tombol</label>
                  <Input value={sbtnText} onChange={(e) => setSbtnText(e.target.value)} className="h-12 bg-slate-50/50 border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Link Tujuan</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <Input value={sbtnLink} onChange={(e) => setSbtnLink(e.target.value)} className="h-12 bg-slate-50/50 border-slate-200 rounded-xl pl-11 font-mono text-xs" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Publication */}
        <div className="lg:col-span-12">
          <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 py-5 px-8">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
                  <Sparkles className="size-4 text-white" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900">Publikasi Baru</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Thumbnail Cover</label>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadFiles(e.target.files)} />
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center group cursor-pointer hover:border-slate-900/10 hover:bg-slate-50 transition-all overflow-hidden"
                    >
                      {!imageUrl ? (
                        <div className="text-center p-6 space-y-2">
                          <Upload className="size-6 text-slate-300 mx-auto" />
                          <p className="text-[10px] font-bold text-slate-300 uppercase">Pilih Visual</p>
                        </div>
                      ) : (
                        <>
                          <Image src={imageUrl} alt="preview" fill className="object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                            <Button variant="secondary" className="rounded-xl text-[10px] font-bold h-8 bg-white border-none shadow-xl">Ganti Media</Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-lg flex items-center justify-center ${active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                        <Globe className="size-3.5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 uppercase">Live</span>
                    </div>
                    <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-5 rounded border-slate-200 text-slate-900 focus:ring-slate-900 cursor-pointer" />
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Label Kategori</label>
                      <div className="relative group">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Berita" className="h-12 bg-white border-slate-200 rounded-xl pl-12 font-bold" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Misal: Launching tukang BIKIN v2" className="h-12 bg-white border-slate-200 rounded-xl font-bold" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">SEO Slug</label>
                      <div className="relative group">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="launching-tukang-bikin-v2" className="h-12 bg-white border-slate-200 rounded-xl pl-12 font-mono text-xs" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Tanggal Terbit</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className="h-12 bg-white border-slate-200 rounded-xl pl-12 text-xs font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Ringkasan / Narasi</label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Tuliskan isi atau kutipan artikel di sini..."
                      className="w-full h-32 bg-white border border-slate-200 focus:ring-2 focus:ring-slate-900/5 rounded-2xl text-sm p-5 outline-none transition-all leading-relaxed font-medium resize-none placeholder:text-slate-300"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <ConfirmDialog
                      title="Publikasikan Artikel?"
                      onConfirm={create}
                      trigger={
                        <Button className="h-12 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest shadow-xl">
                          Terbitkan Sekarang
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Article Log */}
        <div className="lg:col-span-12">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
                  <Newspaper className="size-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">Log Publikasi</h3>
              </div>

              <div className="relative group min-w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari artikel atau kutipan..."
                  className="w-full h-11 bg-white border-slate-200 rounded-xl pl-11 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-900/5 border transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest w-48">Audit Trail</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Publikasi</th>
                    <th className="px-8 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32">Visibilitas</th>
                    <th className="px-8 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredNews.map((it) => (
                    <tr key={it.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-8 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded-md">
                            <Clock className="size-3" />
                            {it.publishedAt ? new Date(it.publishedAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex gap-6">
                          {it.imageUrl && (
                            <div className="relative size-24 rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0">
                              <Image src={it.imageUrl} alt={it.title} fill className="object-cover" />
                            </div>
                          )}
                          <div className="space-y-3 flex-1 min-w-0">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{it.category}</p>
                              <h4 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">{it.title}</h4>
                            </div>
                            <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{it.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-center sm:align-middle">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          it.active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                        )}>
                          {it.active ? "Published" : "Draft"}
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right sm:align-middle">
                        <ConfirmDialog
                          title="Hapus Artikel?"
                          onConfirm={() => remove(it.id)}
                          trigger={
                            <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                              <Trash2 className="size-4" />
                            </Button>
                          }
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredNews.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <Newspaper className="size-10" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Tidak ada artikel ditemukan</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
