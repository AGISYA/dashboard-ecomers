import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import UserMenu from "@/components/ui/UserMenu";

export default function Header() {
  return (
    <header className="bg-card/50 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex-1">
          <form className="w-full max-w-lg">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full bg-background rounded-lg pl-9 pr-4 py-2 text-sm outline-none shadow-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
