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
import {
  Edit,
  Trash2,
  Save,
  X,
  Plus,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Key,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";

type UserItem = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role: string;
  active: boolean;
};

export default function PenggunaPage() {
  const { data: me } = useAuth();
  const isAdmin = me?.role === "ADMIN" || me?.role === "SUPER_ADMIN";
  const canCreateAdmin = me?.role === "SUPER_ADMIN";
  const { data, refetch } = useUsers({ enabled: !!isAdmin });
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [editActive, setEditActive] = useState(true);
  const [editPassword, setEditPassword] = useState("");

  function startEdit(u: UserItem) {
    if (me?.role !== "SUPER_ADMIN") return;
    setEditingId(u.id);
    setEditName(u.name);
    setEditPhone(u.phone || "");
    setEditEmail(u.email || "");
    setEditRole(u.role as "ADMIN" | "SUPER_ADMIN");
    setEditActive(u.active);
  }

  async function saveEdit() {
    if (me?.role !== "SUPER_ADMIN") return;
    if (!editingId) return;
    const res = await fetch(`/api/users/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        phone: editPhone,
        email: editEmail || undefined,
        password: editPassword || undefined,
        role: editRole,
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
    if (me?.role !== "SUPER_ADMIN") return;
    if (confirm("Are you sure you want to delete this administrator?")) {
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
          <h3 className="text-xl font-black text-slate-900">Access Denied</h3>
          <p className="text-sm font-medium text-slate-500">
            Only authorized administrators can access this management console.
          </p>
        </div>
      </div>
    );
  }

  const admins = (data ?? []).filter(
    (u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN",
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Admin"
        description="Daftar administrator sistem. Admin hanya dapat melihat; SUPER ADMIN dapat mengelola."
        actions={
          canCreateAdmin && (
            <Button
              onClick={() => router.push("/pengguna/new")}
              className="rounded-xl shadow-lg shadow-primary/20 gap-2 px-6"
            >
              <ShieldCheck className="size-4" />
              Admin Baru
            </Button>
          )
        }
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="py-4">Detail Admin</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Peran & Izin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((u) => (
              <TableRow
                key={u.id}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                <TableCell className="py-4 font-bold text-slate-900 border-l-4 border-transparent hover:border-primary transition-all">
                  {editingId === u.id && me?.role === "SUPER_ADMIN" ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center gap-3 pl-2">
                      <div
                        className={cn(
                          "size-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm transform transition-transform group-hover:scale-110",
                          u.role === "SUPER_ADMIN"
                            ? "bg-slate-900 text-white"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {u.role === "SUPER_ADMIN" ? (
                          <ShieldCheck size={20} />
                        ) : (
                          <UserCog size={20} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="truncate max-w-[150px]">{u.name}</span>
                        {u.id === me?.id && (
                          <span className="text-[9px] text-primary font-black uppercase tracking-tighter">
                            (You)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    {editingId === u.id && me?.role === "SUPER_ADMIN" ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Phone"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="h-9 rounded-lg text-xs"
                        />
                        <Input
                          placeholder="Email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="h-9 rounded-lg text-xs"
                        />
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-700">
                          {u.phone || "No Phone"}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {u.email || "No Email"}
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {editingId === u.id && me?.role === "SUPER_ADMIN" ? (
                    <select
                      className="h-9 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-primary/10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat pr-8"
                      value={editRole}
                      onChange={(e) =>
                        setEditRole(e.target.value as "ADMIN" | "SUPER_ADMIN")
                      }
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  ) : (
                    <Badge
                      className="rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
                      variant={
                        u.role === "SUPER_ADMIN" ? "destructive" : "default"
                      }
                    >
                      {u.role.replace("_", " ")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === u.id && me?.role === "SUPER_ADMIN" ? (
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="size-4 rounded-md border-slate-300 text-primary focus:ring-primary/20"
                          checked={editActive}
                          onChange={(e) => setEditActive(e.target.checked)}
                        />
                        <span className="text-xs font-bold text-slate-600">
                          Active
                        </span>
                      </label>
                      <div className="relative">
                        <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                        <Input
                          type="password"
                          placeholder="Pass Reset"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="h-9 rounded-lg text-xs pl-8"
                        />
                      </div>
                    </div>
                  ) : (
                    <Badge
                      className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest"
                      variant={u.active ? "success" : "secondary"}
                    >
                      {u.active ? "ONLINE" : "LOCKED"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {me?.role === "SUPER_ADMIN" && (
                    <>
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
                            className="size-9 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(u)}
                            className="size-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteUser(u.id)}
                            className="size-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
