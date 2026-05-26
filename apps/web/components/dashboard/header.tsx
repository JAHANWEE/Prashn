import { cn } from "~/lib/utils";

const TABS = [
  { label: "Canvas", active: true },
  { label: "Preview", active: false },
  { label: "Responses", active: false },
  { label: "Analytics", active: false },
] as const;

export function DashboardHeader() {
  return (
    <header className="sticky top-0 bg-[#121319]/80 backdrop-blur-md z-40 h-16 border-b border-[#454653] flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h2
          className="text-lg font-bold text-[#bdc2ff]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Workspace
        </h2>
        <nav className="hidden md:flex gap-4">
          {TABS.map(({ label, active }) => (
            <a
              key={label}
              href="#"
              className={cn(
                "text-[13px] font-medium pb-1 transition-all",
                active
                  ? "text-[#bdc2ff] border-b-2 border-[#bdc2ff]"
                  : "text-[#c6c5d5] hover:text-[#bdc2ff]",
              )}
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-[#c6c5d5] hover:text-[#bdc2ff] cursor-pointer transition-colors">
          save
        </span>
        <span className="material-symbols-outlined text-[#c6c5d5] hover:text-[#bdc2ff] cursor-pointer transition-colors">
          cloud_done
        </span>
        <button className="text-[13px] font-medium border border-[#454653] px-4 py-2 rounded-lg text-[#e4e1eb] hover:bg-[#1f1f26] transition-colors">
          Share
        </button>
        <button className="text-[13px] font-medium bg-[#bdc2ff] text-[#131e8c] px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 duration-75">
          Publish
        </button>
      </div>
    </header>
  );
}
