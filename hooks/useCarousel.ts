import { useQuery } from "@tanstack/react-query";

export type Slide = {
  imageUrl: string;
  title: string;
  subTitle: string;
  buttonText: string;
};

export type CarouselConfig = {
  id: string;
  slides: Slide[];
  createdAt: string;
};

export function useCarousel() {
  return useQuery<CarouselConfig>({
    queryKey: ["carousel"],
    queryFn: async () => {
      const res = await fetch("/api/carousel");
      if (!res.ok) throw new Error("Gagal memuat carousel");
      return res.json();
    },
  });
}
