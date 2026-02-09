import { useQuery } from "@tanstack/react-query";

export type CategoryItem = { id: string; name: string; active: boolean; createdAt: string };

export function useCategories() {
  return useQuery<CategoryItem[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Gagal memuat kategori");
      return res.json();
    },
  });
}
