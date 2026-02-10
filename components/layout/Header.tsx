
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Header() {
    return (
        <header className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="flex h-16 items-center gap-4 px-6">
                <div className="flex-1">
                    <form className="w-full max-w-lg">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="search"
                                placeholder="Search..."
                                className="w-full bg-background rounded-lg border pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </form>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                    </Button>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        AD
                    </div>
                </div>
            </div>
        </header>
    );
}
