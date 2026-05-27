const PLANS = [
  {
    id: "free",
    name: "FREE",
    price: "$0",
    period: "/MONTH",
    features: ["100 responses/mo", "3 forms", "Infinite Canvas"],
    cta: "COMING SOON",
    highlighted: false,
  },
  {
    id: "pro",
    name: "PRO",
    price: "$29",
    period: "/MONTH",
    features: [
      "5,000 responses/mo",
      "Unlimited forms",
      "Custom domains",
      "Logic branching",
    ],
    cta: "COMING SOON",
    highlighted: true,
    badge: "RECOMMENDED",
  },
  {
    id: "team",
    name: "TEAM",
    price: "$99",
    period: "/MONTH",
    features: ["50,000 responses/mo", "Shared workspaces", "Advanced API access"],
    cta: "COMING SOON",
    highlighted: false,
  },
] as const;

export function LandingPricing() {
  return (
    <section id="pricing" className="py-16 px-6 bg-[#0d0e14]">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-semibold mb-2 text-[#e4e1eb]"
            style={{
              fontFamily: "var(--font-geist-sans)",
              letterSpacing: "-0.02em",
            }}
          >
            Simple, transparent pricing.
          </h2>
          <p
            className="text-sm text-[#c6c5d5]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            Scale your data collection with Prashn.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

type Plan = (typeof PLANS)[number];

function PricingCard({ plan }: { plan: Plan }) {
  const { name, price, period, features, cta, highlighted } = plan;
  const badge = "badge" in plan ? plan.badge : undefined;

  if (highlighted) {
    return (
      <div className="rounded-2xl p-8 flex flex-col shadow-2xl scale-105 relative z-10 bg-[#fca9d4] text-[#0a0a0f]">
        {badge && (
          <div
            className="absolute top-0 right-4 -translate-y-1/2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-[#f7bd3e] text-[#402d00]"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {badge}
          </div>
        )}
        <h3
          className="text-xs font-bold tracking-widest mb-1"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {name}
        </h3>
        <div className="flex items-baseline gap-1 mb-4">
          <span
            className="text-2xl font-semibold"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {price}
          </span>
          <span
            className="text-[11px] opacity-80"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {period}
          </span>
        </div>
        <ul className="flex flex-col gap-3 mb-8 flex-1">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-3 text-sm"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              {f}
            </li>
          ))}
        </ul>
        <span
          className="w-full py-2 rounded text-xs font-medium tracking-widest bg-white/50 text-[#0a0a0f] text-center block opacity-50 cursor-not-allowed"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {cta}
        </span>
      </div>
    );
  }

  return (
    <div className="border border-[#454653] rounded-2xl p-8 flex flex-col h-full bg-[#1f1f26]">
      <h3
        className="text-xs font-bold tracking-widest mb-1 text-[#e4e1eb]"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {name}
      </h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span
          className="text-2xl font-semibold text-[#e4e1eb]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          {price}
        </span>
        <span
          className="text-[11px] text-[#c6c5d5]"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {period}
        </span>
      </div>
      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-3 text-sm text-[#c6c5d5]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            <span className="material-symbols-outlined text-[18px] text-[#0a0a0f]">check</span>
            {f}
          </li>
        ))}
      </ul>
      <span
        className="w-full border border-[#454653] py-2 rounded text-xs font-medium tracking-widest text-[#c6c5d5] text-center block opacity-50 cursor-not-allowed"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {cta}
      </span>
    </div>
  );
}
