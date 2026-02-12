"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Edit, Trash2, Save, X, Plus, UserPlus, Users2, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function UsersPage() {
  const { data: me } = useAuth();
  const isAdmin = me?.role === "ADMIN" || me?.role === "SUPER_ADMIN";
  const { data, refetch } = useUsers({ enabled: !!isAdmin });
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editActive, setEditActive] = useState(true);

  async function startEdit(u: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    active: boolean;
  }) {
    setEditingId(u.id);
    setEditName(u.name);
    setEditPhone(u.phone || "");
    setEditEmail(u.email || "");
    setEditActive(u.active);
  }

  async function saveEdit() {
    if (!editingId) return;
    const res = await fetch(`/api/users/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        phone: editPhone,
        email: editEmail || undefined,
        password: editPassword || undefined,
        active: editActive,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditPassword("");
      refetch();
    }
  }

  async function deleteUser(id: string) {
    if (confirm("Are you sure you want to delete this user?")) {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) refetch();
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 animate-in fade-in duration-500">
        <div className="size-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
          <ShieldAlert className="size-8" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-slate-900">Access Restricted</h3>
          <p className="text-sm font-medium text-slate-500">You must have administrator privileges to view this page.</p>
        </div>
      </div>
    );
  }

  const users = (data ?? []).filter((u) => u.role === "USER");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Pelanggan Toko"
        description="Pantau dan kelola pengguna yang terdaftar di toko Anda. Lihat aktivitas, perbarui profil, atau kelola izin akses."
        actions={
          <Button
            onClick={() => router.push("/users/new")}
            className="rounded-xl shadow-lg shadow-primary/20 gap-2 px-6"
          >
            <UserPlus className="size-4" />
            Tambah Pelanggan
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="py-4">Detail Pengguna</TableHead>
              <TableHead>Info Kontak</TableHead>
              <TableHead>Status Akun</TableHead>
              <TableHead className="text-right">Kelola</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                <TableCell className="py-4 font-bold text-slate-900">
                  {editingId === u.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[200px]">{u.name}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    {editingId === u.id ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Phone Number"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="h-9 rounded-lg text-xs"
                        />
                        <Input
                          placeholder="Email Address"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="h-9 rounded-lg text-xs"
                        />
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">{u.phone || "No Phone"}</span>
                        <span className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{u.email || "No Email"}</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {editingId === u.id ? (
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="size-4 rounded-md border-slate-300 text-primary focus:ring-primary/20"
                          checked={editActive}
                          onChange={(e) => setEditActive(e.target.checked)}
                        />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Active Status</span>
                      </label>
                      <Input
                        type="password"
                        placeholder="Secret Key (Optional)"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="h-9 rounded-lg text-xs"
                      />
                    </div>
                  ) : (
                    <Badge className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest" variant={u.active ? "success" : "secondary"}>
                      {u.active ? "Enabled" : "Disabled"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === u.id ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={saveEdit}
                        className="size-9 rounded-xl bg-green-50 text-green-600 hover:bg-green-100"
                      >
                        <Save className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingId(null)}
                        className="size-9 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(u)}
                        className="size-9 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteUser(u.id)}
                        className="size-9 rounded-xl text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Users2 className="size-12 text-slate-200" />
                    <p className="text-sm font-bold text-slate-400 mb-1">No customers registered yet.</p>
                    <Button variant="outline" size="sm" onClick={() => router.push("/users/new")} className="rounded-lg">Be the first to create one</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
