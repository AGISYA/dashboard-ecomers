"use client";
import Topbar from "@/components/layout/Topbar";
import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
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
  phone: string;
  role: string;
  active: boolean;
};

export default function PenggunaPage() {
  const { data, refetch } = useUsers();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [editActive, setEditActive] = useState(true);

  async function createAdmin() {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, role, active }),
    });
    if (res.ok) {
      setName("");
      setPhone("");
      setRole("ADMIN");
      setActive(true);
      refetch();
    }
  }

  function startEdit(u: UserItem) {
    setEditingId(u.id);
    setEditName(u.name);
    setEditPhone(u.phone);
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
        role: editRole,
        active: editActive,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      refetch();
    }
  }

  async function deleteUser(id: string) {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) refetch();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Administrators</h2>
        <p className="text-muted-foreground mt-1">
          Manage system administrators and roles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Administrator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
              <label className="text-sm font-medium mb-1 block">Role</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
            <Button onClick={createAdmin}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
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
                      <span className="font-mono text-xs">{u.phone}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === u.id ? (
                      <select
                        className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-xs"
                        value={editRole}
                        onChange={(e) =>
                          setEditRole(
                            e.target.value as "ADMIN" | "SUPER_ADMIN"
                          )
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
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editActive}
                          onChange={(e) => setEditActive(e.target.checked)}
                        />
                        <span className="text-sm">Active</span>
                      </label>
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
