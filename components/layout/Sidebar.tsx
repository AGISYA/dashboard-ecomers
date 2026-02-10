
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
  LogOut
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Produk",
    icon: Package,
    href: "/products",
    color: "text-violet-500",
  },
  {
    label: "Kategori",
    icon: Layers,
    href: "/categories",
    color: "text-pink-700",
  },
  {
    label: "Carousel",
    icon: Images,
    href: "/carousel",
    color: "text-orange-700",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
    color: "text-emerald-500",
  },
  {
    label: "Pengguna",
    icon: UserCog,
    href: "/pengguna",
    color: "text-green-700",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white border-r text-slate-900">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            {/* Logo placeholder */}
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm">
              M
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Market Admin
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-colors",
                pathname === route.href
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="border-t pt-4 pb-1">
          <div className="px-3 py-2 text-xs text-slate-500">
            © 2026 Admin Dashboard
          </div>
        </div>
      </div>
    </div>
  );
}
