import { useQuery } from "@tanstack/react-query";

export type UserItem = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  active: boolean;
};

export function useUsers(opts?: { enabled?: boolean }) {
  return useQuery<UserItem[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Gagal memuat users");
      return res.json();
    },
    enabled: opts?.enabled ?? true,
  });
}
