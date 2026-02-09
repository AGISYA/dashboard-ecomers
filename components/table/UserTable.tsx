export type UserRow = {
  id: string;
  name: string;
  phone: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  active: boolean;
};

export default function UserTable({ items }: { items: UserRow[] }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#f8fafc]">
          <tr className="text-left border-b">
            <th className="p-3">Nama</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Role</th>
            <th className="p-3">Aktif</th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-b hover:bg-[#f9fafb]">
              <td className="p-3 font-medium">{u.name}</td>
              <td className="p-3">{u.phone}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3">{u.active ? "Ya" : "Tidak"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
