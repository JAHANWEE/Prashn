import { cn } from "~/lib/utils";

const FORMS = [
  {
    title: "Startup Feedback Flow",
    status: "Published" as const,
    responses: 432,
    lastEdited: "2d ago",
    preview: "horizontal" as const,
  },
  {
    title: "Event RSVP Flow",
    status: "Draft" as const,
    responses: 0,
    lastEdited: "5h ago",
    preview: "vertical" as const,
  },
  {
    title: "Hiring Application Flow",
    status: "Published" as const,
    responses: 89,
    lastEdited: "1w ago",
    preview: "circular" as const,
  },
];

export function DashboardFormCards() {
  return (
    <section className="flex-grow space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-semibold text-[#e4e1eb]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Recent Forms
        </h2>
        <a
          href="#"
          className="text-[13px] font-medium text-[#bdc2ff] flex items-center gap-1 hover:underline"
        >
          View All Forms
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FORMS.map((form) => (
          <FormCard key={form.title} form={form} />
        ))}
        <CreateNewCard />
      </div>
    </section>
  );
}

type Form = (typeof FORMS)[number];

function FormCard({ form }: { form: Form }) {
  const isPublished = form.status === "Published";

  return (
    <div
      className="group bg-[#0d0e14] border border-[#454653] rounded-xl overflow-hidden hover:border-[#bdc2ff] transition-all"
      style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}
    >
      {/* Canvas preview area */}
      <div className="h-40 bg-[#1b1b22] cf-canvas-grid-bg p-4 relative flex items-center justify-center overflow-hidden">
        <CanvasPreview type={form.preview} />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="bg-[#bdc2ff] text-[#131e8c] px-6 py-2 rounded-lg text-[13px] font-medium shadow-lg">
            Open Canvas
          </button>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h4
            className="text-lg font-semibold text-[#e4e1eb]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {form.title}
          </h4>
          <span
            className={cn(
              "px-4 py-1 text-[11px] font-medium rounded-full border",
              isPublished
                ? "bg-green-900/30 text-green-300 border-green-800"
                : "bg-[#292930] text-[#c6c5d5] border-[#454653]",
            )}
          >
            {form.status}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#c6c5d5] text-[11px] font-medium">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
            {form.responses} Responses
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">history</span>
            {form.lastEdited}
          </span>
        </div>
      </div>
    </div>
  );
}

function CanvasPreview({ type }: { type: "horizontal" | "vertical" | "circular" }) {
  if (type === "horizontal") {
    return (
      <div className="flex gap-4 items-center z-10">
        <div className="w-16 h-10 bg-[#0d0e14] border border-[#454653] rounded-sm flex items-center justify-center" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}>
          <div className="w-10 h-1 bg-[#454653] rounded-full" />
        </div>
        <div className="w-4 h-[1.5px] bg-[#454653]" />
        <div className="w-16 h-10 bg-[#0d0e14] border border-[#bdc2ff] rounded-sm flex items-center justify-center" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}>
          <div className="w-10 h-1 bg-[#bdc2ff]/20 rounded-full" />
        </div>
      </div>
    );
  }

  if (type === "vertical") {
    return (
      <div className="flex flex-col gap-2 items-center z-10">
        <div className="w-20 h-8 bg-[#0d0e14] border border-[#454653] rounded-sm" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }} />
        <div className="h-4 w-[1.5px] bg-[#454653]" />
        <div className="flex gap-2">
          <div className="w-10 h-8 bg-[#0d0e14] border border-[#454653] rounded-sm" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }} />
          <div className="w-10 h-8 bg-[#0d0e14] border border-[#454653] rounded-sm" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center z-10">
      <div className="w-12 h-12 rounded-full bg-[#0d0e14] border border-[#454653] flex items-center justify-center" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}>
        <span className="material-symbols-outlined text-[#bdc2ff]">start</span>
      </div>
      <div className="w-6 h-[1.5px] bg-[#454653]" />
      <div className="w-20 h-10 bg-[#0d0e14] border border-[#454653] rounded-sm" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

function CreateNewCard() {
  return (
    <button className="group border-2 border-dashed border-[#454653] rounded-xl flex flex-col items-center justify-center p-8 hover:border-[#bdc2ff] hover:bg-[#bdc2ff]/5 transition-all text-[#c6c5d5] hover:text-[#bdc2ff]">
      <span className="material-symbols-outlined text-[48px] mb-4">add_circle</span>
      <p
        className="text-lg font-semibold"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        Create New Flow
      </p>
      <p className="text-[11px] opacity-70">Start with a blank canvas</p>
    </button>
  );
}
