"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Layers,
  Images,
  Users,
  UserCog,
  Settings,
  LogOut,
  Star,
  Briefcase,
  Newspaper,
  PanelBottom,
  Mail,
  ShoppingBag,
  Target,
  Users2,
  FileText
} from "lucide-react";

const groups = [
  {
    title: "Utama",
    routes: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
    ]
  },
  {
    title: "Manajemen Toko",
    routes: [
      {
        label: "Produk",
        icon: Package,
        href: "/products",
      },
      {
        label: "Kategori",
        icon: Layers,
        href: "/categories",
      },
      {
        label: "Ruangan",
        icon: Settings,
        href: "/rooms",
      },
    ]
  },
  {
    title: "Konten & Pemasaran",
    routes: [
      {
        label: "Carousel Hero",
        icon: Images,
        href: "/carousel",
      },
      {
        label: "Mengapa Memilih Kami",
        icon: Star,
        href: "/why",
      },
      {
        label: "Promo Bisnis",
        icon: Briefcase,
        href: "/business",
      },
      {
        label: "Berita & Artikel",
        icon: Newspaper,
        href: "/news",
      },
      {
        label: "Newsletter",
        icon: Mail,
        href: "/newsletter",
      },
      {
        label: "Pengaturan Footer",
        icon: PanelBottom,
        href: "/footer",
      },
    ]
  },
  {
    title: "Akses Pengguna",
    routes: [
      {
        label: "Manajemen Admin",
        icon: Users,
        href: "/users",
      },
      {
        label: "Pengguna Toko",
        icon: UserCog,
        href: "/pengguna",
      },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 border-r border-slate-100">
      <div className="px-6 py-8">
        <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="size-10 bg-slate-900 rounded-lg flex items-center justify-center font-semibold text-white shadow-lg shadow-slate-200 transform -rotate-1">
            F
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 leading-none">FURSIA</h1>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Sistem Manajemen</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-8 pb-10">
        {groups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h2 className="px-4 text-[11px] font-medium text-slate-400 uppercase tracking-wider leading-none">
              {group.title}
            </h2>
            <div className="space-y-1">
              {group.routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg",
                    pathname.startsWith(route.href) && (route.href !== "/dashboard" || pathname === "/dashboard")
                      ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <route.icon className={cn(
                    "size-5 transition-transform duration-200 group-hover:scale-110",
                    pathname.startsWith(route.href) && (route.href !== "/dashboard" || pathname === "/dashboard")
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  <span className="flex-1 truncate">{route.label}</span>
                  {pathname.startsWith(route.href) && (route.href !== "/dashboard" || pathname === "/dashboard") && (
                    <div className="size-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30">
        <div className="flex flex-col gap-1.5 opacity-40">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">© 2026 FURSIA</p>
          <p className="text-[9px] font-medium text-slate-500 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-slate-300" />
            V1.2.0 Build Stabil
          </p>
        </div>
      </div>
    </div>
  );
}
