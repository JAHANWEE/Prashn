"use client";

import { trpc } from "~/trpc/client";
import { useAuth } from "@clerk/nextjs";

export function DashboardMetrics() {
  const { isSignedIn } = useAuth();
  const { data: formsList } = trpc.forms.list.useQuery(
    { page: 1, limit: 100 },
    { enabled: !!isSignedIn },
  );

  const totalForms = formsList?.total ?? 0;
  const publishedForms = formsList?.forms.filter((f) => f.status === "published").length ?? 0;
  const publishedPercent = totalForms > 0 ? Math.round((publishedForms / totalForms) * 100) : 0;

  const metrics = [
    {
      label: "Total Forms",
      value: String(totalForms),
      indicator: { type: "trend" as const, text: "All your forms", color: "text-[#bdc2ff]", icon: "description" },
    },
    {
      label: "Published",
      value: String(publishedForms),
      indicator: { type: "progress" as const, percent: publishedPercent },
    },
    {
      label: "Total Responses",
      value: "—",
      indicator: { type: "trend" as const, text: "Across all forms", color: "text-[#bdc2ff]", icon: "chat_bubble_outline" },
    },
    {
      label: "Completion Rate",
      value: "—",
      indicator: { type: "trend" as const, text: "Average", color: "text-[#f7bd3e]", icon: "bolt" },
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </section>
  );
}

type Metric = {
  label: string;
  value: string;
  indicator: { type: "trend"; text: string; color: string; icon: string } | { type: "progress"; percent: number };
};

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
              className="bg-[#bdc2ff] h-full rounded-full transition-all"
              style={{ width: `${metric.indicator.percent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
