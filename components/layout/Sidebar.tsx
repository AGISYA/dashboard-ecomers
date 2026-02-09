import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-72 shrink-0 border-r bg-white">
      <div className="px-5 py-4 border-b">
        <div className="text-xl font-semibold tracking-tight">Market Admin</div>
        <div className="text-sm text-muted">v2026</div>
      </div>
      <nav className="p-3 space-y-1">
        <Link
          className="block px-3 py-2 rounded-lg hover:bg-[#f1f5f9] font-medium"
          href="/dashboard"
        >
          Dashboard
        </Link>
        <Link
          className="block px-3 py-2 rounded-lg hover:bg-[#f1f5f9] font-medium"
          href="/products"
        >
          Produk
        </Link>
        <Link
          className="block px-3 py-2 rounded-lg hover:bg-[#f1f5f9] font-medium"
          href="/categories"
        >
          Kategori
        </Link>
        <Link
          className="block px-3 py-2 rounded-lg hover:bg-[#f1f5f9] font-medium"
          href="/carousel"
        >
          Carousel
        </Link>
        <Link
          className="block px-3 py-2 rounded-lg hover:bg-[#f1f5f9] font-medium"
          href="/users"
        >
          Users
        </Link>
        <Link
          className="block px-3 py-2 rounded-lg hover:bg-[#f1f5f9] font-medium"
          href="/pengguna"
        >
          Pengguna
        </Link>
      </nav>
    </aside>
  );
}
