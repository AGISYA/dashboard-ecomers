"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

export default function ConfirmDialog({
  onConfirm,
  trigger,
  title = "Konfirmasi",
  description,
}: {
  onConfirm: () => void | Promise<void>;
  trigger: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-block">{trigger}</span>
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === overlayRef.current) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-[92%] max-w-md animate-in fade-in zoom-in-90"
          >
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            </div>
            <div className="px-5 py-4">
              {description && (
                <p className="text-sm text-slate-600">{description}</p>
              )}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                onClick={async () => {
                  setLoading(true);
                  await onConfirm();
                  setLoading(false);
                  setOpen(false);
                }}
              >
                {loading ? "Memproses..." : "Ya, lanjut"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
