"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, User, Phone, Mail, Lock, Shield, CheckCircle2, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/ui/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function NewAdminPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: me } = useAuth();

  if (me && me.role !== "SUPER_ADMIN") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
        <PageHeader
          title="Tambah Administrator"
          description="Hanya Super Admin yang memiliki otoritas untuk menambah admin baru."
          actions={
            <Link href="/pengguna">
              <Button variant="ghost" className="text-slate-400">
                <ArrowLeft className="mr-2 size-4" /> Kembali
              </Button>
            </Link>
          }
        />
        <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl text-center">
          <Shield className="size-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-slate-900 font-bold">Akses Terbatas</h3>
          <p className="text-slate-400 text-sm mt-1">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  async function onConfirm() {
    setLoading(true);
    setError(null);
    if (!name || !password || (!phone && !email)) {
      setLoading(false);
      setError("Nama dan password wajib. Isi salah satu: WhatsApp atau Email.");
      return;
    }

    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password, role, active }),
      });

      if (res.ok) {
        router.push("/pengguna");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Gagal membuat admin");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
      <PageHeader
        title="Create Administrator"
        description="Tambah personel admin baru untuk mengelola operasional toko."
        actions={
          <Link href="/pengguna">
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

      <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 py-6 px-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-slate-900 flex items-center justify-center">
              <ShieldCheck className="size-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Privilese Admin</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">Atur kredensial dan tingkat akses administrator</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Nama Admin</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 transition-colors" />
                <Input
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">WhatsApp Business</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 transition-colors" />
                <Input
                  placeholder="6281..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Internal</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 transition-colors" />
                <Input
                  placeholder="admin@corp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 transition-colors" />
                <Input
                  placeholder="Password akses admin"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Tingkat Role</label>
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 z-10" />
                <select
                  className="w-full h-14 bg-slate-50/50 border border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 pr-4 outline-none transition-all font-medium appearance-none cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
                >
                  <option value="ADMIN">ADMIN (Operasional)</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN (Full Access)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200/50 text-slate-400'}`}>
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Status Akses</p>
                  <p className="text-[10px] text-slate-400 font-medium">Izin login ke dashboard</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="size-6 rounded-lg border-slate-200 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4">
            <ConfirmDialog
              title="Buat Admin Baru?"
              description="Pastikan role yang diberikan sudah sesuai dengan tugasnya."
              onConfirm={onConfirm}
              trigger={
                <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5" disabled={loading}>
                  {loading ? (
                    "Memproses..."
                  ) : (
                    <>
                      <Save className="mr-2 size-4" />
                      Simpan & Terbitkan Akses
                    </>
                  )}
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
