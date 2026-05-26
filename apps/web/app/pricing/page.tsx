import { LandingNav } from "~/components/landing/nav";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For individuals getting started",
    features: [
      "3 forms",
      "100 responses/month",
      "Infinite Canvas Builder",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For creators who need more power",
    features: [
      "Unlimited forms",
      "5,000 responses/month",
      "Custom domains",
      "Logic branching",
      "Advanced analytics",
      "CSV export",
      "Priority support",
      "Custom themes",
    ],
    cta: "Start 14-Day Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Team",
    price: "$99",
    period: "/month",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "50,000 responses/month",
      "Shared workspaces",
      "Advanced API access",
      "Webhooks",
      "SSO / SAML",
      "Dedicated support",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#121319", color: "#e4e1eb" }}>
      <LandingNav />

      <main className="pt-32 pb-16 px-6">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1
            className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-[#e4e1eb]"
            style={{ fontFamily: "var(--font-geist-sans)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
          >
            Simple, transparent pricing.
          </h1>
          <p className="text-lg text-[#c6c5d5] max-w-xl mx-auto" style={{ fontFamily: "var(--font-geist-sans)" }}>
            Scale your data collection with CanvasForms. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col h-full relative ${
                plan.highlighted
                  ? "bg-[#bdc2ff] text-[#131e8c] shadow-2xl scale-105 z-10"
                  : "bg-[#1b1b22] border border-[#454653]"
              }`}
            >
              {plan.highlighted && plan.badge && (
                <div
                  className="absolute top-0 right-4 -translate-y-1/2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-[#f7bd3e] text-[#402d00]"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {plan.badge}
                </div>
              )}

              <h3
                className="text-[12px] font-bold tracking-widest uppercase mb-1"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-semibold" style={{ fontFamily: "var(--font-geist-sans)" }}>
                  {plan.price}
                </span>
                <span className="text-[13px] opacity-70">{plan.period}</span>
              </div>
              <p className={`text-sm mb-6 ${plan.highlighted ? "opacity-80" : "text-[#908f9e]"}`}>
                {plan.description}
              </p>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className={`material-symbols-outlined text-[16px] ${plan.highlighted ? "" : "text-[#bdc2ff]"}`}>check</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl text-[13px] font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-white text-[#131e8c] hover:opacity-90 shadow-sm"
                    : "border border-[#454653] text-[#c6c5d5] hover:bg-[#292930]"
                }`}
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ / Note */}
        <div className="max-w-2xl mx-auto text-center mt-16">
          <p className="text-sm text-[#908f9e]">
            All plans include the Infinite Canvas Builder, form publishing, and public form links.
            No credit card required for the free plan.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-[#454653] bg-[#0d0e14]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-4">
          <span className="text-sm font-semibold text-[#e4e1eb] opacity-50">CanvasForms</span>
          <div className="flex gap-6">
            <a href="#" className="text-[11px] text-[#c6c5d5] hover:text-[#bdc2ff] transition-colors">Privacy</a>
            <a href="#" className="text-[11px] text-[#c6c5d5] hover:text-[#bdc2ff] transition-colors">Terms</a>
            <a href="#" className="text-[11px] text-[#c6c5d5] hover:text-[#bdc2ff] transition-colors">Support</a>
          </div>
          <p className="text-[11px] text-[#454653]">© {new Date().getFullYear()} CanvasForms. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
