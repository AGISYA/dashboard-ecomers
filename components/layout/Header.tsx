"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import UserMenu from "@/components/ui/UserMenu";
import { Input } from "@/components/ui/Input";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-8">
        <div className="flex flex-1 items-center gap-4 md:gap-8">
          <div className="hidden md:flex w-full max-w-sm relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="search"
              placeholder="Cari administrasi..."
              className="w-full h-10 bg-slate-50 border-transparent rounded-xl pl-10 pr-4 py-2 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 placeholder:text-slate-400"
            />
          </div>
          <button className="md:hidden flex items-center justify-center size-10 rounded-xl hover:bg-slate-100 transition-colors">
            <Menu className="size-6 text-slate-600" />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistem Aktif</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors relative"
          >
            <Bell className="size-5" />
            <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-red-500 border-2 border-white" />
          </Button>

          <div className="h-8 w-px bg-slate-100 mx-1" />

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
