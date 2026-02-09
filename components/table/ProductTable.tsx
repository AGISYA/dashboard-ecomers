import Link from "next/link";
import { ProductListItem } from "@/hooks/useProducts";

export default function ProductTable({
  items,
  onDelete,
}: {
  items: ProductListItem[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#f8fafc]">
          <tr className="text-left border-b">
            <th className="p-3">Nama</th>
            <th className="p-3">Kategori</th>
            <th className="p-3">Harga</th>
            <th className="p-3">Aktif</th>
            <th className="p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-b hover:bg-[#f9fafb]">
              <td className="p-3 font-medium">{p.name}</td>
              <td className="p-3">{p.categoryName}</td>
              <td className="p-3">{p.price}</td>
              <td className="p-3">{p.active ? "Ya" : "Tidak"}</td>
              <td className="p-3">
                <Link
                  href={`/products/${p.id}/edit`}
                  className="btn btn-outline mr-2"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(p.id)}
                  className="btn btn-outline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
