import {
  AnalyticsMetrics,
  TimelineChart,
  FlowDropoff,
  RoleDistribution,
  ResponsesTable,
} from "~/components/analytics";

export default function AnalyticsPage() {
  return (
    <>
      {/* Top header */}
      <div className="sticky top-0 bg-[#0d0e14] border-b border-[#454653] z-40 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <span
            className="text-lg font-bold text-[#bdc2ff]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            CanvasForms
          </span>
          <nav className="hidden md:flex items-center gap-8">
            {["Canvas", "Preview", "Responses"].map((tab) => (
              <a
                key={tab}
                href="#"
                className="text-[12px] font-medium text-[#c6c5d5] hover:text-[#bdc2ff] transition-all pb-1"
                style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
              >
                {tab}
              </a>
            ))}
            <a
              href="#"
              className="text-[12px] font-medium text-[#bdc2ff] border-b-2 border-[#bdc2ff] pb-1"
              style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
            >
              Analytics
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-1 text-[#c6c5d5] hover:text-[#bdc2ff] transition-all active:scale-95">
            <span className="material-symbols-outlined">save</span>
          </button>
          <button className="p-1 text-[#c6c5d5] hover:text-[#bdc2ff] transition-all active:scale-95">
            <span className="material-symbols-outlined">cloud_done</span>
          </button>
          <button className="px-4 py-2 border border-[#454653] rounded-lg text-[12px] font-medium text-[#e4e1eb] hover:bg-[#1b1b22] transition-all active:scale-95" style={{ fontFamily: "var(--font-geist-mono)" }}>
            Share
          </button>
          <button className="px-4 py-2 bg-[#bdc2ff] text-[#131e8c] rounded-lg text-[12px] font-medium hover:opacity-90 transition-all active:scale-95" style={{ fontFamily: "var(--font-geist-mono)" }}>
            Publish
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Page header + flow selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2
              className="text-[32px] font-semibold text-[#e4e1eb]"
              style={{ fontFamily: "var(--font-geist-sans)", lineHeight: "1.2", letterSpacing: "-0.02em" }}
            >
              Flow Analytics
            </h2>
            <p className="text-sm text-[#c6c5d5]" style={{ fontFamily: "var(--font-geist-sans)" }}>
              In-depth performance data for your active flows
            </p>
          </div>
          <div className="relative min-w-[240px]">
            <select
              className="w-full bg-[#1b1b22] border border-[#454653] text-[#e4e1eb] rounded-lg py-2 pl-4 pr-10 appearance-none text-[12px] font-medium focus:ring-2 focus:ring-[#bdc2ff]/20 focus:border-[#bdc2ff] outline-none"
              style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
              defaultValue="startup"
            >
              <option value="startup">Startup Feedback Flow</option>
              <option value="onboarding">User Onboarding Survey</option>
              <option value="support">Contact Support Form</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#908f9e]">
              expand_more
            </span>
          </div>
        </div>

        {/* KPI Metrics */}
        <AnalyticsMetrics />

        {/* Timeline Chart */}
        <TimelineChart />

        {/* Flow Dropoff + Role Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FlowDropoff />
          <RoleDistribution />
        </div>

        {/* Responses Table */}
        <ResponsesTable />
      </div>

      {/* Footer */}
      <footer className="w-full py-8 bg-[#1b1b22] border-t border-[#454653] flex flex-col items-center gap-2 mt-8">
        <span
          className="text-[12px] font-black text-[#c6c5d5] opacity-70"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          CanvasForms
        </span>
        <div className="flex gap-6">
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-all">Privacy</a>
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-all">Terms</a>
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-all">Support</a>
        </div>
        <p className="text-[11px] text-[#c6c5d5] opacity-50 mt-2">Built with CanvasForms © 2024</p>
      </footer>
    </>
  );
}
