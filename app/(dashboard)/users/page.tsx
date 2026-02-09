"use client";
import Topbar from "@/components/layout/Topbar";
import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";

export default function UsersPage() {
  const { data, refetch } = useUsers();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editActive, setEditActive] = useState(true);
  async function createUser() {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, active, role: "USER" }),
    });
    if (res.ok) {
      setName("");
      setPhone("");
      setActive(true);
      refetch();
    }
  }
  async function startEdit(u: {
    id: string;
    name: string;
    phone: string;
    active: boolean;
  }) {
    setEditingId(u.id);
    setEditName(u.name);
    setEditPhone(u.phone);
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
      <Topbar title="User (E-commerce)" />
      <div className="container px-6 py-6">
        <div className="card p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span>Aktif</span>
            </label>
            <button onClick={createUser} className="btn btn-primary">
              Buat Akun
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2">Nama</th>
                <th className="py-2">Nomor</th>
                <th className="py-2">Status</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? [])
                .filter((u) => u.role === "USER")
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
