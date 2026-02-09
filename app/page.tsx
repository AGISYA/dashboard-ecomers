import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "@/lib/auth";

export default async function Home() {
  const c = await cookies();
  const token = c.get("auth_token")?.value || "";
  const payload = token ? verifyJWT(token) : null;
  if (payload) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
