/**
 * DemoCredentials — Subtle info card showing demo environment credentials.
 */
export function DemoCredentials() {
  return (
    <div className="w-full bg-[#161620] border border-[#353540] rounded-xl px-5 py-4 flex items-center gap-3">
      <div className="p-1.5 bg-[#fca9d4]/10 rounded-lg shrink-0">
        <span
          className="material-symbols-outlined text-[18px] text-[#fca9d4]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          info
        </span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p
          className="text-[12px] font-semibold text-[#c6c5d5]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Demo credentials
        </p>
        <p className="text-[11px] text-[#908f9e] truncate" style={{ fontFamily: "var(--font-geist-mono)" }}>
          admin@prashn.io / canvas_demo_2024
        </p>
      </div>
    </div>
  );
}
