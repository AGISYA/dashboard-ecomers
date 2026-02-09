import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";

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
    <div className="min-h-screen flex bg-white">
      <Sidebar />
      <main className="flex-1 bg-white">{children}</main>
    </div>
  );
}
