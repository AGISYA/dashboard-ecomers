import { useQuery } from "@tanstack/react-query";

export type CarouselItem = {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
};

export function useCarousel() {
  return useQuery<CarouselItem[]>({
    queryKey: ["carousel"],
    queryFn: async () => {
      const res = await fetch("/api/carousel");
      if (!res.ok) throw new Error("Gagal memuat carousel");
      return res.json();
    },
  });
}
