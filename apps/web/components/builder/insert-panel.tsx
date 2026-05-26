const BLOCK_GROUPS = [
  {
    title: "Common",
    blocks: [
      { icon: "waving_hand", label: "Welcome", color: "text-[#bdc2ff]" },
      { icon: "short_text", label: "Short Text", color: "text-[#bdc2ff]" },
    ],
  },
  {
    title: "Contact",
    blocks: [
      { icon: "mail", label: "Email", color: "text-[#b9c7e0]" },
      { icon: "call", label: "Phone", color: "text-[#b9c7e0]" },
    ],
  },
  {
    title: "Logic & Choice",
    blocks: [
      { icon: "check_circle", label: "Single Select", color: "text-[#f7bd3e]" },
      { icon: "account_tree", label: "Logic Branch", color: "text-[#f7bd3e]" },
    ],
  },
] as const;

export function BuilderInsertPanel() {
  return (
    <aside className="w-[280px] h-full bg-[#121319] border-r border-[#454653] flex flex-col z-30">
      {/* Header */}
      <div className="p-4 border-b border-[#454653] flex items-center justify-between">
        <span
          className="text-[12px] font-bold uppercase tracking-wider text-[#c6c5d5]"
          style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
        >
          Insert Blocks
        </span>
        <span className="material-symbols-outlined text-[18px] text-[#908f9e] cursor-pointer">
          search
        </span>
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden">
        {BLOCK_GROUPS.map((group) => (
          <div key={group.title}>
            <h3
              className="text-[10px] uppercase tracking-wider text-[#908f9e] mb-2"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              {group.title}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {group.blocks.map((block) => (
                <div
                  key={block.label}
                  className="p-2 bg-[#1b1b22] border border-[#454653] rounded hover:border-[#bdc2ff] cursor-grab flex flex-col gap-1 transition-colors"
                >
                  <span className={`material-symbols-outlined ${block.color}`}>
                    {block.icon}
                  </span>
                  <span
                    className="text-[12px] font-medium text-[#e4e1eb]"
                    style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
                  >
                    {block.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Coming soon placeholder */}
        <div className="p-6 bg-[#0d0e14] rounded border border-dashed border-[#454653] flex flex-col items-center justify-center text-center opacity-50">
          <span className="material-symbols-outlined text-[#908f9e] text-xl mb-1">extension</span>
          <p
            className="text-[12px] text-[#c6c5d5]"
            style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
          >
            More coming soon
          </p>
        </div>
      </div>
    </aside>
  );
}
