import { Suspense } from "react";
import ShopContent from "./ShopContent";

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Memuat katalog…</div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
