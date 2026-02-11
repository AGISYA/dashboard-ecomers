"use client";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useCreateRoom } from "@/hooks/useCreateRoom";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewRoomPage() {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateRoom();
  const router = useRouter();

  async function onConfirm() {
    setError(null);
    try {
      await create.mutateAsync({ name, active });
      router.replace("/rooms");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal membuat ruangan";
      setError(msg);
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-md">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div>
        <label className="block text-sm mb-1">Nama</label>
        <input
          className="border rounded px-3 py-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        <span>Aktif</span>
      </div>
      <ConfirmDialog
        title="Simpan Ruangan?"
        onConfirm={onConfirm}
        trigger={
          <button className="px-3 py-2 bg-black text-white rounded">
            Simpan
          </button>
        }
      />
    </div>
  );
}
