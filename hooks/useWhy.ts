import { useQuery } from "@tanstack/react-query";

export type WhyItem = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  order: number;
  active: boolean;
};

export function useWhy() {
  return useQuery<WhyItem[]>({
    queryKey: ["why"],
    queryFn: async () => {
      const res = await fetch("/api/why");
      if (!res.ok) throw new Error("Gagal memuat Why Choose data");
      return res.json();
    },
  });
}

