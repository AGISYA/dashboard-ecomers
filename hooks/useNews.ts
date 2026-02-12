import { useQuery } from "@tanstack/react-query";

export type NewsItem = {
  id: string;
  title: string;
  category: string;
  slug: string;
  excerpt: string;
  imageUrl?: string | null;
  publishedAt: string;
  active: boolean;
};

export function useNews() {
  return useQuery<NewsItem[]>({
    queryKey: ["news"],
    queryFn: async () => {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error("Gagal memuat berita");
      return res.json();
    },
  });
}
