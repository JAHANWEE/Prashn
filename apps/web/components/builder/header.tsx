import { cn } from "~/lib/utils";

const TABS = [
  { label: "Canvas", active: true },
  { label: "Preview", active: false },
  { label: "Responses", active: false },
  { label: "Analytics", active: false },
] as const;

export function BuilderHeader() {
  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-[#121319] border-b border-[#454653] flex items-center justify-between px-6 z-50">
      {/* Left: Logo + Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span
            className="text-lg font-bold text-[#bdc2ff]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            CanvasForms
          </span>
          <nav className="flex items-center gap-1 text-[12px] text-[#c6c5d5]" style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}>
            <span>Forms</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#e4e1eb] font-medium">Startup Feedback Flow</span>
          </nav>
        </div>
      </div>

      {/* Center: Tabs */}
      <div className="flex items-center gap-8">
        <nav className="flex items-center gap-6">
          {TABS.map(({ label, active }) => (
            <a
              key={label}
              href="#"
              className={cn(
                "text-[12px] font-medium pb-1 transition-all",
                active
                  ? "text-[#bdc2ff] border-b-2 border-[#bdc2ff]"
                  : "text-[#c6c5d5] hover:text-[#bdc2ff]",
              )}
              style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button className="p-1 hover:bg-[#1b1b22] rounded transition-colors" title="Save">
            <span className="material-symbols-outlined text-[#c6c5d5]">save</span>
          </button>
          <button className="p-1 hover:bg-[#1b1b22] rounded transition-colors" title="Sync Status">
            <span className="material-symbols-outlined text-[#c6c5d5]">cloud_done</span>
          </button>
        </div>
        <button
          className="px-4 py-1 bg-[#1b1b22] text-[#e4e1eb] text-[12px] font-medium rounded border border-[#454653] hover:bg-[#1f1f26] hover:shadow-sm transition-all active:scale-95"
          style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
        >
          Share
        </button>
        <button
          className="px-4 py-1 bg-[#bdc2ff] text-[#131e8c] text-[12px] font-medium rounded hover:opacity-90 transition-all active:scale-95"
          style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em", boxShadow: "0px 1px 3px rgba(0,0,0,0.3)" }}
        >
          Publish
        </button>
      </div>
    </header>
  );
}
