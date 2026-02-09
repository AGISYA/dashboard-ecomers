"use client";
import Topbar from "@/components/layout/Topbar";
import ProductTable from "@/components/table/ProductTable";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import Link from "next/link";
import { useMemo, useState } from "react";

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
    <div>
      <Topbar title="Produk" />
      <div className="container px-6 py-6 space-y-4">
        <div className="card p-4 flex items-center gap-3">
          <input
            className="border rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
            placeholder="Cari nama..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {cats?.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="btn btn-outline" onClick={() => refetch()}>
            Filter
          </button>
          <Link
            href="/products/new"
            className="ml-auto btn btn-primary"
          >
            + Produk Baru
          </Link>
        </div>
        <ProductTable items={items} onDelete={handleDelete} />
      </div>
    </div>
  );
}
