"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, X, Search, Newspaper, Filter, Trash2, Globe, Calendar, CheckCircle2, Plus, Sparkles, Layout, Link as LinkIcon, Edit } from "lucide-react";
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
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: fd,
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        const url = String(j.publicUrl || "").trim();
        setImageUrl(url);
      }
    } catch { }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function create() {
    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        slug,
        excerpt,
        imageUrl,
        publishedAt,
        active,
      }),
    });
    if (res.ok) {
      setTitle("");
      setCategory("Berita");
      setSlug("");
      setExcerpt("");
      setImageUrl("");
      setPublishedAt("");
      setActive(true);
      refetch();
      setSuccessMsg("Berita berhasil ditambahkan ke publikasi.");
    }
  }

  async function saveSettings() {
    const res = await fetch("/api/news/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: stitle,
        buttonText: sbtnText,
        buttonLink: sbtnLink,
      }),
    });
    if (res.ok) {
      refetchSettings();
      setSuccessMsg("Pengaturan news berhasil diperbarui.");
    }
  }

  async function update(id: string, partial: Partial<NewsItem>) {
    const res = await fetch(`/api/news/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    if (res.ok) {
      refetch();
      setSuccessMsg("Berita berhasil diperbarui.");
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
    if (res.ok) {
      refetch();
      setSuccessMsg("Berita berhasil dihapus.");
    }
  }

  const filteredNews = (data ?? []).filter(it =>
    it.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    it.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader
        title="Publikasi News & Artikel"
        description="Kelola narasi brand dan konten editorial global di sini."
        actions={
          successMsg && (
            <div className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100 animate-in fade-in duration-300">
              <CheckCircle2 className="size-3.5 mr-1.5 inline text-emerald-500" />
              {successMsg}
            </div>
          )
        }
      />

      <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 p-5 px-6 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5 text-slate-800">
            <Layout className="size-4 text-slate-400" />
            <CardTitle className="text-sm font-semibold">Konfigurasi Umum News</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 text-uppercase tracking-wider">Judul Halaman Utama</label>
              <Input
                value={stitle}
                onChange={(e) => setStitle(e.target.value)}
                placeholder="News"
                className="bg-white border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 text-uppercase tracking-wider">Teks Tombol Navigasi</label>
              <Input
                value={sbtnText}
                onChange={(e) => setSbtnText(e.target.value)}
                placeholder="See all news"
                className="bg-white border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 text-uppercase tracking-wider">Link Redirect Utama</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <Input
                  value={sbtnLink}
                  onChange={(e) => setSbtnLink(e.target.value)}
                  placeholder="/blogs/news"
                  className="bg-white border-slate-200 rounded-lg pl-9 text-xs font-mono"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-50 flex justify-end">
            <Button onClick={saveSettings} className="bg-slate-900 text-white rounded-lg px-8 h-10 text-xs font-bold uppercase tracking-widest hover:bg-slate-800">
              Perbarui Konfigurasi
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 p-5 px-6 flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2.5 text-slate-800">
                <Sparkles className="size-4 text-slate-400" />
                <CardTitle className="text-sm font-semibold">Publikasi Baru</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-500">Gambar Utama (Visual)</label>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadFiles(e.target.files)} />
                    <div
                      className="relative aspect-video rounded-lg border border-dashed border-slate-200 bg-slate-50/50 overflow-hidden flex flex-col items-center justify-center group cursor-pointer hover:bg-slate-50 transition-all shadow-inner"
                      onClick={() => fileRef.current?.click()}
                    >
                      {!imageUrl ? (
                        <div className="text-center p-6 space-y-2">
                          <Upload className="size-6 text-slate-300 mx-auto" />
                          <p className="text-[11px] font-medium text-slate-400 italic font-bold">Upload Visual</p>
                        </div>
                      ) : (
                        <>
                          <Image src={imageUrl} alt="preview" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                            <Button variant="secondary" className="rounded-lg text-[10px] font-semibold h-8 bg-white/90 text-slate-900 border-none shadow-sm">Ganti media</Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-3 px-4 bg-slate-50/50 rounded-lg border border-slate-100">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-slate-800">Visibilitas Publik</span>
                      <span className="text-[10px] text-slate-400 font-medium italic">Langsung publikasikan</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-500">Judul (Kategori/Label)</label>
                      <Input
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Berita, Event, atau Promo"
                        className="h-10 bg-white border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg font-medium shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-500">Judul Berita (Utama)</label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Koleksi Teakwood Terbaru 2026"
                        className="h-10 bg-white border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg font-bold shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-500">URL Identitas (Slug)</label>
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="koleksi-teakwood-terbaru-2026"
                        className="bg-white border-slate-200 rounded-lg font-mono text-[11px] text-slate-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-500">Tanggal Terbit</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                        <Input
                          type="date"
                          value={publishedAt}
                          onChange={(e) => setPublishedAt(e.target.value)}
                          className="bg-white border-slate-200 rounded-lg pl-9 text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-500">Deskripsi Berita (Narasi)</label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Tuliskan isi atau ringkasan berita di sini..."
                      className="w-full h-40 bg-white border border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg text-sm p-4 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-4">
                    <ConfirmDialog
                      title="Publikasikan draf saat ini?"
                      description="Berita ini akan segera terlihat oleh semua pelanggan."
                      onConfirm={create}
                      trigger={
                        <Button className="w-full lg:w-fit h-11 px-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest">
                          Simpan & Terbitkan
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-12 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-slate-800">
                <Newspaper className="size-4 text-slate-400" />
                <h3 className="text-sm font-semibold">Log Publikasi</h3>
              </div>

              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter catatan..."
                  className="min-w-[280px] h-9 bg-white border-slate-200 rounded-lg pl-9 pr-4 text-xs font-medium outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 border shadow-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-8 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-40">Tanggal Rilis</th>
                    <th className="px-8 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Detail Editorial</th>
                    <th className="px-8 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-32">Visibilitas</th>
                    <th className="px-8 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredNews.map((it, idx) => (
                    <tr key={it.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-700 italic">
                          <Calendar className="size-3 text-slate-300" />
                          <Input
                            type="date"
                            value={it.publishedAt?.slice(0, 10) || ""}
                            onChange={(e) => update(it.id, { publishedAt: e.target.value })}
                            className="bg-transparent border-none p-0 focus:ring-0 font-bold text-xs h-auto w-fit"
                          />
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex gap-6">
                          {it.imageUrl && (
                            <div className="relative size-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-50 shrink-0 transform -rotate-1 group-hover:rotate-0 transition-transform">
                              <Image src={it.imageUrl} alt={it.title} fill className="object-cover" />
                            </div>
                          )}
                          <div className="space-y-3 flex-1 min-w-0">
                            <div className="flex flex-col gap-1">
                              <input
                                value={it.category}
                                onChange={(e) => update(it.id, { category: e.target.value })}
                                placeholder="Judul/Kategori"
                                className="w-full bg-transparent border-transparent hover:border-slate-100 focus:bg-white focus:border-primary/20 transition-all rounded-lg font-bold text-slate-400 text-[10px] uppercase tracking-wider p-0 focus:p-1 outline-none"
                              />
                              <input
                                value={it.title}
                                onChange={(e) => update(it.id, { title: e.target.value })}
                                placeholder="Judul Utama"
                                className="w-full bg-transparent border-transparent hover:border-slate-100 focus:bg-white focus:border-primary/20 transition-all rounded-lg font-black text-slate-900 text-lg p-0 focus:p-1 outline-none"
                              />
                            </div>
                            <textarea
                              value={it.excerpt}
                              onChange={(e) => update(it.id, { excerpt: e.target.value })}
                              onBlur={(e) => update(it.id, { excerpt: e.target.value })}
                              className="w-full bg-transparent border-transparent hover:border-slate-100 focus:bg-white focus:border-primary/20 transition-all rounded-lg text-xs font-medium text-slate-400 p-0 focus:p-1 outline-none resize-none leading-relaxed h-12"
                            />

                            <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} className="h-7 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5">Change Media</Button>
                              <span className="text-slate-200">|</span>
                              <ConfirmDialog
                                title="Delete Article Cover?"
                                onConfirm={() => update(it.id, { imageUrl: null })}
                                trigger={<Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-destructive hover:bg-destructive/5">Remove Visual</Button>}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-center text-center">
                        <ConfirmDialog
                          title={it.active ? "Withdraw Publication?" : "Restore Publication?"}
                          onConfirm={() => update(it.id, { active: !it.active })}
                          trigger={
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all",
                              it.active ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                            )}>
                              <Globe className={cn("size-3", it.active ? "animate-spin-slow" : "")} />
                              {it.active ? "Live" : "Draft"}
                            </div>
                          }
                        />
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex justify-end pr-2">
                          <ConfirmDialog
                            title="Permanent Deletion?"
                            description="This will remove the news item from our database forever."
                            onConfirm={() => remove(it.id)}
                            trigger={
                              <Button variant="ghost" size="icon" className="size-10 rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="size-5" />
                              </Button>
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredNews.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 max-w-xs mx-auto text-slate-200">
                          <div className="size-20 rounded-3xl bg-slate-50 flex items-center justify-center">
                            <Newspaper className="size-10" />
                          </div>
                          <p className="text-xs font-black uppercase tracking-widest">No matching articles</p>
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
