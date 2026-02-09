"use client";
import Topbar from "@/components/layout/Topbar";
import CategoryTable from "@/components/table/CategoryTable";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteCategory } from "@/hooks/useDeleteCategory";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CategoriesPage() {
  const { data, refetch } = useCategories();
  const del = useDeleteCategory();
  const router = useRouter();
  function onEdit(id: string) {
    router.push(`/categories/${id}/edit`);
  }
  function onDelete(id: string) {
    del.mutate(id, { onSuccess: () => refetch() });
  }
  return (
    <div>
      <Topbar title="Kategori" />
      <div className="container px-6 py-6 space-y-4">
        <div>
          <Link href="/categories/new" className="btn btn-primary">+ Kategori Baru</Link>
        </div>
        <CategoryTable items={(data ?? []).map(c => ({ id: c.id, name: c.name, active: c.active }))} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}
