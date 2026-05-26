const BARS = [40, 55, 45, 85, 60, 70, 50, 65];
const DATES = ["Oct 12", "Oct 13", "Oct 14", "Oct 15", "Oct 16", "Oct 17", "Oct 18", "Oct 19"];

export function TimelineChart() {
  return (
    <div className="bg-[#1b1b22] p-6 rounded-xl border border-[#454653] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-lg font-medium text-[#e4e1eb]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Response Timeline
        </h3>
        <div className="flex gap-1">
          {["7D", "30D", "ALL"].map((period, i) => (
            <button
              key={period}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                i === 0
                  ? "bg-[#292930] text-[#bdc2ff]"
                  : "text-[#c6c5d5] hover:bg-[#292930]"
              }`}
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="h-64 w-full relative">
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
          {BARS.map((height, i) => (
            <div
              key={i}
              className={`w-12 rounded-t cursor-pointer transition-all hover:opacity-80 ${
                height === 85 ? "bg-[#bdc2ff]" : "bg-[#bdc2ff]/20 hover:bg-[#bdc2ff]/40"
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        {/* Axis lines */}
        <div className="absolute bottom-4 left-0 right-0 h-[1px] bg-[#454653]/30" />
        <div className="absolute top-0 bottom-4 left-4 w-[1px] bg-[#454653]/30" />
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between px-4 mt-2">
        {DATES.map((d) => (
          <span
            key={d}
            className="text-[11px] text-[#c6c5d5] opacity-50"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}
