const RESPONSES = [
  { date: "2 mins ago", email: "sarah.j@example.com", role: "Designer", rating: 5, status: "COMPLETED" as const },
  { date: "15 mins ago", email: "mike_dev@github.io", role: "Engineer", rating: 4, status: "COMPLETED" as const },
  { date: "42 mins ago", email: "l.chen@startup.co", role: "Product Manager", rating: 0, status: "ABANDONED" as const },
  { date: "1 hour ago", email: "david.smith@enterprise.com", role: "Designer", rating: 3, status: "COMPLETED" as const },
] as const;

export function ResponsesTable() {
  return (
    <div className="bg-[#1b1b22] rounded-xl border border-[#454653] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#454653] flex items-center justify-between">
        <h3
          className="text-lg font-medium text-[#e4e1eb]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Latest Responses
        </h3>
        <button className="flex items-center gap-1 px-4 py-2 border border-[#454653] rounded-lg text-[12px] font-medium text-[#e4e1eb] hover:bg-[#292930] transition-all active:scale-95 group">
          <span className="material-symbols-outlined text-[#908f9e] group-hover:text-[#bdc2ff] text-[18px]">
            download
          </span>
          <span style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}>
            CSV Export
          </span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1f1f26]">
            <tr>
              {["Date", "User Email", "Role", "Rating", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-[12px] font-medium text-[#c6c5d5]"
                  style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#454653]">
            {RESPONSES.map((r) => (
              <tr
                key={r.email}
                className="hover:bg-[#1f1f26] transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#e4e1eb]">{r.date}</td>
                <td className="px-6 py-4 text-sm text-[#e4e1eb]">{r.email}</td>
                <td className="px-6 py-4 text-sm text-[#e4e1eb]">{r.role}</td>
                <td className="px-6 py-4">
                  {r.rating > 0 ? (
                    <div className="flex text-[#f7bd3e]">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined text-sm"
                          style={{ fontVariationSettings: i < r.rating ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-[#908f9e]">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 flex items-center justify-between bg-[#1f1f26]">
        <span
          className="text-[11px] text-[#c6c5d5]"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          Showing 4 of 1,284 responses
        </span>
        <div className="flex gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded border border-[#454653] hover:bg-[#292930] text-[#e4e1eb]">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-[#454653] hover:bg-[#292930] text-[#e4e1eb]">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "COMPLETED" | "ABANDONED" }) {
  const styles =
    status === "COMPLETED"
      ? "bg-green-900/40 text-green-300"
      : "bg-amber-900/40 text-amber-300";

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${styles}`}>
      {status}
    </span>
  );
}
