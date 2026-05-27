"use client";

import { useState, useEffect } from "react";
import { trpc } from "~/trpc/client";

interface FormSettingsPanelProps {
  formId: string;
}

/**
 * Form-level settings panel shown in the inspector when no field is selected.
 * Allows editing: title, description, visibility, expiry, response limit, slug.
 */
export function FormSettingsPanel({ formId }: FormSettingsPanelProps) {
  const { data: form } = trpc.forms.getById.useQuery({ formId });
  const { data: themes } = trpc.themes.list.useQuery();
  const utils = trpc.useUtils();

  const updateForm = trpc.forms.update.useMutation({
    onSuccess: () => {
      utils.forms.getById.invalidate();
    },
  });

  const updateVisibility = trpc.forms.updateVisibility.useMutation({
    onSuccess: () => {
      utils.forms.getById.invalidate();
    },
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [responseLimit, setResponseLimit] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");

  // Sync form data into local state
  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description ?? "");
      setVisibility(form.visibility as "public" | "unlisted");
      setResponseLimit(form.responseLimit?.toString() ?? "");
      setExpiresAt(form.expiresAt ? form.expiresAt.split("T")[0] ?? "" : "");
    }
  }, [form]);

  if (!form) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[12px] text-[#908f9e]">Loading...</p>
      </div>
    );
  }

  const handleSave = () => {
    updateForm.mutate({
      formId,
      title: title.trim() || "Untitled Form",
      description: description.trim() || null,
      responseLimit: responseLimit ? parseInt(responseLimit) : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
  };

  const handleVisibilityChange = (v: "public" | "unlisted") => {
    setVisibility(v);
    updateVisibility.mutate({ formId, visibility: v });
  };

  const slug = form.slug;
  const formUrl = typeof window !== "undefined" ? `${window.location.origin}/form/${slug}` : "";

  return (
    <div className="space-y-5">
      {/* Form title */}
      <Section label="Title">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#0d0e14] border border-[#454653] rounded-lg px-3 py-2 text-[13px] text-[#e4e1eb] focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4] outline-none"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        />
      </Section>

      {/* Description */}
      <Section label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Optional description..."
          className="w-full bg-[#0d0e14] border border-[#454653] rounded-lg px-3 py-2 text-[12px] text-[#e4e1eb] placeholder:text-[#5a5a6e] focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4] outline-none resize-none"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        />
      </Section>

      {/* Slug / Share link */}
      <Section label="Share Link">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 bg-[#0d0e14] border border-[#454653] rounded-lg px-2.5 py-1.5 text-[11px] text-[#908f9e] truncate" style={{ fontFamily: "var(--font-geist-mono)" }}>
            /form/{slug}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(formUrl)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#454653] text-[#908f9e] hover:text-[#fca9d4] hover:border-[#fca9d4] transition-colors"
            title="Copy link"
          >
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
          </button>
        </div>
      </Section>

      {/* Visibility */}
      <Section label="Visibility">
        <div className="flex gap-2">
          <VisibilityOption
            active={visibility === "public"}
            onClick={() => handleVisibilityChange("public")}
            icon="public"
            label="Public"
            description="Visible in explore"
          />
          <VisibilityOption
            active={visibility === "unlisted"}
            onClick={() => handleVisibilityChange("unlisted")}
            icon="link"
            label="Unlisted"
            description="Link only"
          />
        </div>
      </Section>

      {/* Theme */}
      {themes && themes.length > 0 && (
        <Section label="Theme">
          <div className="flex gap-2 flex-wrap">
            {themes.slice(0, 6).map((theme) => (
              <button
                key={theme.id}
                onClick={() => updateForm.mutate({ formId, themeId: theme.id })}
                className="w-6 h-6 rounded-full border-2 transition-all"
                style={{
                  background: theme.primaryColor,
                  borderColor: form.themeId === theme.id ? "#e4e1eb" : "transparent",
                  boxShadow: form.themeId === theme.id ? "0 0 0 2px rgba(252,169,212,0.3)" : "none",
                }}
                title={theme.name}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Response Limit */}
      <Section label="Response Limit">
        <input
          type="number"
          value={responseLimit}
          onChange={(e) => setResponseLimit(e.target.value)}
          placeholder="Unlimited"
          min={1}
          className="w-full bg-[#0d0e14] border border-[#454653] rounded-lg px-3 py-2 text-[12px] text-[#e4e1eb] placeholder:text-[#5a5a6e] focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4] outline-none"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        />
      </Section>

      {/* Expiry */}
      <Section label="Expires At">
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full bg-[#0d0e14] border border-[#454653] rounded-lg px-3 py-2 text-[12px] text-[#e4e1eb] focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4] outline-none"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        />
      </Section>

      {/* Status badge */}
      <Section label="Status">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 text-[10px] font-medium rounded-full border"
            style={{
              background: form.status === "published" ? "rgba(34,197,94,0.1)" : "rgba(41,41,48,1)",
              color: form.status === "published" ? "#22c55e" : "#c6c5d5",
              borderColor: form.status === "published" ? "rgba(34,197,94,0.3)" : "#454653",
            }}
          >
            {form.status}
          </span>
        </div>
      </Section>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={updateForm.isPending}
        className="w-full bg-[#fca9d4] text-[#ffffff] text-[12px] font-semibold py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
      >
        {updateForm.isPending ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label
        className="text-[10px] uppercase tracking-wider text-[#908f9e]"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function VisibilityOption({
  active,
  onClick,
  icon,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 p-2.5 rounded-lg border text-left transition-all"
      style={{
        background: active ? "rgba(235, 54, 120, 0.06)" : "#0d0e14",
        borderColor: active ? "rgba(235, 54, 120, 0.4)" : "#454653",
      }}
    >
      <span
        className="material-symbols-outlined text-[16px] block mb-1"
        style={{ color: active ? "#fca9d4" : "#908f9e" }}
      >
        {icon}
      </span>
      <span className="text-[11px] font-medium text-[#e4e1eb] block">{label}</span>
      <span className="text-[9px] text-[#5a5a6e]">{description}</span>
    </button>
  );
}
