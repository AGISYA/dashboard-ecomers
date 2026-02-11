"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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

  async function onSubmit() {
    setLoading(true);
    setError(null);
    if (!name || !password || (!phone && !email)) {
      setLoading(false);
      setError("Nama dan password wajib. Isi salah satu: Phone atau Email.");
      return;
    }
    const isAdmin = me?.role === "ADMIN" || me?.role === "SUPER_ADMIN";
    const endpoint = isAdmin ? "/api/users" : "/api/auth/register";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isAdmin
          ? { name, phone, email, password, active, role: "USER" }
          : { name, phone, email, password },
      ),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/users");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Gagal membuat user");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create User</h2>
          <p className="text-muted-foreground mt-1">
            Tambah user/customer baru.
          </p>
        </div>
        <Link href="/users">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                placeholder="Email Address"
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
                <Plus className="mr-2 h-4 w-4" />
                {loading ? "Menyimpan..." : "Create User"}
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
