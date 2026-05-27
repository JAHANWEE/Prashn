export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-6 pt-24 animate-pulse">
        <div className="h-8 w-64 bg-[#1e212d] rounded-lg mb-4" />
        <div className="h-4 w-96 bg-[#1e212d] rounded mb-8" />
        <div className="h-10 w-80 bg-[#1e212d] rounded-xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 rounded-2xl bg-[#0f111a] border border-[#1e212d]" />
          ))}
        </div>
      </div>
    </div>
  );
}
