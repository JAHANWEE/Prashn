const CATEGORIES = [
  { label: "All Templates", active: true },
  { label: "Startup", active: false },
  { label: "Events", active: false },
  { label: "Hiring", active: false },
  { label: "Marketing", active: false },
] as const;

export function TemplateGalleryHeader() {
  return (
    <div className="sticky top-0 bg-[#121319]/80 backdrop-blur-md z-30 px-8 py-6 border-b border-[#454653]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2
            className="text-[30px] font-semibold text-[#e4e1eb]"
            style={{ fontFamily: "var(--font-geist-sans)", lineHeight: "38px", letterSpacing: "-0.02em" }}
          >
            Templates
          </h2>
          <p className="text-sm text-[#c6c5d5]" style={{ fontFamily: "var(--font-geist-sans)" }}>
            Accelerate your workflow with pre-built engineering-grade forms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[#908f9e] text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search templates..."
              className="pl-8 pr-4 py-2 bg-[#0d0e14] border border-[#454653] rounded-lg w-64 text-[13px] text-[#e4e1eb] placeholder:text-[#908f9e] focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4] outline-none transition-all"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            />
          </div>
          {/* Filter button */}
          <button className="p-2 border border-[#454653] rounded-lg hover:bg-[#1b1b22] transition-all">
            <span className="material-symbols-outlined text-[#c6c5d5]">tune</span>
          </button>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 mt-4">
        {CATEGORIES.map(({ label, active }) => (
          <button
            key={label}
            className={
              active
                ? "px-4 py-1 bg-[#fca9d4] text-[#ffffff] rounded-full text-[13px] font-medium"
                : "px-4 py-1 bg-[#1b1b22] text-[#c6c5d5] border border-[#454653]/50 rounded-full text-[13px] font-medium hover:border-[#fca9d4] hover:text-[#fca9d4] transition-all"
            }
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
