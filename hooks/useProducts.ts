import { useQuery } from "@tanstack/react-query";

export type ProductListItem = {
  id: string;
  name: string;
  categoryName: string;
  roomName: string;
  price: number;
  imageUrl: string | null;
  active: boolean;
  description: string;
  createdAt: string;
};

export function useProducts(params: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  room?: string;
}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.q) q.set("q", params.q);
  if (params.category) q.set("category", params.category);
  if (params.room) q.set("room", params.room);
  const key = ["products", params];
  return useQuery<{ data: ProductListItem[]; page: number; limit: number; total: number }>({
    queryKey: key,
    queryFn: async () => {
      const res = await fetch(`/api/products?${q.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat produk");
      return res.json();
    },
  });
}
