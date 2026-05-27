"use client";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { trpc } from "~/trpc/client";
import { TerminalForm } from "./components/terminal-form";

const DEMO_FIELDS = [
  { id: "1", label: "What is your name?", fieldType: "short_text", required: true, placeholder: "Enter your name" },
  { id: "2", label: "What is your email?", fieldType: "email", required: true, placeholder: "you@email.com" },
  { id: "3", label: "How would you rate our product?", fieldType: "rating", required: true, placeholder: "" },
  { id: "4", label: "What role best describes you?", fieldType: "single_select", required: true, placeholder: "", options: [{ label: "Engineer", value: "engineer" }, { label: "Designer", value: "designer" }, { label: "Product Manager", value: "pm" }, { label: "Founder", value: "founder" }] },
  { id: "5", label: "Any additional feedback?", fieldType: "long_text", required: false, placeholder: "Type your thoughts..." },
];

export default function TerminalThemePreviewPage() {
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");
  const { isSignedIn } = useAuth();

  // Load real form data if formId is provided
  const { data: form, isLoading: formLoading } = trpc.forms.getById.useQuery(
    { formId: formId! },
    { enabled: !!formId && !!isSignedIn },
  );
  const { data: fields, isLoading: fieldsLoading } = trpc.fields.list.useQuery(
    { formId: formId! },
    { enabled: !!formId && !!isSignedIn },
  );

  const isLoading = formId && (formLoading || fieldsLoading || !isSignedIn);

  // If formId provided, wait for real data. Otherwise use demo.
  const formFields = formId && fields
    ? fields.map(f => ({ id: f.id, label: f.label, fieldType: f.fieldType, required: f.required, placeholder: f.placeholder ?? "", options: f.options as Array<{ label: string; value: string }> | undefined }))
    : !formId ? DEMO_FIELDS : [];

  const title = form?.title ?? (formId ? "Loading..." : "CanvasForms Demo");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center">
          <span className="material-symbols-outlined text-[32px] text-[#fca9d4] animate-pulse block mb-3">terminal</span>
          <p className="text-[12px] text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>Loading form data...</p>
        </div>
      </div>
    );
  }

  if (formId && formFields.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center">
          <span className="material-symbols-outlined text-[32px] text-[#908f9e] block mb-3">info</span>
          <p className="text-[13px] text-[#e4e1eb] mb-1">No fields in this form yet</p>
          <p className="text-[11px] text-[#908f9e]">Add fields in the builder first, then come back here.</p>
          <a href={`/builder?formId=${formId}`} className="text-[11px] text-[#fca9d4] hover:underline mt-3 inline-block">← Back to Builder</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0a0a0f" }}>
      <TerminalForm
        formTitle={title}
        fields={formFields}
        onSubmit={(answers) => {
          console.log("Submitted:", answers);
        }}
      />
    </div>
  );
}
