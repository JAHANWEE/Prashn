"use client";

import { useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { trpc } from "~/trpc/client";
import { BuilderHeader } from "~/components/builder/header";
import { BuilderToolbar } from "~/components/builder/toolbar";
import { SortableFieldList } from "~/components/builder/sortable-field-list";
import { ViewToggle, useBuilderView } from "~/components/builder/view-toggle";
import { FlowCanvas } from "~/components/builder/flow-view";
import { FormSettingsPanel } from "~/components/builder/form-settings-panel";
import { PreviewModal } from "~/components/builder/preview-modal";
import { useUndoRedo } from "~/components/builder/use-undo-redo";
import { useKeyboardShortcuts } from "~/components/builder/use-keyboard-shortcuts";

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
  const [builderView, setBuilderView] = useBuilderView();
  const [previewOpen, setPreviewOpen] = useState(false);

  // Undo/Redo
  const { pushAction, undo, redo, canUndo, canRedo } = useUndoRedo();

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
    onSuccess: (data) => {
      refetchFields();
      pushAction({ type: "add", fieldId: data.id, formId: formId! });
    },
  });
  const deleteField = trpc.fields.delete.useMutation({
    onSuccess: () => { refetchFields(); },
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const selectedField = fields?.find((f) => f.id === selectedFieldId);

  const handleAddField = useCallback((fieldType: string) => {
    if (!formId) return;
    addField.mutate({
      formId,
      label: `New ${FIELD_TYPES.find((t) => t.type === fieldType)?.label ?? "Field"}`,
      fieldType: fieldType as any,
    });
  }, [formId, addField]);

  const handleDeleteField = useCallback((fieldId: string) => {
    pushAction({ type: "delete", fieldId, formId: formId! });
    deleteField.mutate({ fieldId });
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  }, [formId, deleteField, selectedFieldId, pushAction]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onDelete: () => {
      if (selectedFieldId) handleDeleteField(selectedFieldId);
    },
    onUndo: () => { undo(); refetchFields(); },
    onRedo: () => { redo(); refetchFields(); },
    onEscape: () => setSelectedFieldId(null),
  });

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
        {/* Left toolbar */}
        <BuilderToolbar
          view={builderView}
          onUndo={() => { undo(); refetchFields(); }}
          onRedo={() => { redo(); refetchFields(); }}
          canUndo={canUndo}
          canRedo={canRedo}
          onPreview={() => setPreviewOpen(true)}
        />

        {/* Insert Panel */}
        <aside className="w-[240px] h-full bg-[#121319] border-r border-[#454653] flex flex-col z-30" style={{ opacity: builderView === "flow" ? 0.85 : 1, transition: "opacity 0.2s ease" }}>
          {/* View Toggle */}
          <div className="p-3 border-b border-[#454653] flex items-center justify-center">
            <ViewToggle value={builderView} onChange={setBuilderView} />
          </div>

          <div className="p-3 border-b border-[#454653]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>
              Add Field
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 [&::-webkit-scrollbar]:hidden">
            {FIELD_TYPES.map((ft) => (
              <button
                key={ft.type}
                onClick={() => handleAddField(ft.type)}
                disabled={addField.isPending}
                className="w-full p-2 bg-[#0d0e14] border border-[#1f1f26] rounded-lg hover:border-[#454653] hover:bg-[#141418] flex items-center gap-2.5 transition-colors disabled:opacity-50 text-left group"
              >
                <span className={`material-symbols-outlined text-[18px] ${ft.color} opacity-70 group-hover:opacity-100 transition-opacity`}>{ft.icon}</span>
                <span className="text-[11px] font-medium text-[#c6c5d5] group-hover:text-[#e4e1eb] transition-colors">{ft.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* ─── Form View ─────────────────────────────────────────────────── */}
        {builderView === "form" && (
          <main
            className="flex-1 relative overflow-auto p-8"
            style={{
              backgroundColor: "#121319",
              backgroundImage: "radial-gradient(#1e1e28 1px, transparent 1px)",
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
                <div
                  className="w-14 h-14 rounded-xl mb-4 flex items-center justify-center"
                  style={{ background: "rgba(129, 140, 248, 0.06)", border: "1px solid rgba(53, 53, 64, 0.4)" }}
                >
                  <span className="material-symbols-outlined text-[28px] text-[#4a4a5a]">add_circle</span>
                </div>
                <p className="text-[15px] font-medium text-[#e4e1eb] mb-1" style={{ fontFamily: "var(--font-geist-sans)" }}>No fields yet</p>
                <p className="text-[12px] text-[#5a5a6e]">Click a field type on the left to add your first question.</p>
              </div>
            )}

            {fields && fields.length > 0 && (
              <SortableFieldList
                fields={fields}
                formId={formId}
                selectedFieldId={selectedFieldId}
                onSelectField={setSelectedFieldId}
                onDeleteField={handleDeleteField}
              />
            )}
          </main>
        )}

        {/* ─── Flow View ─────────────────────────────────────────────────── */}
        {builderView === "flow" && (
          <FlowCanvas
            fields={fields}
            formTitle={form?.title}
            formId={formId}
            onAddField={handleAddField}
            onDeleteField={handleDeleteField}
            onSelectField={setSelectedFieldId}
            selectedFieldId={selectedFieldId}
          />
        )}

        {/* Inspector Panel */}
        <aside className="w-[280px] h-full bg-[#121319] border-l border-[#454653] flex flex-col z-30" style={{ opacity: builderView === "flow" ? 0.85 : 1, transition: "opacity 0.2s ease" }}>
          <div className="p-4 border-b border-[#454653] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#818cf8]">
              {selectedField ? "edit_note" : "tune"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>
              {selectedField ? "Field Properties" : "Form Settings"}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden">
            {selectedField ? (
              <FieldInspector field={selectedField} formId={formId} />
            ) : (
              <FormSettingsPanel formId={formId} />
            )}
          </div>
        </aside>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        formTitle={form?.title}
        fields={fields as any}
      />
    </div>
  );
}

// ─── Field Inspector ─────────────────────────────────────────────────────────

function FieldInspector({ field, formId }: { field: any; formId: string }) {
  const utils = trpc.useUtils();
  const updateField = trpc.fields.update.useMutation({
    onSuccess: () => {
      utils.fields.list.invalidate();
    },
  });

  const [label, setLabel] = useState(field.label);
  const [description, setDescription] = useState(field.description ?? "");
  const [required, setRequired] = useState(field.required);
  const [placeholder, setPlaceholder] = useState(field.placeholder ?? "");
  const [options, setOptions] = useState<Array<{ label: string; value: string }>>(
    (field.options as Array<{ label: string; value: string }>) ?? [],
  );
  const [trackedFieldId, setTrackedFieldId] = useState(field.id);

  // Reset state when a different field is selected
  if (field.id !== trackedFieldId) {
    setTrackedFieldId(field.id);
    setLabel(field.label);
    setDescription(field.description ?? "");
    setRequired(field.required);
    setPlaceholder(field.placeholder ?? "");
    setOptions((field.options as Array<{ label: string; value: string }>) ?? []);
  }

  const hasOptions = ["single_select", "multi_select", "dropdown"].includes(field.fieldType);

  const handleSave = () => {
    updateField.mutate({
      fieldId: field.id,
      label,
      description: description || null,
      required,
      placeholder: placeholder || null,
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
    <div className="space-y-4">
      {/* Field type badge */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#1f1f26]">
        <span className="material-symbols-outlined text-[14px] text-[#818cf8]">
          {getFieldTypeIcon(field.fieldType)}
        </span>
        <span className="text-[11px] text-[#bdc2ff] uppercase" style={{ fontFamily: "var(--font-geist-mono)" }}>
          {field.fieldType.replace(/_/g, " ")}
        </span>
      </div>

      {/* Label */}
      <InspectorField label="Label">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full bg-[#0d0e14] border border-[#353540] rounded-lg px-3 py-2 text-[12px] text-[#e4e1eb] focus:ring-1 focus:ring-[#818cf8]/20 focus:border-[#818cf8] outline-none"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        />
      </InspectorField>

      {/* Description */}
      <InspectorField label="Description">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional helper text..."
          className="w-full bg-[#0d0e14] border border-[#353540] rounded-lg px-3 py-2 text-[12px] text-[#e4e1eb] placeholder:text-[#4a4a5a] focus:ring-1 focus:ring-[#818cf8]/20 focus:border-[#818cf8] outline-none"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        />
      </InspectorField>

      {/* Placeholder */}
      <InspectorField label="Placeholder">
        <input
          type="text"
          value={placeholder}
          onChange={(e) => setPlaceholder(e.target.value)}
          placeholder="Input placeholder..."
          className="w-full bg-[#0d0e14] border border-[#353540] rounded-lg px-3 py-2 text-[12px] text-[#e4e1eb] placeholder:text-[#4a4a5a] focus:ring-1 focus:ring-[#818cf8]/20 focus:border-[#818cf8] outline-none"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        />
      </InspectorField>

      {/* Options editor */}
      {hasOptions && (
        <InspectorField label="Options">
          <div className="space-y-1.5">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 bg-[#0d0e14] border border-[#353540] rounded-md px-2.5 py-1.5 text-[11px] text-[#e4e1eb] focus:ring-1 focus:ring-[#818cf8]/20 focus:border-[#818cf8] outline-none"
                />
                <button onClick={() => handleRemoveOption(idx)} className="text-[#5a5a6e] hover:text-[#ffb4ab] transition-colors p-0.5">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
            <button
              onClick={handleAddOption}
              className="w-full py-1.5 text-[10px] text-[#818cf8] hover:text-[#bdc2ff] border border-dashed border-[#353540] rounded-md hover:border-[#818cf8] transition-colors"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              + Add Option
            </button>
          </div>
        </InspectorField>
      )}

      {/* Required toggle */}
      <div className="flex items-center justify-between py-2">
        <span className="text-[11px] font-medium text-[#c6c5d5]">Required</span>
        <button
          onClick={() => setRequired(!required)}
          className="w-9 h-5 rounded-full relative transition-colors"
          style={{ background: required ? "#818cf8" : "rgba(53, 53, 64, 0.8)" }}
        >
          <div
            className="absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full transition-all"
            style={{ left: required ? "calc(100% - 17px)" : "3px" }}
          />
        </button>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={updateField.isPending}
        className="w-full bg-[#bdc2ff] text-[#131e8c] text-[11px] font-semibold py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
      >
        {updateField.isPending ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

function InspectorField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] uppercase tracking-wider text-[#5a5a6e] font-medium" style={{ fontFamily: "var(--font-geist-mono)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function getFieldTypeIcon(fieldType: string): string {
  switch (fieldType) {
    case "short_text": return "short_text";
    case "long_text": return "notes";
    case "email": return "mail";
    case "number": return "tag";
    case "single_select": return "radio_button_checked";
    case "multi_select": return "checklist";
    case "rating": return "star";
    case "checkbox": return "check_box";
    case "date": return "calendar_today";
    case "dropdown": return "arrow_drop_down_circle";
    default: return "help";
  }
}
