import { DashboardSidebar } from "~/components/dashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[#121319] text-[#e4e1eb] overflow-hidden">
      <DashboardSidebar />
      <main className="flex-grow ml-[280px] h-full overflow-y-auto cf-canvas-grid-bg">
        {children}
      </main>
    </div>
  );
}
