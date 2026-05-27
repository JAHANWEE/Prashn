"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { trpc } from "~/trpc/client";
import { BuilderHeader } from "~/components/builder/header";
import { BuilderToolbar } from "~/components/builder/toolbar";

const FIELD_TYPES = [
  { type: "short_text", label: "Short Text", icon: "short_text", color: "text-[#bdc2ff]" },
  { type: "long_text", label: "Long Text", icon: "notes", color: "text-[#bdc2ff]" },
  { type: "email", label: "Email", icon: "mail", color: "text-[#b9c7e0]" },
  { type: "number", label: "Number", icon: "tag", color: "text-[#b9c7e0]" },
  { type: "single_select", label: "Single Select", icon: "check_circle", color: "text-[#f7bd3e]" },
  { type: "multi_select", label: "Multi Select", icon: "checklist", color: "text-[#f7bd3e]" },
  { type: "rating", label: "Rating", icon: "star", color: "text-[#f7bd3e]" },
  { type: "checkbox", label: "Checkbox", icon: "check_box", color: "text-[#b9c7e0]" },
  { type: "date", label: "Date", icon: "calendar_today", color: "text-[#b9c7e0]" },
] as const;

export default function BuilderPage() {
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");
  const { isSignedIn } = useAuth();

  const { data: form } = trpc.forms.getById.useQuery(
    { formId: formId! },
    { enabled: !!formId && !!isSignedIn },
  );

  const { data: fields, isLoading, refetch: refetchFields } = trpc.fields.list.useQuery(
    { formId: formId! },
    { enabled: !!formId && !!isSignedIn },
  );

  const utils = trpc.useUtils();
  const addField = trpc.fields.create.useMutation({
    onSuccess: () => { refetchFields(); },
  });
  const deleteField = trpc.fields.delete.useMutation({
    onSuccess: () => { refetchFields(); },
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const selectedField = fields?.find((f) => f.id === selectedFieldId);

  const handleAddField = (fieldType: string) => {
    if (!formId) return;
    addField.mutate({
      formId,
      label: `New ${FIELD_TYPES.find((t) => t.type === fieldType)?.label ?? "Field"}`,
      fieldType: fieldType as any,
    });
  };

  const handleDeleteField = (fieldId: string) => {
    deleteField.mutate({ fieldId });
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  if (!formId) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#121319] text-[#e4e1eb]">
        <p className="text-[#908f9e]">No form selected. Go back to the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#121319] text-[#e4e1eb] overflow-hidden">
      <BuilderHeader formTitle={form?.title} />
      <div className="flex flex-1 pt-16 h-full overflow-hidden">
        <BuilderToolbar />

        {/* Insert Panel */}
        <aside className="w-[260px] h-full bg-[#121319] border-r border-[#454653] flex flex-col z-30">
          <div className="p-4 border-b border-[#454653]">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#c6c5d5]" style={{ fontFamily: "var(--font-geist-mono)" }}>
              Add Field
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 [&::-webkit-scrollbar]:hidden">
            {FIELD_TYPES.map((ft) => (
              <button
                key={ft.type}
                onClick={() => handleAddField(ft.type)}
                disabled={addField.isPending}
                className="w-full p-2.5 bg-[#1b1b22] border border-[#454653] rounded-lg hover:border-[#bdc2ff] flex items-center gap-3 transition-colors disabled:opacity-50 text-left"
              >
                <span className={`material-symbols-outlined text-[20px] ${ft.color}`}>{ft.icon}</span>
                <span className="text-[12px] font-medium text-[#e4e1eb]">{ft.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Canvas — shows fields as nodes */}
        <main
          className="flex-1 relative overflow-auto p-8"
          style={{
            backgroundColor: "#121319",
            backgroundImage: "radial-gradient(#292930 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#908f9e] text-sm">Loading fields...</p>
            </div>
          )}

          {fields && fields.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="material-symbols-outlined text-[64px] text-[#454653] mb-4">add_circle</span>
              <p className="text-lg font-semibold text-[#e4e1eb] mb-1">No fields yet</p>
              <p className="text-sm text-[#908f9e]">Click a field type on the left to add your first question.</p>
            </div>
          )}

          {fields && fields.length > 0 && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  onClick={() => setSelectedFieldId(field.id)}
                  className={`bg-[#1f1f26] border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedFieldId === field.id
                      ? "border-[#818cf8] shadow-[0_0_0_2px_rgba(129,140,248,0.2)]"
                      : "border-[#454653] hover:border-[#bdc2ff]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#908f9e] bg-[#292930] px-2 py-0.5 rounded" style={{ fontFamily: "var(--font-geist-mono)" }}>
                        {idx + 1}
                      </span>
                      <span className="text-[12px] text-[#bdc2ff] uppercase" style={{ fontFamily: "var(--font-geist-mono)" }}>
                        {field.fieldType.replace("_", " ")}
                      </span>
                      {field.required && (
                        <span className="text-[10px] text-[#ffb4ab]">*required</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteField(field.id); }}
                      className="text-[#908f9e] hover:text-[#ffb4ab] transition-colors p-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                  <p className="text-[14px] text-[#e4e1eb] font-medium">{field.label}</p>
                  {field.description && (
                    <p className="text-[12px] text-[#908f9e] mt-1">{field.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Inspector Panel */}
        <aside className="w-[280px] h-full bg-[#121319] border-l border-[#454653] flex flex-col z-30">
          <div className="p-4 border-b border-[#454653] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#bdc2ff]">settings</span>
            <span className="text-[12px] font-bold uppercase tracking-widest text-[#e4e1eb]" style={{ fontFamily: "var(--font-geist-mono)" }}>
              Inspector
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedField ? (
              <FieldInspector field={selectedField} formId={formId} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="material-symbols-outlined text-[32px] text-[#454653] mb-2">touch_app</span>
                <p className="text-[12px] text-[#908f9e]">Select a field to edit its properties</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function FieldInspector({ field, formId }: { field: any; formId: string }) {
  const utils = trpc.useUtils();
  const updateField = trpc.fields.update.useMutation({
    onSuccess: () => {
      utils.fields.list.invalidate();
    },
  });

  const [label, setLabel] = useState(field.label);
  const [required, setRequired] = useState(field.required);
  const [options, setOptions] = useState<Array<{ label: string; value: string }>>(
    (field.options as Array<{ label: string; value: string }>) ?? [],
  );
  const [trackedFieldId, setTrackedFieldId] = useState(field.id);

  // Reset state when a different field is selected
  if (field.id !== trackedFieldId) {
    setTrackedFieldId(field.id);
    setLabel(field.label);
    setRequired(field.required);
    setOptions((field.options as Array<{ label: string; value: string }>) ?? []);
  }

  const hasOptions = ["single_select", "multi_select", "dropdown"].includes(field.fieldType);

  const handleSave = () => {
    updateField.mutate({
      fieldId: field.id,
      label,
      required,
      ...(hasOptions ? { options } : {}),
    });
  };

  const handleAddOption = () => {
    setOptions([...options, { label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` }]);
  };

  const handleRemoveOption = (idx: number) => {
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleOptionChange = (idx: number, newLabel: string) => {
    setOptions(options.map((o, i) => i === idx ? { label: newLabel, value: newLabel.toLowerCase().replace(/\s+/g, "_") } : o));
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>
          Label
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full bg-[#0d0e14] border border-[#454653] rounded-lg px-3 py-2 text-[13px] text-[#e4e1eb] focus:ring-2 focus:ring-[#818cf8]/20 focus:border-[#818cf8] outline-none"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>
          Type
        </label>
        <p className="text-[13px] text-[#bdc2ff] bg-[#1b1b22] border border-[#454653] rounded-lg px-3 py-2" style={{ fontFamily: "var(--font-geist-mono)" }}>
          {field.fieldType.replace("_", " ")}
        </p>
      </div>

      {/* Options editor for select fields */}
      {hasOptions && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-wider text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>
              Options
            </label>
            <button onClick={handleAddOption} className="text-[#bdc2ff] hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 bg-[#0d0e14] border border-[#454653] rounded-lg px-2.5 py-1.5 text-[12px] text-[#e4e1eb] focus:ring-1 focus:ring-[#818cf8]/20 focus:border-[#818cf8] outline-none"
                />
                <button onClick={() => handleRemoveOption(idx)} className="text-[#908f9e] hover:text-[#ffb4ab] transition-colors">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
            {options.length === 0 && (
              <p className="text-[11px] text-[#908f9e] text-center py-2">No options. Click + to add.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between py-2">
        <span className="text-[12px] font-medium text-[#e4e1eb]">Required</span>
        <button
          onClick={() => setRequired(!required)}
          className={`w-10 h-5 rounded-full relative transition-colors ${required ? "bg-[#818cf8]" : "bg-[#454653]"}`}
        >
          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${required ? "right-1" : "left-1"}`} />
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={updateField.isPending}
        className="w-full bg-[#bdc2ff] text-[#131e8c] text-[12px] font-semibold py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
      >
        {updateField.isPending ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
