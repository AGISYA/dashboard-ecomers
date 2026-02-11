"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Create Administrator
            </h2>
            <p className="text-muted-foreground mt-1">
              Tambah admin sistem baru.
            </p>
          </div>
          <Link href="/pengguna">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>
        <div className="rounded-md bg-card text-card-foreground shadow-md p-6">
          <p className="text-sm">
            Hanya SUPER_ADMIN yang dapat membuat admin baru.
          </p>
        </div>
      </div>
    );
  }

  async function onSubmit() {
    setLoading(true);
    setError(null);
    if (!name || !password || (!phone && !email)) {
      setLoading(false);
      setError("Nama dan password wajib. Isi salah satu: Phone atau Email.");
      return;
    }
    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, password, role, active }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/pengguna");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Gagal membuat admin");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Create Administrator
          </h2>
          <p className="text-muted-foreground mt-1">
            Tambah admin sistem baru.
          </p>
        </div>
        <Link href="/pengguna">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <Input
                placeholder="Initial Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Role</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md bg-background px-3 py-2 text-sm shadow-sm focus:outline-none"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")
                }
              >
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
            <div className="flex items-center h-10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
            <div className="md:col-span-4">
              <Button onClick={onSubmit} disabled={loading}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {loading ? "Menyimpan..." : "Create Admin"}
              </Button>
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
