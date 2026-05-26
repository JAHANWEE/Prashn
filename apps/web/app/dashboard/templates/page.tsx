import {
  TemplateGalleryHeader,
  TemplateCard,
  TemplateSuggestCard,
} from "~/components/templates";
import type { TemplateData } from "~/components/templates";

const TEMPLATES: TemplateData[] = [
  {
    title: "Startup Feedback Flow",
    category: "Startup",
    categoryColor: "secondary",
    description: "A comprehensive logic-driven survey for early-stage customer discovery and feedback.",
    questionCount: 12,
    previewType: "fields",
  },
  {
    title: "Hiring Application",
    category: "Hiring",
    categoryColor: "tertiary",
    description: "Standardized recruitment form with file upload support for CVs and portfolios.",
    questionCount: 8,
    previewType: "documents",
  },
  {
    title: "Event RSVP Pro",
    category: "Events",
    categoryColor: "primary",
    description: "Elegant event registration with dietary preferences and calendar integration.",
    questionCount: 15,
    previewType: "grid",
  },
  {
    title: "Lead Gen Logic",
    category: "Marketing",
    categoryColor: "neutral",
    description: "High-converting multi-step lead magnet template for SaaS landing pages.",
    questionCount: 6,
    previewType: "hub",
  },
];

export default function TemplatesPage() {
  return (
    <>
      <TemplateGalleryHeader />

      {/* Template Grid */}
      <section className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TEMPLATES.map((template) => (
          <TemplateCard key={template.title} template={template} />
        ))}
        <TemplateSuggestCard />
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-[#1b1b22] border-t border-[#454653] flex flex-col items-center gap-2 mt-8">
        <span className="text-[13px] font-black text-[#c6c5d5]">CanvasForms</span>
        <div className="flex items-center gap-4">
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-all">Privacy</a>
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-all">Terms</a>
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-all">Support</a>
        </div>
        <p className="text-[11px] text-[#c6c5d5] opacity-70 mt-1">Built with CanvasForms © 2024</p>
      </footer>
    </>
  );
}
