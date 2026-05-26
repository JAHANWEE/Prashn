export function DashboardRightPanel() {
  return (
    <aside className="w-full lg:w-[320px] space-y-8">
      <QuickActions />
      <RecentActivity />
    </aside>
  );
}

function QuickActions() {
  return (
    <div
      className="bg-[#0d0e14] border border-[#454653] rounded-xl p-6"
      style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}
    >
      <h3
        className="text-lg font-semibold text-[#e4e1eb] mb-6"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        Quick Actions
      </h3>
      <div className="space-y-4">
        <button className="w-full text-left p-4 border border-[#454653] rounded-lg flex items-center gap-4 hover:bg-[#1b1b22] transition-colors group">
          <span className="material-symbols-outlined text-[#bdc2ff] bg-[#bdc2ff]/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
            account_tree
          </span>
          <div>
            <p className="text-[13px] font-medium text-[#e4e1eb]">New Canvas Form</p>
            <p className="text-[11px] text-[#c6c5d5]">Visual node editor</p>
          </div>
        </button>
        <button className="w-full text-left p-4 border border-[#454653] rounded-lg flex items-center gap-4 hover:bg-[#1b1b22] transition-colors group">
          <span className="material-symbols-outlined text-[#f7bd3e] bg-[#c08d00]/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
            temp_preferences_custom
          </span>
          <div>
            <p className="text-[13px] font-medium text-[#e4e1eb]">Use Template</p>
            <p className="text-[11px] text-[#c6c5d5]">20+ verified flows</p>
          </div>
        </button>
      </div>
    </div>
  );
}

const ACTIVITIES = [
  {
    icon: "check_circle",
    iconBg: "bg-green-900",
    iconColor: "text-green-300",
    title: "New Response",
    subtitle: "Startup Feedback Flow",
    time: "12 minutes ago",
  },
  {
    icon: "edit",
    iconBg: "bg-[#818cf8]",
    iconColor: "text-[#101b8a]",
    title: "Flow Updated",
    subtitle: "Hiring Application Flow",
    time: "2 hours ago",
  },
  {
    icon: "cloud_upload",
    iconBg: "bg-[#c08d00]",
    iconColor: "text-[#3e2b00]",
    title: "Form Published",
    subtitle: "Startup Feedback Flow",
    time: "5 hours ago",
  },
] as const;

function RecentActivity() {
  return (
    <div
      className="bg-[#0d0e14] border border-[#454653] rounded-xl p-6"
      style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}
    >
      <h3
        className="text-lg font-semibold text-[#e4e1eb] mb-6"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        Recent Activity
      </h3>
      <div className="space-y-8 relative">
        {/* Timeline line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-[#454653]" />

        {ACTIVITIES.map((activity) => (
          <div key={activity.title + activity.time} className="flex gap-4 relative">
            <div
              className={`w-6 h-6 rounded-full ${activity.iconBg} border-2 border-[#0d0e14] flex items-center justify-center z-10 shrink-0`}
            >
              <span className={`material-symbols-outlined text-[14px] ${activity.iconColor}`}>
                {activity.icon}
              </span>
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#e4e1eb]">{activity.title}</p>
              <p className="text-[11px] text-[#c6c5d5]">{activity.subtitle}</p>
              <p className="text-[11px] text-[#c6c5d5] opacity-60 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
