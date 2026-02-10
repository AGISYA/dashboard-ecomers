"use client";
import Topbar from "@/components/layout/Topbar";
import ProductTable from "@/components/table/ProductTable";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const { data, refetch } = useProducts({ q, category, page: 1, limit: 20 });
  const { data: cats } = useCategories();
  const del = useDeleteProduct();
  const items = useMemo(() => data?.data ?? [], [data]);

  function handleDelete(id: string) {
    del.mutate(id, { onSuccess: () => refetch() });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground mt-1">
            Manage your product inventory.
          </p>
        </div>
        <Link href="/products/new">
          <Button>+ Add Product</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search products..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-8"
            />
            {/* Ideally add Search icon here */}
          </div>
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[180px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {cats?.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <ProductTable items={items} onDelete={handleDelete} />
    </div>
  );
}
