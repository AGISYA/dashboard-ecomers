import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const c = await cookies();
  const token = c.get("auth_token")?.value || "";
  const payload = token ? verifyJWT(token) : null;
  if (!payload) {
    redirect("/login");
  }
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-white shadow-md">
        <Sidebar />
      </div>
      <main className="md:pl-72 bg-slate-50 min-h-screen">
        <Header />
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
