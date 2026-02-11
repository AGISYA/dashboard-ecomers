"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useRooms } from "@/hooks/useRooms";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ShopContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "");
  const [room, setRoom] = useState(sp.get("room") ?? "");

  const { data: cats } = useCategories();
  const { data: rooms } = useRooms();
  const { data, refetch } = useProducts({
    q: q || undefined,
    category: category || undefined,
    room: room || undefined,
    page: 1,
    limit: 24,
  });
  const items = useMemo(() => data?.data ?? [], [data]);

  function setQueryParam(
    nextQ?: string,
    nextCategory?: string,
    nextRoom?: string,
  ) {
    const next = new URLSearchParams(sp.toString());
    if (nextQ !== undefined) {
      if (nextQ) next.set("q", nextQ);
      else next.delete("q");
    }
    if (nextCategory !== undefined) {
      if (nextCategory) next.set("category", nextCategory);
      else next.delete("category");
    }
    if (nextRoom !== undefined) {
      if (nextRoom) next.set("room", nextRoom);
      else next.delete("room");
    }
    router.replace(`/shop?${next.toString()}`);
    refetch();
  }

  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Katalog Produk
          </h1>
          <p className="text-sm text-muted-foreground">
            Belanja berdasarkan kategori atau ruangan
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Cari produk..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setQueryParam(q, undefined, undefined);
            }}
          />
        </div>
        <select
          className="flex h-10 w-full md:w-60 items-center justify-between rounded-md bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none shadow-sm"
          value={category}
          onChange={(e) => {
            const v = e.target.value;
            setCategory(v);
            setQueryParam(undefined, v, undefined);
          }}
        >
          <option value="">Semua Kategori</option>
          {(cats ?? []).map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="flex h-10 w-full md:w-60 items-center justify-between rounded-md bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none shadow-sm"
          value={room}
          onChange={(e) => {
            const v = e.target.value;
            setRoom(v);
            setQueryParam(undefined, undefined, v);
          }}
        >
          <option value="">Semua Ruangan</option>
          {(rooms ?? []).map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={() => setQueryParam(q, category, room)}
        >
          Terapkan
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <div
            key={p.id}
            className="rounded-lg bg-card shadow-sm overflow-hidden"
          >
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                No Image
              </div>
            )}
            <div className="p-3 space-y-1">
              <div className="text-sm text-muted-foreground">
                {p.categoryName || "-"}
              </div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-muted-foreground">
                {p.roomName || ""}
              </div>
              <div className="font-semibold">
                Rp {p.price.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">
            Tidak ada produk ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
