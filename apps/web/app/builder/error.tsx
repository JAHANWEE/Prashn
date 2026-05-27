"use client";

export default function BuilderError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="h-screen flex items-center justify-center bg-[#121319]">
      <div className="text-center">
        <span className="material-symbols-outlined text-[40px] text-[#ffb4ab] block mb-3">error</span>
        <h2 className="text-[16px] font-medium text-[#e4e1eb] mb-2">Builder Error</h2>
        <p className="text-[12px] text-[#908f9e] mb-4 max-w-xs">{error.message || "Something went wrong in the builder."}</p>
        <div className="flex gap-3 justify-center">
          <a href="/dashboard" className="px-4 py-2 text-[11px] font-medium border border-[#454653] text-[#c6c5d5] rounded-lg hover:bg-[#1f1f26]">
            Back to Dashboard
          </a>
          <button
            onClick={reset}
            className="px-4 py-2 text-[11px] font-medium bg-[#fca9d4] text-[#0a0a0f] rounded-lg hover:brightness-110 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
