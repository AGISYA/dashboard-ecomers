"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import Link from "next/link";
import {
  Plus,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  UserPlus,
  Save,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/ui/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function NewUserPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: me } = useAuth();
  const isAdmin = me?.role === "ADMIN" || me?.role === "SUPER_ADMIN";

  async function onConfirm() {
    if (!isAdmin) {
      setError(
        "Akses ditolak: hanya ADMIN yang boleh membuat pelanggan dari dashboard.",
      );
      return;
    }
    setLoading(true);
    setError(null);

    if (!name || !password || (!phone && !email)) {
      setLoading(false);
      setError("Nama dan password wajib. Isi salah satu: WhatsApp atau Email.");
      return;
    }

    const endpoint = "/api/users";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          password,
          active,
          role: "USER",
        }),
      });

      if (res.ok) {
        router.push("/users");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Gagal membuat user");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
      {!isAdmin && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
          Hanya ADMIN yang boleh menambahkan pelanggan dari dashboard.
        </div>
      )}
      <PageHeader
        title="Tambah Pelanggan"
        description="Daftarkan akun pelanggan baru secara manual ke dalam sistem."
        actions={
          <Link href="/users">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-slate-900 group"
            >
              <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
              Kembali
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in shake">
          {error}
        </div>
      )}

      <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 py-6 px-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-slate-900 flex items-center justify-center">
              <UserPlus className="size-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Profil Pelanggan
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">
                Lengkapi data autentikasi dan kontak pelanggan
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Nama Lengkap
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <Input
                  placeholder="Nama sesuai identitas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                WhatsApp / Phone
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <Input
                  placeholder="6281234..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Alamat Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <Input
                  placeholder="email@pelanggan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Kata Sandi
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <Input
                  placeholder="Password minimal 6 karakter"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 rounded-2xl text-sm pl-12 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 mt-2">
            <div className="flex items-center gap-3">
              <div
                className={`size-10 rounded-xl flex items-center justify-center transition-colors ${active ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-200/50 text-slate-400"}`}
              >
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Status Akun</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Akun aktif dapat melakukan transaksi di website
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="size-6 rounded-lg border-slate-200 text-slate-900 focus:ring-slate-900 cursor-pointer transition-all"
            />
          </div>

          <div className="pt-4">
            <ConfirmDialog
              title="Daftarkan Pelanggan?"
              description="Pastikan data yang dimasukkan sudah benar."
              onConfirm={onConfirm}
              trigger={
                <Button
                  className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5"
                  disabled={loading || !isAdmin}
                >
                  {loading ? (
                    "Mendaftarkan..."
                  ) : (
                    <>
                      <Save className="mr-2 size-4" />
                      Simpan & Daftarkan Pelanggan
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
