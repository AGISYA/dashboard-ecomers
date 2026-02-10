import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateCarousel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      slides: {
        imageUrl: string;
        title: string;
        subTitle: string;
        buttonText: string;
      }[];
    }) => {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Gagal memperbarui carousel");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carousel"] });
    },
  });
}
