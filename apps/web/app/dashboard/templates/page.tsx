"use client";

import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { FORM_TEMPLATES, type FormTemplate } from "~/lib/form-templates";

export default function TemplatesPage() {
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-[#0d0e14] border-b border-[#454653] z-40 h-16 flex items-center justify-between px-6">
        <span className="text-lg font-bold text-[#fca9d4]" style={{ fontFamily: "var(--font-geist-sans)" }}>Templates</span>
        <p className="text-[12px] text-[#908f9e]">{FORM_TEMPLATES.length} templates available</p>
      </div>

      {/* Template Grid */}
      <section className="p-6">
        <p className="text-[13px] text-[#c6c5d5] mb-6">Start with a pre-built template. All fields are created instantly — just customize and publish.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FORM_TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </section>
    </>
  );
}

function TemplateCard({ template }: { template: FormTemplate }) {
  const createForm = trpc.forms.create.useMutation();
  const createField = trpc.fields.create.useMutation();
  const router = useRouter();

  const handleUseTemplate = async () => {
    try {
      // Create the form
      const form = await createForm.mutateAsync({
        title: template.title,
        description: template.description,
      });

      // Create all fields in order
      for (const field of template.fields) {
        await createField.mutateAsync({
          formId: form.id,
          label: field.label,
          fieldType: field.fieldType as any,
          required: field.required,
          placeholder: field.placeholder,
          options: field.options,
        });
      }

      toast.success(`"${template.title}" created with ${template.fields.length} fields`);
      router.push(`/builder?formId=${form.id}`);
    } catch (err) {
      toast.error("Failed to create template");
    }
  };

  const COLORS: Record<string, string> = {
    secondary: "bg-[#3c4a5e] text-[#abb9d2]",
    tertiary: "bg-[#c08d00]/20 text-[#fbbf24]",
    primary: "bg-[#fca9d4]/10 text-[#fca9d4]",
    neutral: "bg-[#34343b] text-[#c6c5d5]",
  };

  return (
    <div className="bg-[#0d0e14] border border-[#1e212d] rounded-xl p-5 hover:border-[#fca9d4]/30 transition-all group flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#1b1b22] border border-[#454653] flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px] text-[#fca9d4]">{template.icon}</span>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${COLORS[template.categoryColor] ?? COLORS.neutral}`}>
          {template.category}
        </span>
      </div>

      {/* Title + description */}
      <h3 className="text-[14px] font-semibold text-[#e4e1eb] mb-1 group-hover:text-[#fca9d4] transition-colors" style={{ fontFamily: "var(--font-geist-sans)" }}>
        {template.title}
      </h3>
      <p className="text-[11px] text-[#908f9e] mb-4 line-clamp-2 flex-1">{template.description}</p>

      {/* Field preview chips */}
      <div className="flex flex-wrap gap-1 mb-4">
        {template.fields.slice(0, 4).map((f, i) => (
          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1b1b22] text-[#908f9e] border border-[#1e212d]" style={{ fontFamily: "var(--font-geist-mono)" }}>
            {f.fieldType.replace(/_/g, " ")}
          </span>
        ))}
        {template.fields.length > 4 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1b1b22] text-[#5a5a6e]">+{template.fields.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#5a5a6e]" style={{ fontFamily: "var(--font-geist-mono)" }}>{template.fields.length} fields</span>
        <button
          onClick={handleUseTemplate}
          disabled={createForm.isPending}
          className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-[#1b1b22] text-[#e4e1eb] border border-[#454653] hover:bg-[#fca9d4] hover:text-[#0a0a0f] hover:border-[#fca9d4] transition-all disabled:opacity-50"
        >
          {createForm.isPending ? "Creating..." : "Use Template"}
        </button>
      </div>
    </div>
  );
}
