import { cn } from "~/lib/utils";

export type TemplateData = {
  title: string;
  category: string;
  categoryColor: "secondary" | "tertiary" | "primary" | "neutral";
  description: string;
  questionCount: number;
  previewType: "fields" | "documents" | "grid" | "hub";
};

const CATEGORY_STYLES = {
  secondary: "bg-[#3c4a5e] text-[#abb9d2]",
  tertiary: "bg-[#c08d00] text-[#3e2b00]",
  primary: "bg-[#818cf8] text-[#101b8a]",
  neutral: "bg-[#34343b] text-[#c6c5d5]",
} as const;

export function TemplateCard({ template }: { template: TemplateData }) {
  return (
    <div className="group bg-[#0d0e14] border border-[#454653] rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex flex-col">
      {/* Preview area */}
      <div className="h-48 bg-[#1b1b22] p-4 relative overflow-hidden">
        <TemplatePreview type={template.previewType} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b22] to-transparent" />
      </div>

      {/* Card content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3
            className="text-lg font-semibold text-[#e4e1eb] group-hover:text-[#bdc2ff] transition-colors"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {template.title}
          </h3>
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded shrink-0 ml-2",
              CATEGORY_STYLES[template.categoryColor],
            )}
          >
            {template.category}
          </span>
        </div>
        <p className="text-sm text-[#c6c5d5] mb-4 line-clamp-2" style={{ fontFamily: "var(--font-geist-sans)" }}>
          {template.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 text-[#c6c5d5]">
            <span className="material-symbols-outlined text-[18px]">list_alt</span>
            <span className="text-[13px] font-medium">{template.questionCount} Questions</span>
          </div>
          <button className="px-4 py-2 bg-[#292930] text-[#e4e1eb] font-bold text-[13px] rounded-lg hover:bg-[#bdc2ff] hover:text-[#131e8c] transition-all duration-200 active:scale-95">
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ type }: { type: TemplateData["previewType"] }) {
  if (type === "fields") {
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#bdc2ff] animate-pulse" />
          <div className="h-4 w-24 bg-[#292930] rounded-full" />
        </div>
        <div className="flex-1 flex flex-col gap-2 mt-2">
          <div className="h-10 bg-[#34343b] border border-[#454653]/30 rounded flex items-center px-2 gap-2">
            <span className="material-symbols-outlined text-[#908f9e] text-[16px]">person</span>
            <div className="h-2 w-full bg-[#1b1b22] rounded" />
          </div>
          <div className="h-10 bg-[#34343b] border border-[#454653]/30 rounded flex items-center px-2 gap-2 self-end w-3/4">
            <span className="material-symbols-outlined text-[#908f9e] text-[16px]">mail</span>
            <div className="h-2 w-full bg-[#1b1b22] rounded" />
          </div>
          <div className="h-10 bg-[#34343b] border border-[#454653]/30 rounded flex items-center px-2 gap-2">
            <span className="material-symbols-outlined text-[#908f9e] text-[16px]">star</span>
            <div className="h-2 w-full bg-[#1b1b22] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "documents") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-16 bg-[#34343b] border border-[#454653] rounded flex items-center justify-center shadow-sm -rotate-6">
            <span className="material-symbols-outlined text-[#bdc2ff]">description</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#454653]" />
          <div className="w-12 h-16 bg-[#34343b] border border-[#454653] rounded flex items-center justify-center shadow-sm rotate-6">
            <span className="material-symbols-outlined text-[#bdc2ff]">task_alt</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2 h-full opacity-60">
        <div className="bg-[#34343b] rounded border border-[#454653] flex flex-col p-2 gap-1">
          <div className="h-1.5 w-1/2 bg-[#454653] rounded" />
          <div className="h-1 w-full bg-[#1b1b22] rounded" />
          <div className="mt-auto h-4 bg-[#bdc2ff]/20 rounded" />
        </div>
        <div className="bg-[#34343b] rounded border border-[#454653] flex flex-col p-2 gap-1 translate-y-4">
          <div className="h-1.5 w-2/3 bg-[#454653] rounded" />
          <div className="h-1 w-full bg-[#1b1b22] rounded" />
          <div className="mt-auto h-4 bg-[#bdc2ff]/20 rounded" />
        </div>
      </div>
    );
  }

  // hub
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative">
        <div className="w-32 h-20 bg-[#34343b] border border-[#454653] rounded-lg shadow-sm flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-[#ffb4ab] rounded-full" />
          <div className="w-3 h-3 bg-[#bdc2ff] rounded-full" />
          <div className="w-3 h-3 bg-[#c08d00] rounded-full" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-[#bdc2ff] text-[#131e8c] rounded-full p-1">
          <span className="material-symbols-outlined text-[16px]">hub</span>
        </div>
      </div>
    </div>
  );
}

/** Empty state / suggest template card */
export function TemplateSuggestCard() {
  return (
    <div className="border-2 border-dashed border-[#454653] rounded-xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-[#bdc2ff] transition-all duration-300 bg-[#1b1b22]/50">
      <div className="w-12 h-12 rounded-full bg-[#34343b] flex items-center justify-center text-[#908f9e] group-hover:bg-[#e0e0ff] group-hover:text-[#bdc2ff] transition-all">
        <span className="material-symbols-outlined text-[32px]">lightbulb</span>
      </div>
      <h4
        className="mt-4 text-lg font-semibold text-[#e4e1eb]"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        Can&apos;t find a template?
      </h4>
      <p className="text-sm text-[#c6c5d5] mt-2 mb-4">
        Suggest a flow or request a custom build from our experts.
      </p>
      <button className="text-[#bdc2ff] font-bold text-sm hover:underline">Request Template</button>
    </div>
  );
}
