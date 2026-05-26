const METRICS = [
  {
    label: "Total Responses",
    value: "1,284",
    trend: { direction: "up" as const, text: "+12%", color: "text-[#bdc2ff]" },
  },
  {
    label: "Completion Rate",
    value: "68.2%",
    trend: { direction: "down" as const, text: "-2.4%", color: "text-[#ffb4ab]" },
  },
  {
    label: "Drop-off Node",
    value: "Role Select",
    trend: { direction: "neutral" as const, text: "Step 3", color: "text-[#c6c5d5] opacity-60" },
  },
] as const;

export function AnalyticsMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {METRICS.map((m) => (
        <div
          key={m.label}
          className="bg-[#1b1b22] p-6 rounded-xl border border-[#454653] shadow-sm flex flex-col"
        >
          <span
            className="text-[#c6c5d5] text-[12px] font-medium mb-2"
            style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
          >
            {m.label}
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className="text-[32px] font-semibold text-[#e4e1eb]"
              style={{ fontFamily: "var(--font-geist-sans)", lineHeight: "1.2", letterSpacing: "-0.02em" }}
            >
              {m.value}
            </span>
            <span className={`text-[12px] font-medium flex items-center ${m.trend.color}`}>
              {m.trend.direction !== "neutral" && (
                <span className="material-symbols-outlined text-[14px]">
                  {m.trend.direction === "up" ? "trending_up" : "trending_down"}
                </span>
              )}
              {m.trend.text}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
