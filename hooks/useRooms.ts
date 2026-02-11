import { useQuery } from "@tanstack/react-query";

export type RoomItem = { id: string; name: string; active: boolean; createdAt: string };

export function useRooms() {
  return useQuery<RoomItem[]>({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await fetch("/api/rooms");
      if (!res.ok) throw new Error("Gagal memuat ruangan");
      return res.json();
    },
  });
}
