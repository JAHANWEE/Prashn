import { cn } from "~/lib/utils";

const TOOLS_TOP = [
  { icon: "near_me", label: "Select", active: true },
  { icon: "pan_tool", label: "Pan", active: false },
] as const;

const TOOLS_BOTTOM = [
  { icon: "add_to_photos", label: "Add Screen" },
  { icon: "add_circle", label: "Add Question" },
  { icon: "conversion_path", label: "Connect Nodes" },
  { icon: "crop_free", label: "Frame Area" },
] as const;

export function BuilderToolbar() {
  return (
    <aside className="w-16 h-full bg-[#0d0e14] border-r border-[#454653] flex flex-col items-center py-4 gap-6 z-40">
      {/* Selection tools */}
      <div className="flex flex-col gap-2">
        {TOOLS_TOP.map(({ icon, label, active }) => (
          <button
            key={icon}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded transition-colors",
              active
                ? "bg-[#e0e0ff] text-[#2f3aa3]"
                : "text-[#c6c5d5] hover:bg-[#1b1b22]",
            )}
            title={label}
          >
            <span className="material-symbols-outlined">{icon}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-8 h-[1px] bg-[#454653]" />

      {/* Creation tools */}
      <div className="flex flex-col gap-2">
        {TOOLS_BOTTOM.map(({ icon, label }) => (
          <button
            key={icon}
            className="w-10 h-10 flex items-center justify-center rounded text-[#c6c5d5] hover:bg-[#1b1b22] transition-colors"
            title={label}
          >
            <span className="material-symbols-outlined">{icon}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
