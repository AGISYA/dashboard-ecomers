"use client";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useUpdateCategory } from "@/hooks/useUpdateCategory";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const update = useUpdateCategory(String(id));
  const router = useRouter();
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/categories/${id}`);
      if (res.ok) {
        const j = await res.json();
        setName(j.name);
        setActive(j.active);
      }
    })();
  }, [id]);

  async function onConfirm() {
    await update.mutateAsync({ name, active });
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
          title="Simpan Perubahan?"
          onConfirm={onConfirm}
          trigger={<button className="px-3 py-2 bg-black text-white rounded">Simpan</button>}
        />
    </div>
  );
}
