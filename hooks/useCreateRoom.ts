import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; active?: boolean }) => {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Gagal membuat ruangan");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}
