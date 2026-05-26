import { cn } from "~/lib/utils";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", active: true },
  { icon: "description", label: "Forms", active: false },
  { icon: "style", label: "Templates", active: false },
  { icon: "analytics", label: "Responses", active: false },
  { icon: "query_stats", label: "Analytics", active: false },
  { icon: "api", label: "API Docs", active: false },
  { icon: "settings", label: "Settings", active: false },
] as const;

export function DashboardSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-[#0d0e14] border-r border-[#454653] shadow-sm z-50 flex flex-col py-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-lg bg-[#818cf8] flex items-center justify-center">
          <svg
            width="22"
            height="22"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="6" height="6" rx="1" fill="#131e8c" />
            <rect x="10" y="2" width="6" height="6" rx="1" fill="#131e8c" opacity="0.6" />
            <rect x="2" y="10" width="6" height="6" rx="1" fill="#131e8c" opacity="0.6" />
            <rect x="10" y="10" width="6" height="6" rx="1" fill="#131e8c" />
          </svg>
        </div>
        <div>
          <h1
            className="text-lg font-bold text-[#e4e1eb]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            CanvasForms
          </h1>
          <p
            className="text-[11px] tracking-wider uppercase text-[#c6c5d5] opacity-70"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            Form Builder
          </p>
        </div>
      </div>

      {/* New Form button */}
      <button className="w-full bg-[#818cf8] text-[#101b8a] text-[13px] font-medium py-4 rounded-lg flex items-center justify-center gap-1 mb-8 hover:opacity-90 transition-opacity active:scale-95 duration-75">
        <span className="material-symbols-outlined text-[18px]">add</span>
        New Form
      </button>

      {/* Navigation */}
      <nav className="flex-grow space-y-1">
        {NAV_ITEMS.map(({ icon, label, active }) => (
          <a
            key={label}
            href="#"
            className={cn(
              "flex items-center gap-4 pl-4 py-2 transition-colors text-sm",
              active
                ? "text-[#bdc2ff] border-l-2 border-[#bdc2ff] font-bold bg-[#1b1b22]"
                : "text-[#c6c5d5] hover:bg-[#1b1b22]",
            )}
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span>{label}</span>
          </a>
        ))}
      </nav>

      {/* User profile */}
      <div className="mt-auto pt-6 border-t border-[#454653] flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-[#818cf8] flex items-center justify-center text-[#101b8a] font-bold text-sm">
          JD
        </div>
        <div className="overflow-hidden">
          <p className="text-[13px] font-medium text-[#e4e1eb] truncate">Jane Doe</p>
          <p className="text-[11px] text-[#c6c5d5] truncate">jane@canvasforms.io</p>
        </div>
      </div>
    </aside>
  );
}
