const ROLES = [
  { label: "Designer", percent: 42 },
  { label: "Engineer", percent: 38 },
  { label: "Product Manager", percent: 15 },
  { label: "Other", percent: 5 },
] as const;

export function RoleDistribution() {
  return (
    <div className="bg-[#1b1b22] p-6 rounded-xl border border-[#454653] shadow-sm">
      <h3
        className="text-lg font-medium text-[#e4e1eb] mb-6"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        Role Distribution
      </h3>
      <div className="space-y-4">
        {ROLES.map((role) => (
          <div key={role.label} className="space-y-1">
            <div className="flex justify-between">
              <span
                className="text-[12px] font-medium text-[#e4e1eb]"
                style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
              >
                {role.label}
              </span>
              <span
                className="text-[12px] text-[#c6c5d5]"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                {role.percent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#292930] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#bdc2ff] rounded-full"
                style={{ width: `${role.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
