import { useQuery } from "@tanstack/react-query";

export type NewsSettings = {
    id: string;
    title: string;
    buttonText: string;
    buttonLink: string;
};

export function useNewsSettings() {
    return useQuery<NewsSettings>({
        queryKey: ["newsSettings"],
        queryFn: async () => {
            const res = await fetch("/api/news/settings");
            if (!res.ok) throw new Error("Gagal memuat pengaturan berita");
            return res.json();
        },
    });
}
