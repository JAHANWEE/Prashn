const METRICS = [
  {
    label: "Total Forms",
    value: "24",
    indicator: { type: "trend" as const, text: "+12% this month", color: "text-green-400", icon: "trending_up" },
  },
  {
    label: "Published Forms",
    value: "18",
    indicator: { type: "progress" as const, percent: 75 },
  },
  {
    label: "Total Responses",
    value: "1.2k",
    indicator: { type: "trend" as const, text: "8k total views", color: "text-[#bdc2ff]", icon: "visibility" },
  },
  {
    label: "Completion Rate",
    value: "64%",
    indicator: { type: "trend" as const, text: "Average time 2:14", color: "text-[#f7bd3e]", icon: "bolt" },
  },
] as const;

export function DashboardMetrics() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {METRICS.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </section>
  );
}

type Metric = (typeof METRICS)[number];

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div
      className="bg-[#0d0e14] border border-[#454653] p-6 rounded-xl"
      style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}
    >
      <p
        className="text-[11px] tracking-wider uppercase text-[#c6c5d5] font-medium"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        {metric.label}
      </p>
      <h3
        className="text-2xl font-semibold text-[#e4e1eb] mt-1"
        style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.01em" }}
      >
        {metric.value}
      </h3>
      <div className="mt-4">
        {metric.indicator.type === "trend" && (
          <div className={`flex items-center gap-1 text-[11px] font-medium ${metric.indicator.color}`}>
            <span className="material-symbols-outlined text-[16px]">{metric.indicator.icon}</span>
            <span>{metric.indicator.text}</span>
          </div>
        )}
        {metric.indicator.type === "progress" && (
          <div className="w-full bg-[#292930] h-1 rounded-full overflow-hidden">
            <div
              className="bg-[#bdc2ff] h-full rounded-full"
              style={{ width: `${metric.indicator.percent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
