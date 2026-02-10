"use client";
import Topbar from "@/components/layout/Topbar";
import CategoryTable from "@/components/table/CategoryTable";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteCategory } from "@/hooks/useDeleteCategory";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground mt-1">
            Manage product categories.
          </p>
        </div>
        <Link href="/categories/new">
          <Button>+ New Category</Button>
        </Link>
      </div>
      <CategoryTable items={(data ?? []).map(c => ({ id: c.id, name: c.name, active: c.active }))} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
