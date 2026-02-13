"use client";

import { Menu } from "lucide-react";
import UserMenu from "@/components/ui/UserMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-8">
        <div className="flex flex-1 items-center gap-4 md:gap-8">

          <button className="md:hidden flex items-center justify-center size-10 rounded-xl hover:bg-slate-100 transition-colors">
            <Menu className="size-6 text-slate-600" />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistem Aktif</span>
          </div>



          <div className="h-8 w-px bg-slate-100 mx-1" />

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
