"use client";

import { useState } from "react";
import { trpc } from "~/trpc/client";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.public.listPublicForms.useQuery({
    page,
    limit: 12,
    search: search || undefined,
  });

  const forms = data?.forms ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e4e1eb]">
      {/* Nav */}
      <header className="border-b border-[#1e212d] bg-[#0f111a]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center bg-[#fca9d4]">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1" fill="#0a0a0f"/><rect x="10" y="2" width="6" height="6" rx="1" fill="#0a0a0f" opacity="0.6"/><rect x="2" y="10" width="6" height="6" rx="1" fill="#0a0a0f" opacity="0.6"/><rect x="10" y="10" width="6" height="6" rx="1" fill="#0a0a0f"/></svg>
            </div>
            <span className="text-base font-bold tracking-tight text-[#fca9d4]" style={{ fontFamily: "var(--font-geist-sans)" }}>CanvasForms</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-[11px] font-medium text-[#c6c5d5] hover:text-[#fca9d4] transition-colors" style={{ fontFamily: "var(--font-geist-mono)" }}>Sign In</a>
            <a href="/register" className="text-[11px] font-medium px-4 py-1.5 rounded-lg bg-[#fca9d4] text-[#0a0a0f] hover:brightness-110 transition-all" style={{ fontFamily: "var(--font-geist-mono)" }}>Get Started</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: "var(--font-geist-sans)" }}>
          Explore Public Forms
        </h1>
        <p className="text-[14px] text-[#908f9e] mb-8">
          Browse forms created by the community. Fill them out instantly — no account needed.
        </p>

        {/* Search */}
        <div className="relative max-w-md mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#5a5a6e]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search forms..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0f111a] border border-[#1e212d] rounded-xl text-[13px] text-[#e4e1eb] placeholder:text-[#5a5a6e] focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4]/40 outline-none transition-all"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {["All", "Startup", "Events", "Hiring", "Feedback", "Survey"].map((cat) => (
            <button
              key={cat}
              onClick={() => { setSearch(cat === "All" ? "" : cat); setPage(1); }}
              className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
              style={{
                background: (cat === "All" && !search) || search === cat ? "#fca9d4" : "#0f111a",
                color: (cat === "All" && !search) || search === cat ? "#0a0a0f" : "#908f9e",
                border: `1px solid ${(cat === "All" && !search) || search === cat ? "#fca9d4" : "#1e212d"}`,
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-[#0f111a] border border-[#1e212d] animate-pulse" />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-[48px] text-[#2d2d3a] block mb-3">search_off</span>
            <p className="text-[15px] text-[#5a5a6e]">No public forms found</p>
            {search && <p className="text-[12px] text-[#3a3a4a] mt-1">Try a different search term</p>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {forms.map((form) => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-[11px] font-medium border border-[#1e212d] rounded-lg text-[#908f9e] hover:text-[#e4e1eb] hover:border-[#454653] disabled:opacity-30 transition-colors"
                >
                  Previous
                </button>
                <span className="text-[11px] text-[#5a5a6e] px-3" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-[11px] font-medium border border-[#1e212d] rounded-lg text-[#908f9e] hover:text-[#e4e1eb] hover:border-[#454653] disabled:opacity-30 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e212d] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-[11px] text-[#5a5a6e]">© 2024 CanvasForms</span>
          <div className="flex gap-4">
            <a href="/" className="text-[11px] text-[#5a5a6e] hover:text-[#fca9d4] transition-colors">Home</a>
            <a href="/pricing" className="text-[11px] text-[#5a5a6e] hover:text-[#fca9d4] transition-colors">Pricing</a>
            <a href="/login" className="text-[11px] text-[#5a5a6e] hover:text-[#fca9d4] transition-colors">Sign In</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Form Card ───────────────────────────────────────────────────────────────

function FormCard({ form }: { form: { id: string; title: string; description: string | null; slug: string } }) {
  return (
    <a
      href={`/form/${form.slug}`}
      className="group block rounded-2xl border border-[#1e212d] bg-[#0f111a] overflow-hidden hover:border-[#fca9d4]/40 transition-all duration-200"
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#fca9d4]/40 via-[#fca9d4]/20 to-transparent group-hover:from-[#fca9d4]/70 group-hover:via-[#fca9d4]/40 transition-all" />

      <div className="p-6">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-[#fca9d4]/10 border border-[#fca9d4]/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[20px] text-[#fca9d4]">description</span>
        </div>

        {/* Title */}
        <h3
          className="text-[15px] font-semibold text-[#e4e1eb] mb-1.5 group-hover:text-[#fca9d4] transition-colors line-clamp-1"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          {form.title}
        </h3>

        {/* Description */}
        <p className="text-[12px] text-[#908f9e] line-clamp-2 mb-4 min-h-[32px]">
          {form.description || "No description"}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#5a5a6e] flex items-center gap-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
            <span className="material-symbols-outlined text-[12px]">link</span>
            /{form.slug}
          </span>
          <span className="text-[11px] text-[#fca9d4] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-medium">
            Fill out
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </a>
  );
}
