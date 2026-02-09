import { useQuery } from "@tanstack/react-query";

export type Me = {
  id: string;
  name: string;
  phone: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
};

export function useAuth() {
  return useQuery<Me | null>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });
}
