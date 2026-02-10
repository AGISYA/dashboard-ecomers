import { Badge } from "@/components/ui/Badge";
import {
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export type UserRow = {
  id: string;
  name: string;
  phone: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  active: boolean;
};

export default function UserTable({ items }: { items: UserRow[] }) {
  return (
    <div className="rounded-md bg-card text-card-foreground shadow-md">
      <div className="w-full overflow-auto">
        <table className="w-full text-sm caption-bottom text-sm">
          <thead>
            <tr className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                Nama
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                Phone
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                Role
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                Status
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {items.map((u) => (
              <tr
                key={u.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                  <span className="font-mono text-xs">{u.phone}</span>
                </td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                  <Badge variant={u.role === 'SUPER_ADMIN' ? 'destructive' : u.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                  <Badge variant={u.active ? "success" : "secondary"}>
                    {u.active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="p-4 align-middle text-right [&:has([role=checkbox])]:pr-0">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
