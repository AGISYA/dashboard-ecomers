import { useQuery } from "@tanstack/react-query";

export type BusinessPromo = {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string | null;
  active: boolean;
};

export function useBusinessPromo() {
  return useQuery<BusinessPromo | null>({
    queryKey: ["businessPromo"],
    queryFn: async () => {
      const res = await fetch("/api/business");
      if (!res.ok) return null;
      return res.json();
    },
  });
}
