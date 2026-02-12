"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  Mail,
  Instagram,
  MessageSquare,
  Trash2,
  CheckCircle2,
  Plus,
  Navigation,
  Layout,
  Share2,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type FooterLink = {
  id: string;
  group: string;
  label: string;
  url: string;
  order: number;
  active: boolean;
};

export default function FooterPage() {
  const [aboutText, setAboutText] = useState("");
  const [copyright, setCopyright] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [links, setLinks] = useState<FooterLink[]>([]);

  const [group, setGroup] = useState("Shop");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await fetch("/api/footer/settings");
      if (s.ok) {
        const sj = await s.json();
        if (sj) {
          setAboutText(sj.aboutText || "");
          setCopyright(sj.copyright || "");
          setEmail(sj.email || "");
          setInstagram(sj.instagram || "");
          setWhatsapp(sj.whatsapp || "");
          setLogoUrl(sj.logoUrl || "");
        }
      }
      const l = await fetch("/api/footer/links");
      if (l.ok) {
        const lj = await l.json();
        setLinks(lj || []);
      }
    })();
  }, []);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  async function saveSettings() {
    try {
      const res = await fetch("/api/footer/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aboutText, copyright, email, instagram, whatsapp, logoUrl }),
      });
      if (res.ok) {
        setSuccessMsg("Brand settings published.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function addLink() {
    const res = await fetch("/api/footer/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group, label, url, order, active }),
    });
    if (res.ok) {
      setGroup("Shop");
      setLabel("");
      setUrl("");
      setOrder(0);
      setActive(true);
      const l = await fetch("/api/footer/links");
      if (l.ok) {
        setLinks(await l.json());
        setSuccessMsg("Navigation link indexed.");
      }
    }
  }

  async function updateLink(id: string, partial: Partial<FooterLink>) {
    const res = await fetch(`/api/footer/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    if (res.ok) {
      const l = await fetch("/api/footer/links");
      if (l.ok) {
        setLinks(await l.json());
      }
    }
  }

  async function removeLink(id: string) {
    const res = await fetch(`/api/footer/links/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLinks((prev) => prev.filter((x) => x.id !== id));
      setSuccessMsg("Link removed.");
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader
        title="Pengaturan Footer"
        description="Sinkronkan sumber daya brand global untuk bagian bawah etalase, tautan sosial, dan navigasi internal."
        actions={
          successMsg && (
            <div className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100 animate-in fade-in duration-700">
              <CheckCircle2 className="size-3.5 mr-1.5 inline text-emerald-500" />
              {successMsg}
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 py-4 px-6">
              <div className="flex items-center gap-2.5 text-slate-800">
                <Layout className="size-4 text-slate-400" />
                <CardTitle className="text-sm font-semibold">Identitas Korporat</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500">Abstrak Korporat</label>
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  placeholder="Misi brand secara detail..."
                  className="w-full h-32 bg-white border border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg text-sm p-4 outline-none transition-all leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500">URL Sumber Logo</label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://fursia.com/logo.svg"
                  className="bg-white border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg text-xs font-mono py-5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500">Hak Cipta Hukum</label>
                <Input
                  value={copyright}
                  onChange={(e) => setCopyright(e.target.value)}
                  placeholder="Copyright © 2026 FURSIA. Hak cipta dilindungi undang-undang."
                  className="bg-white border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg text-xs font-mono py-5"
                />
              </div>

              <ConfirmDialog
                title="Publikasikan Branding Footer?"
                description="Ini akan langsung berdampak pada seluruh footer etalase."
                onConfirm={saveSettings}
                trigger={
                  <Button className="w-full h-12 rounded-lg shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-semibold text-sm">
                    Publikasikan Perubahan
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-12">
          <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 py-4 px-6">
              <div className="flex items-center gap-2.5 text-slate-800">
                <Share2 className="size-4 text-slate-400" />
                <CardTitle className="text-sm font-semibold">Ekosistem Sosial</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {[
                { label: "Email Kontak", value: email, setter: setEmail, icon: Mail },
                { label: "Username Instagram", value: instagram, setter: setInstagram, icon: Instagram },
                { label: "Nomor WhatsApp", value: whatsapp, setter: setWhatsapp, icon: MessageSquare },
              ].map((s, idx) => (
                <div key={idx} className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-500">{s.label}</label>
                  <div className="relative group">
                    <s.icon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <Input
                      value={s.value}
                      onChange={(e) => s.setter(e.target.value)}
                      placeholder="Contoh: hello@fursia.com"
                      className="bg-white border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg text-xs font-medium pl-9 h-11"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-12">
          <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 py-4 px-6">
              <div className="flex items-center gap-2.5 text-slate-800">
                <Navigation className="size-4 text-slate-400" />
                <CardTitle className="text-sm font-semibold">Arsitektur Navigasi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-8 bg-slate-50/40 border-b border-slate-50 flex flex-col xl:flex-row gap-6 items-end">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-500">Judul Grup</label>
                    <Input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Contoh: Unggulan Toko" className="bg-white border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg font-semibold h-12" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-500">Nama Label</label>
                    <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Contoh: Koleksi Terbaru" className="bg-white border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg font-semibold h-12" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-500">Path Sistem</label>
                    <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/products/new" className="bg-white border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg text-xs font-mono py-5" />
                  </div>
                </div>
                <div className="flex gap-4 items-end w-full xl:w-fit">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-500">Indeks</label>
                    <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="h-12 w-20 bg-white border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg text-center font-semibold" />
                  </div>
                  <Button onClick={addLink} className="h-12 px-8 font-semibold rounded-lg shadow-lg shadow-primary/10 text-sm flex-1 xl:flex-none">Indeks Tautan</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-slate-800 mb-4 px-8 pt-8">
                  <Sparkles className="size-4 text-amber-500" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Manifes navigasi saat ini</h4>
                </div>

                <div className="bg-slate-50/20 border border-slate-100 rounded-lg overflow-hidden mx-8 mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-20">Urutan</th>
                        <th className="px-6 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Label Referensi</th>
                        <th className="px-6 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tujuan</th>
                        <th className="px-6 py-2.5 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {links.map((it) => (
                        <tr key={it.id} className="group hover:bg-white transition-colors border-b border-slate-100 last:border-0">
                          <td className="px-6 py-3">
                            <Input
                              type="number"
                              value={it.order}
                              onChange={(e) => updateLink(it.id, { order: Number(e.target.value) })}
                              className="h-7 w-12 text-center border-slate-100 bg-white rounded text-[10px] font-bold"
                            />
                          </td>
                          <td className="px-6 py-3">
                            <input
                              value={it.label}
                              onChange={(e) => updateLink(it.id, { label: e.target.value })}
                              className="bg-transparent border-transparent hover:border-slate-100 focus:bg-white transition-all rounded px-2 py-1 font-semibold text-slate-800 text-xs w-full outline-none"
                            />
                          </td>
                          <td className="px-6 py-3 font-mono text-[10px] text-slate-400">
                            {it.url}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <ConfirmDialog
                              title="Permanent Removal?"
                              description="This link will be removed from navigation."
                              onConfirm={() => removeLink(it.id)}
                              trigger={
                                <Button variant="ghost" size="icon" className="size-8 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 className="size-3.5" />
                                </Button>
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
