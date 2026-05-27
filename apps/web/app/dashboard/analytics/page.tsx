"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { trpc } from "~/trpc/client";

export default function AnalyticsPage() {
  const { isSignedIn } = useAuth();
  const { data: formsList } = trpc.forms.list.useQuery(
    { page: 1, limit: 50 },
    { enabled: !!isSignedIn },
  );

  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const activeFormId = selectedFormId ?? formsList?.forms[0]?.id ?? null;

  const { data: overview } = trpc.analytics.overview.useQuery(
    { formId: activeFormId! },
    { enabled: !!activeFormId && !!isSignedIn },
  );

  const { data: timeline } = trpc.analytics.timeline.useQuery(
    { formId: activeFormId!, days: 7 },
    { enabled: !!activeFormId && !!isSignedIn },
  );

  const { data: dropoff } = trpc.analytics.fieldDropoff.useQuery(
    { formId: activeFormId! },
    { enabled: !!activeFormId && !!isSignedIn },
  );

  const exportCsv = trpc.responses.export.useQuery(
    { formId: activeFormId! },
    { enabled: false }, // Only fetch on demand
  );

  const handleExportCsv = async () => {
    if (!activeFormId) return;
    const result = await exportCsv.refetch();
    if (result.data) {
      const { rows, filename } = result.data;
      if (rows.length === 0) {
        return; // No data to export
      }
      // Convert to CSV
      const headers = Object.keys(rows[0]!);
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => headers.map((h) => `"${(row[h] ?? "").replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      // Download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-[#0d0e14] border-b border-[#454653] z-40 h-16 flex items-center justify-between px-6">
        <span className="text-lg font-bold text-[#fca9d4]" style={{ fontFamily: "var(--font-geist-sans)" }}>
          Analytics
        </span>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Page header + form selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-[28px] font-semibold text-[#e4e1eb]" style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.02em" }}>
              Flow Analytics
            </h2>
            <p className="text-sm text-[#c6c5d5]">Performance data for your forms</p>
          </div>
          {formsList && formsList.forms.length > 0 && (
            <select
              value={activeFormId ?? ""}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="bg-[#1b1b22] border border-[#454653] text-[#e4e1eb] rounded-lg py-2 pl-4 pr-10 text-[13px] font-medium focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4] outline-none appearance-none"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              {formsList.forms.map((f) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          )}
        </div>

        {/* KPI Metrics + Export */}
        {overview && (
          <>
            <div className="flex items-center justify-between">
              <div />
              <button
                onClick={() => handleExportCsv()}
                disabled={!activeFormId}
                className="flex items-center gap-2 px-4 py-2 border border-[#454653] rounded-lg text-[12px] font-medium text-[#e4e1eb] hover:bg-[#1b1b22] transition-all active:scale-95 disabled:opacity-50"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export CSV
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard label="Total Responses" value={String(overview.totalResponses)} sub={`${overview.totalViews} views`} color="text-[#fca9d4]" icon="chat_bubble_outline" />
              <MetricCard label="Completion Rate" value={`${overview.completionRate}%`} sub={`${overview.totalStarts} starts`} color="text-[#f7bd3e]" icon="percent" />
              <MetricCard label="Avg Duration" value={`${Math.floor(overview.avgDurationSeconds / 60)}m ${overview.avgDurationSeconds % 60}s`} sub="per response" color="text-[#b9c7e0]" icon="timer" />
            </div>
          </>
        )}

        {/* Timeline Chart */}
        {timeline && timeline.length > 0 && (
          <div className="bg-[#1b1b22] p-6 rounded-xl border border-[#454653]">
            <h3 className="text-lg font-medium text-[#e4e1eb] mb-4" style={{ fontFamily: "var(--font-geist-sans)" }}>
              Response Timeline (7 days)
            </h3>
            <div className="h-48 flex items-end justify-between gap-2 px-2">
              {timeline.map((day, i) => {
                const maxVal = Math.max(...timeline.map((d) => d.completions), 1);
                const height = (day.completions / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[#fca9d4] hover:bg-[#fca9d4] rounded-t transition-all cursor-pointer"
                      style={{ height: `${Math.max(height, 4)}%`, opacity: 0.7 }}
                      title={`${day.completions} completions`}
                    />
                    <span className="text-[9px] text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                      {day.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Field Drop-off */}
        {dropoff && dropoff.length > 0 && (
          <div className="bg-[#1b1b22] p-6 rounded-xl border border-[#454653]">
            <h3 className="text-lg font-medium text-[#e4e1eb] mb-4" style={{ fontFamily: "var(--font-geist-sans)" }}>
              Field Drop-off
            </h3>
            <div className="space-y-3">
              {dropoff.map((field) => (
                <div key={field.fieldId} className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#e4e1eb] font-medium" style={{ fontFamily: "var(--font-geist-mono)" }}>
                      {field.position}. {field.label}
                    </span>
                    <span className="text-[#fca9d4]">{field.retentionPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#292930] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#fca9d4] rounded-full transition-all"
                      style={{ width: `${field.retentionPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!activeFormId && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-[48px] text-[#454653] mb-4 block">analytics</span>
            <p className="text-[#908f9e]">No forms yet. Create a form to see analytics.</p>
          </div>
        )}
      </div>
    </>
  );
}

function MetricCard({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: string }) {
  return (
    <div className="bg-[#0d0e14] border border-[#454653] p-6 rounded-xl" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}>
      <p className="text-[11px] tracking-wider uppercase text-[#c6c5d5] font-medium mb-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
        {label}
      </p>
      <h3 className="text-2xl font-semibold text-[#e4e1eb]" style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.01em" }}>
        {value}
      </h3>
      <div className={`flex items-center gap-1 text-[11px] font-medium mt-3 ${color}`}>
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
        <span>{sub}</span>
      </div>
    </div>
  );
}
