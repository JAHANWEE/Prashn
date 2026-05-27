export function DashboardHeader() {
  return (
    <header className="sticky top-0 bg-[#121319]/80 backdrop-blur-md z-40 h-16 border-b border-[#454653] flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h2 className="text-lg font-bold text-[#fca9d4]" style={{ fontFamily: "var(--font-geist-sans)" }}>
          Workspace
        </h2>
        <nav className="hidden md:flex gap-4">
          <a href="/dashboard" className="text-[13px] font-medium pb-1 text-[#fca9d4] border-b-2 border-[#fca9d4]">Dashboard</a>
          <a href="/dashboard/responses" className="text-[13px] font-medium pb-1 text-[#c6c5d5] hover:text-[#fca9d4] transition-all">Responses</a>
          <a href="/dashboard/analytics" className="text-[13px] font-medium pb-1 text-[#c6c5d5] hover:text-[#fca9d4] transition-all">Analytics</a>
          <a href="/dashboard/templates" className="text-[13px] font-medium pb-1 text-[#c6c5d5] hover:text-[#fca9d4] transition-all">Templates</a>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <a href="/dashboard/api-docs" className="text-[13px] font-medium border border-[#454653] px-4 py-2 rounded-lg text-[#e4e1eb] hover:bg-[#1f1f26] transition-colors">
          API Docs
        </a>
      </div>
    </header>
  );
}
