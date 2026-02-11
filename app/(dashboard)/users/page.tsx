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
import { Edit, Trash2, Save, X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

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
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground mt-1">
            Manage registered users (Customers).
          </p>
        </div>
        <Button onClick={() => router.push("/users/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <div className="rounded-md bg-card text-card-foreground shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? [])
              .filter((u) => u.role === "USER")
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
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
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
