"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <span className="material-symbols-outlined text-[40px] text-[#ffb4ab] block mb-3">error</span>
        <h2 className="text-[16px] font-medium text-[#e4e1eb] mb-2">Something went wrong</h2>
        <p className="text-[12px] text-[#908f9e] mb-4 max-w-xs">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="px-4 py-2 text-[11px] font-medium bg-[#fca9d4] text-[#0a0a0f] rounded-lg hover:brightness-110 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
