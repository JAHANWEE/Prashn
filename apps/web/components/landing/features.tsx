export function LandingFeatures() {
  return (
    <section id="features" className="py-16 px-6 bg-[#1b1b22]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Large Feature: Logic Builder (8 cols) */}
          <div className="md:col-span-8 border border-[#454653] rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative group bg-[#1f1f26]">
            <div className="relative z-10">
              <span
                className="text-xs font-medium tracking-widest px-4 py-1 rounded-full mb-4 inline-block bg-[#bdc2ff]/10 text-[#bdc2ff]"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                LOGIC ENGINE
              </span>
              <h3
                className="text-2xl font-semibold mb-2 text-[#e4e1eb]"
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  letterSpacing: "-0.01em",
                }}
              >
                Dynamic Validation
              </h3>
              <p
                className="text-sm leading-relaxed max-w-sm text-[#c6c5d5]"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                Create complex conditional paths and real-time validation without
                writing a single line of code.
              </p>
            </div>

            {/* Logic rule preview — slides up on hover */}
            <div className="mt-8 translate-y-8 group-hover:translate-y-4 transition-transform duration-500">
              <div className="border border-[#454653] rounded-t-xl shadow-lg p-4 flex flex-col gap-3 bg-[#292930]">
                <div className="flex items-center gap-3 border-b border-[#454653] pb-3">
                  <span className="material-symbols-outlined text-[#bdc2ff]">account_tree</span>
                  <span
                    className="text-xs font-medium text-[#e4e1eb]"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    IF field &apos;Email&apos; contains &apos;@company.com&apos;
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#b9c7e0]">arrow_forward</span>
                  <span
                    className="text-xs font-medium text-[#e4e1eb]"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    THEN show &apos;Internal Department&apos; dropdown
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Small Feature: Analytics (4 cols) */}
          <div className="md:col-span-4 rounded-2xl p-8 flex flex-col justify-between shadow-lg bg-[#bdc2ff] text-[#131e8c]">
            <div>
              <span className="material-symbols-outlined text-[48px] mb-4 block opacity-80">
                analytics
              </span>
              <h3
                className="text-2xl font-semibold mb-2"
                style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.01em" }}
              >
                Response Insights
              </h3>
              <p
                className="text-sm leading-relaxed opacity-80"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                Track drop-off rates for every node and optimize your flow for
                maximum conversion.
              </p>
            </div>
            <div
              className="mt-4 text-xs font-medium tracking-widest p-3 rounded border bg-[#131e8c]/10 border-[#131e8c]/20"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              84% COMPLETION RATE
            </div>
          </div>

          {/* Small Feature: Finite Screens (4 cols) */}
          <div className="md:col-span-4 border border-[#454653] rounded-2xl p-8 flex flex-col justify-between bg-[#1f1f26]">
            <div>
              <h3
                className="text-lg font-medium mb-2 text-[#e4e1eb]"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                Finite Screens
              </h3>
              <p
                className="text-sm leading-relaxed text-[#c6c5d5]"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                Your users see one focused card at a time. No overwhelming forms.
              </p>
            </div>
            <div className="rounded-lg shadow-sm p-1 border border-[#454653] mt-4 bg-[#292930]">
              <div className="flex items-center gap-1 mb-1 px-1 pt-1">
                <div className="h-1 flex-1 rounded bg-[#bdc2ff]" />
                <div className="h-1 flex-1 rounded bg-[#454653]/30" />
                <div className="h-1 flex-1 rounded bg-[#454653]/30" />
              </div>
              <div className="h-20 rounded-sm bg-[#1b1b22]" />
            </div>
          </div>

          {/* Medium Feature: Publishing Controls (8 cols) */}
          <div className="md:col-span-8 border border-[#454653] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 bg-[#1f1f26]">
            <div className="flex-1">
              <h3
                className="text-2xl font-semibold mb-2 text-[#e4e1eb]"
                style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.01em" }}
              >
                Publishing Controls
              </h3>
              <p
                className="text-sm leading-relaxed mb-4 text-[#c6c5d5]"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                Embed on your site, use a custom domain, or share a direct link.
                Control accessibility and deadlines with a toggle.
              </p>
              <div className="flex gap-3">
                {["link", "code", "public"].map((icon) => (
                  <span key={icon} className="material-symbols-outlined text-[#bdc2ff]">
                    {icon}
                  </span>
                ))}
              </div>
            </div>

            {/* Settings mockup */}
            <div className="shrink-0 w-48 h-48 rounded-xl border border-[#454653] overflow-hidden opacity-80">
              <div className="w-full h-full p-4 flex flex-col gap-3 bg-[#292930]">
                {[
                  { label: "Custom Domain", on: true },
                  { label: "Embed Code", on: false },
                  { label: "Public Access", on: true },
                  { label: "Deadline", on: false },
                ].map(({ label, on }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span
                      className="text-[10px] text-[#c6c5d5]"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {label}
                    </span>
                    <div
                      className="w-7 h-4 rounded-full flex items-center px-0.5"
                      style={{ backgroundColor: on ? "#bdc2ff" : "#454653" }}
                    >
                      <div
                        className="w-3 h-3 rounded-full transition-transform"
                        style={{
                          backgroundColor: on ? "#131e8c" : "#1f1f26",
                          transform: on ? "translateX(12px)" : "translateX(0)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
