export default function CategoryTable({
  items,
  onEdit,
  onDelete,
}: {
  items: { id: string; name: string; active: boolean }[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#f8fafc]">
          <tr className="text-left border-b">
            <th className="p-3">Nama</th>
            <th className="p-3">Aktif</th>
            <th className="p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-b hover:bg-[#f9fafb]">
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3">{c.active ? "Ya" : "Tidak"}</td>
              <td className="p-3">
                <button
                  onClick={() => onEdit(c.id)}
                  className="btn btn-outline mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(c.id)}
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
