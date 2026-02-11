"use client";
import Topbar from "@/components/layout/Topbar";
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
import { Edit, Trash2, Save, X, Plus, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

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
    setEditingId(u.id);
    setEditName(u.name);
    setEditPhone(u.phone || "");
    setEditEmail(u.email || "");
    setEditRole(u.role as "ADMIN" | "SUPER_ADMIN");
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
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) refetch();
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-card text-card-foreground shadow-md p-6">
          <p className="text-sm">
            Halaman ini hanya untuk ADMIN. Silakan login sebagai admin.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Administrators</h2>
          <p className="text-muted-foreground mt-1">
            Manage system administrators and roles.
          </p>
        </div>
        {canCreateAdmin && (
          <Button onClick={() => router.push("/pengguna/new")}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Create Admin
          </Button>
        )}
      </div>

      <div className="rounded-md bg-card text-card-foreground shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? [])
              .filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN")
              .map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {editingId === u.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      u.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === u.id ? (
                      <Input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      <span className="font-mono text-xs">
                        {u.phone ?? "-"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === u.id ? (
                      <Input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      <span className="font-mono text-xs">
                        {u.email || "-"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === u.id ? (
                      <select
                        className="flex h-8 w-full items-center justify-between rounded-md bg-background px-2 py-1 text-xs shadow-sm"
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
                        variant={
                          u.role === "SUPER_ADMIN" ? "destructive" : "default"
                        }
                      >
                        {u.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === u.id ? (
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editActive}
                            onChange={(e) => setEditActive(e.target.checked)}
                          />
                          <span className="text-sm">Active</span>
                        </label>
                        <Input
                          type="password"
                          placeholder="New Password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="h-8"
                        />
                      </div>
                    ) : (
                      <Badge variant={u.active ? "success" : "secondary"}>
                        {u.active ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === u.id ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={saveEdit}
                          className="h-8 w-8 text-green-600 hover:text-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(null)}
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(u)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteUser(u.id)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
