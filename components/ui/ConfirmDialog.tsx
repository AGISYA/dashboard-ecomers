import { useState } from "react";

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
  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded shadow w-[90%] max-w-md">
            <div className="px-4 py-3 border-b">
              <h2 className="font-medium">{title}</h2>
            </div>
            <div className="px-4 py-3">
              {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
            <div className="px-4 py-3 border-t flex justify-end gap-2">
              <button
                className="px-3 py-2 rounded border"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Batal
              </button>
              <button
                className="px-3 py-2 rounded bg-black text-white"
                onClick={async () => {
                  setLoading(true);
                  await onConfirm();
                  setLoading(false);
                  setOpen(false);
                }}
              >
                {loading ? "Memproses..." : "Ya, lanjut"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
