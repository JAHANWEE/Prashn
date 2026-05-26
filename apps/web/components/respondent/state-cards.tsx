/**
 * FormStateCards — Inactive/Expired state previews shown below the form.
 */
export function FormStateCards() {
  return (
    <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[560px]">
      {/* Inactive State */}
      <div className="p-4 bg-[#1b1b22] border border-[#454653] rounded shadow-sm opacity-60 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#ffb4ab] text-[20px]">block</span>
          <span className="text-[11px] font-medium uppercase tracking-tight text-[#c6c5d5]">
            Inactive State
          </span>
        </div>
        <h3
          className="text-[14px] font-semibold text-[#e4e1eb] mb-1"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Form not accepting responses
        </h3>
        <p className="text-[12px] text-[#c6c5d5]">
          The creator has manually disabled submissions for this flow.
        </p>
      </div>

      {/* Expired State */}
      <div className="p-4 bg-[#1b1b22] border border-[#454653] rounded shadow-sm opacity-60 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#f7bd3e] text-[20px]">timer_off</span>
          <span className="text-[11px] font-medium uppercase tracking-tight text-[#c6c5d5]">
            Deadline State
          </span>
        </div>
        <h3
          className="text-[14px] font-semibold text-[#e4e1eb] mb-1"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Form expired
        </h3>
        <p className="text-[12px] text-[#c6c5d5]">
          The submission window for this feedback cycle has closed.
        </p>
      </div>
    </section>
  );
}
