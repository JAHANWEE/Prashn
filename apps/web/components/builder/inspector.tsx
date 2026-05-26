export function BuilderInspector() {
  return (
    <aside className="w-[280px] h-full bg-[#121319] border-l border-[#454653] flex flex-col z-30">
      {/* Header */}
      <div className="p-4 border-b border-[#454653] flex items-center gap-2">
        <span className="material-symbols-outlined text-[#bdc2ff]">settings</span>
        <span
          className="text-[12px] font-bold uppercase tracking-widest text-[#e4e1eb]"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          Inspector
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:hidden">
        {/* Question Details */}
        <section className="space-y-4">
          <div className="space-y-1">
            <label
              className="text-[10px] uppercase tracking-wider text-[#908f9e]"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              Node Label
            </label>
            <input
              type="text"
              defaultValue="Role Selection"
              className="w-full bg-[#1b1b22] border border-[#454653] rounded px-2 py-1 text-sm text-[#e4e1eb] focus:ring-2 focus:ring-[#bdc2ff]/20 focus:outline-none"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            />
          </div>
          <div className="space-y-1">
            <label
              className="text-[10px] uppercase tracking-wider text-[#908f9e]"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              Question Text
            </label>
            <textarea
              defaultValue="What is your role?"
              className="w-full bg-[#1b1b22] border border-[#454653] rounded px-2 py-1 text-sm text-[#e4e1eb] h-20 focus:ring-2 focus:ring-[#bdc2ff]/20 focus:outline-none resize-none"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <span
              className="text-[12px] font-medium text-[#e4e1eb]"
              style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
            >
              Required field
            </span>
            <div className="w-10 h-5 bg-[#818cf8] rounded-full relative cursor-pointer shadow-inner">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
        </section>

        <div className="h-[1px] bg-[#454653]" />

        {/* Options Editor */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label
              className="text-[10px] uppercase tracking-wider text-[#908f9e]"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              Options
            </label>
            <button className="material-symbols-outlined text-[18px] text-[#bdc2ff]">add</button>
          </div>
          <div className="space-y-2">
            {["Founder", "Engineer", "Product"].map((option) => (
              <div key={option} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#908f9e] cursor-move">
                  drag_indicator
                </span>
                <input
                  type="text"
                  defaultValue={option}
                  className="flex-1 bg-[#1b1b22] border border-[#454653] rounded px-2 py-1 text-[12px] text-[#e4e1eb] focus:ring-2 focus:ring-[#bdc2ff]/20 focus:outline-none"
                  style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
                />
                <span className="material-symbols-outlined text-[16px] text-[#454653] hover:text-[#ffb4ab] cursor-pointer">
                  delete
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="h-[1px] bg-[#454653]" />

        {/* Logic Preview */}
        <section className="space-y-4">
          <label
            className="text-[10px] uppercase tracking-wider text-[#908f9e]"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            Outgoing Logic
          </label>
          <div className="p-2 bg-[#c08d00]/5 border border-[#c08d00]/30 rounded">
            <p
              className="text-[12px] italic text-[#c6c5d5]"
              style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
            >
              Default mapping active
            </p>
            <p
              className="text-[12px] font-bold text-[#c08d00] mt-1"
              style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
            >
              → Rating Node
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-4 bg-[#1b1b22] border-t border-[#454653] flex items-center justify-between">
        <button
          className="text-[12px] text-[#ffb4ab] hover:underline"
          style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
        >
          Delete Node
        </button>
        <button
          className="text-[12px] font-bold text-[#bdc2ff]"
          style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
        >
          Apply Changes
        </button>
      </div>
    </aside>
  );
}
