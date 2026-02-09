"use client";
import Topbar from "@/components/layout/Topbar";
import { useEffect, useState } from "react";

type Me = { id: string; name: string; phone: string; role: string } | null;

export default function ProfilePage() {
  const [me, setMe] = useState<Me>(null);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        setMe(await res.json());
      }
    })();
  }, []);

  return (
    <div>
      <Topbar title="Profil" />
      <div className="container px-6 py-6">
        <div className="card p-6 space-y-3 max-w-md">
          <div className="text-sm text-muted">Nama</div>
          <div className="text-lg font-semibold">{me?.name || "-"}</div>
          <div className="text-sm text-muted">Nomor</div>
          <div className="text-lg font-semibold">{me?.phone || "-"}</div>
          <div className="text-sm text-muted">Role</div>
          <div className="text-lg font-semibold">{me?.role || "-"}</div>
        </div>
      </div>
    </div>
  );
}
