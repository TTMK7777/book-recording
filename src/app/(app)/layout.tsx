import { NavHeader } from "@/components/nav-header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <NavHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
