const TEMPLATES = [
  {
    icon: "description",
    title: "USER ONBOARDING",
    meta: "5 screens • Conditional logic",
  },
  {
    icon: "rate_review",
    title: "PRODUCT FEEDBACK",
    meta: "8 screens • Multi-choice",
  },
  {
    icon: "event",
    title: "EVENT REGISTRATION",
    meta: "4 screens • RSVP Logic",
  },
  {
    icon: "contact_support",
    title: "SUPPORT TICKET",
    meta: "3 screens • Dynamic routing",
  },
] as const;

export function LandingTemplates() {
  return (
    <section id="templates" className="py-16 px-6 bg-[#121319]">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2
              className="text-3xl font-semibold mb-2 text-[#e4e1eb]"
              style={{
                fontFamily: "var(--font-geist-sans)",
                letterSpacing: "-0.02em",
              }}
            >
              Start from a template.
            </h2>
            <p
              className="text-sm text-[#c6c5d5]"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              Ready-made flows for common use cases.
            </p>
          </div>
          <a
            href="/dashboard/templates"
            className="text-xs font-medium tracking-widest flex items-center gap-1 text-[#bdc2ff] hover:gap-2 transition-all"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            VIEW LIBRARY{" "}
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATES.map(({ icon, title, meta }) => (
            <TemplateCard key={title} icon={icon} title={title} meta={meta} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplateCard({
  icon,
  title,
  meta,
}: {
  icon: string;
  title: string;
  meta: string;
}) {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-[4/3] border border-[#454653] rounded-xl overflow-hidden mb-4 flex items-center justify-center transition-colors bg-[#1f1f26] group-hover:border-[#bdc2ff]">
        <span className="material-symbols-outlined text-[48px] text-[#908f9e] group-hover:text-[#bdc2ff] transition-colors">
          {icon}
        </span>
      </div>
      <h4
        className="text-xs font-bold tracking-widest mb-1 text-[#e4e1eb]"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {title}
      </h4>
      <p
        className="text-[11px] text-[#c6c5d5]"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {meta}
      </p>
    </div>
  );
}
