const NODES = [
  { label: "Welcome", percent: 100, color: "text-[#bdc2ff]" },
  { label: "Role Selection", percent: 74, color: "text-[#f7bd3e]" },
  { label: "Rating Step", percent: 68, color: "text-[#f7bd3e]" },
] as const;

export function FlowDropoff() {
  return (
    <div className="lg:col-span-2 bg-[#1b1b22] p-6 rounded-xl border border-[#454653] shadow-sm">
      <h3
        className="text-lg font-medium text-[#e4e1eb] mb-8"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        Flow Drop-off Analysis
      </h3>
      <div className="flex items-center justify-between overflow-x-auto pb-6 gap-8">
        {NODES.map((node, i) => (
          <div key={node.label} className="flex flex-col items-center shrink-0">
            <div
              className={`w-40 bg-[#1f1f26] p-4 border border-[#454653] rounded-lg relative ${
                i < NODES.length - 1 ? "cf-flow-line" : ""
              }`}
            >
              <span
                className="text-[12px] font-medium text-[#e4e1eb] block mb-1"
                style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
              >
                {node.label}
              </span>
              <div className="h-2 w-full bg-[#292930] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#bdc2ff] rounded-full"
                  style={{ width: `${node.percent}%` }}
                />
              </div>
              <span
                className={`text-[11px] mt-1 block ${node.color}`}
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                {node.percent}% Retention
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
