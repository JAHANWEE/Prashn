export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="h-10 w-64 bg-[#1b1b22] rounded-lg" />
      <div className="h-5 w-96 bg-[#1b1b22] rounded" />

      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-[#1b1b22] rounded-xl border border-[#454653]" />
        ))}
      </div>

      {/* Form cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-56 bg-[#1b1b22] rounded-xl border border-[#454653]" />
        ))}
      </div>
    </div>
  );
}
