"use client";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useCreateCategory } from "@/hooks/useCreateCategory";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCategoryPage() {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const create = useCreateCategory();
  const router = useRouter();

  async function onConfirm() {
    await create.mutateAsync({ name, active });
    router.replace("/categories");
  }

  return (
    <div className="p-4 space-y-4 max-w-md">
        <div>
          <label className="block text-sm mb-1">Nama</label>
          <input className="border rounded px-3 py-2 w-full" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span>Aktif</span>
        </div>
        <ConfirmDialog
          title="Simpan Kategori?"
          onConfirm={onConfirm}
          trigger={<button className="px-3 py-2 bg-black text-white rounded">Simpan</button>}
        />
    </div>
  );
}
