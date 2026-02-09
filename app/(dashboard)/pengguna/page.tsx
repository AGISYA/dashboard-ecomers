"use client";
import Topbar from "@/components/layout/Topbar";
import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";

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
    <div>
      <Topbar title="Pengguna (Admin Dashboard)" />
      <div className="container px-6 py-6">
        <div className="card p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Nomor HP"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <select
              className="border rounded px-3 py-2 w-full"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")
              }
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span>Aktif</span>
            </label>
            <button onClick={createAdmin} className="btn btn-primary">
              Buat Pengguna
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2">Nama</th>
                <th className="py-2">Nomor</th>
                <th className="py-2">Role</th>
                <th className="py-2">Status</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? [])
                .filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN")
                .map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="py-2">
                      {editingId === u.id ? (
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        u.name
                      )}
                    </td>
                    <td className="py-2">
                      {editingId === u.id ? (
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                        />
                      ) : (
                        u.phone
                      )}
                    </td>
                    <td className="py-2">
                      {editingId === u.id ? (
                        <select
                          className="border rounded px-2 py-1 w-full"
                          value={editRole}
                          onChange={(e) =>
                            setEditRole(
                              e.target.value as "ADMIN" | "SUPER_ADMIN",
                            )
                          }
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      ) : (
                        u.role
                      )}
                    </td>
                    <td className="py-2">
                      {editingId === u.id ? (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editActive}
                            onChange={(e) => setEditActive(e.target.checked)}
                          />
                          <span>Aktif</span>
                        </label>
                      ) : u.active ? (
                        "Aktif"
                      ) : (
                        "Nonaktif"
                      )}
                    </td>
                    <td className="py-2">
                      {editingId === u.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="btn btn-primary"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn btn-outline"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(u)}
                            className="btn btn-outline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="btn btn-outline"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
