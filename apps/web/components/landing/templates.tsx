const TEMPLATES = [
  {
    icon: "description",
    title: "USER ONBOARDING",
    meta: "5 screens • Conditional logic",
    image: "/pink_1.jpeg",
  },
  {
    icon: "rate_review",
    title: "PRODUCT FEEDBACK",
    meta: "8 screens • Multi-choice",
    image: "/pink_2.jpeg",
  },
  {
    icon: "event",
    title: "EVENT REGISTRATION",
    meta: "4 screens • RSVP Logic",
    image: "/pink_3.jpeg",
  },
  {
    icon: "contact_support",
    title: "SUPPORT TICKET",
    meta: "3 screens • Dynamic routing",
    image: "/pink_4.gif",
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
            className="text-xs font-medium tracking-widest flex items-center gap-1 text-[#fca9d4] hover:gap-2 transition-all"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            VIEW LIBRARY{" "}
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATES.map(({ icon, title, meta, image }) => (
            <TemplateCard key={title} icon={icon} title={title} meta={meta} image={image} />
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
  image,
}: {
  icon: string;
  title: string;
  meta: string;
  image: string;
}) {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-[4/3] border border-[#454653] rounded-xl overflow-hidden mb-4 transition-colors bg-[#1f1f26] group-hover:border-[#fca9d4] relative">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
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
