import UserMenu from "../ui/UserMenu";

export default function Topbar({ title }: { title: string }) {
  return (
    <header className="w-full border-b bg-white sticky top-0 z-40">
      <div className="container px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <UserMenu />
      </div>
    </header>
  );
}
