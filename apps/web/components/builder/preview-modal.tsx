"use client";

import { useState } from "react";

interface PreviewField {
  id: string;
  label: string;
  description: string | null;
  fieldType: string;
  placeholder: string | null;
  options?: unknown;
  required: boolean;
  position: number;
}

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  formTitle?: string;
  fields: PreviewField[] | undefined;
}

/**
 * Full-screen preview modal that simulates the respondent experience.
 * Shows the form step-by-step exactly as a respondent would see it.
 */
export function PreviewModal({ open, onClose, formTitle, fields }: PreviewModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!open) return null;

  const totalSteps = fields?.length ?? 0;
  const currentField = fields?.[currentStep];
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        className="relative w-full max-w-[480px] mx-4 rounded-2xl overflow-hidden"
        style={{
          background: "#0d0e14",
          border: "1px solid rgba(53, 53, 64, 0.6)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1f1f26]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#fca9d4]">visibility</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>
              Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-[10px] text-[#908f9e] hover:text-[#fca9d4] transition-colors px-2 py-1 rounded"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#1f1f26] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#908f9e]">close</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-[#1f1f26]">
          <div
            className="h-full bg-[#fca9d4] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="px-6 py-8 min-h-[320px] flex flex-col">
          {!fields || fields.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <span className="material-symbols-outlined text-[32px] text-[#353540] mb-2 block">draft</span>
                <p className="text-[13px] text-[#5a5a6e]">No fields to preview</p>
              </div>
            </div>
          ) : currentField ? (
            <div className="flex-1 flex flex-col">
              {/* Step indicator */}
              <p className="text-[10px] text-[#5a5a6e] mb-4" style={{ fontFamily: "var(--font-geist-mono)" }}>
                {currentStep + 1} of {totalSteps}
              </p>

              {/* Question */}
              <h2
                className="text-[20px] font-semibold text-[#e4e1eb] mb-2 leading-tight"
                style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.01em" }}
              >
                {currentField.label}
                {currentField.required && <span className="text-[#ff6b6b] ml-1">*</span>}
              </h2>

              {currentField.description && (
                <p className="text-[12px] text-[#908f9e] mb-5">{currentField.description}</p>
              )}

              {/* Field preview */}
              <div className="mt-auto">
                <PreviewFieldInput field={currentField} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <span className="material-symbols-outlined text-[40px] text-[#22c55e] mb-2 block">task_alt</span>
                <p className="text-[16px] font-medium text-[#e4e1eb]">Thank you!</p>
                <p className="text-[12px] text-[#908f9e] mt-1">Response submitted successfully.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        {fields && fields.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#1f1f26]">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-1 px-4 py-2 text-[11px] font-medium text-[#c6c5d5] border border-[#454653] rounded-lg hover:bg-[#1f1f26] transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep >= totalSteps - 1}
              className="flex items-center gap-1 px-5 py-2 text-[11px] font-medium text-[#ffffff] bg-[#fca9d4] rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              Next
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewFieldInput({ field }: { field: PreviewField }) {
  const options = (field.options as Array<{ label: string; value: string }>) ?? [];

  switch (field.fieldType) {
    case "short_text":
    case "email":
    case "number":
      return (
        <input
          type={field.fieldType === "email" ? "email" : field.fieldType === "number" ? "number" : "text"}
          placeholder={field.placeholder ?? "Type your answer..."}
          disabled
          className="w-full bg-[#141418] border border-[#353540] rounded-xl px-4 py-3 text-[14px] text-[#e4e1eb] placeholder:text-[#4a4a5a]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        />
      );

    case "long_text":
      return (
        <textarea
          placeholder={field.placeholder ?? "Type your answer..."}
          disabled
          rows={3}
          className="w-full bg-[#141418] border border-[#353540] rounded-xl px-4 py-3 text-[14px] text-[#e4e1eb] placeholder:text-[#4a4a5a] resize-none"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        />
      );

    case "single_select":
    case "dropdown":
      return (
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 border border-[#353540] rounded-xl"
              style={{ background: "#141418" }}
            >
              <div className="w-4 h-4 rounded-full border-2 border-[#5a5a6e]" />
              <span className="text-[13px] text-[#c6c5d5]">{opt.label}</span>
            </div>
          ))}
        </div>
      );

    case "multi_select":
      return (
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 border border-[#353540] rounded-xl"
              style={{ background: "#141418" }}
            >
              <div className="w-4 h-4 rounded border-2 border-[#5a5a6e]" />
              <span className="text-[13px] text-[#c6c5d5]">{opt.label}</span>
            </div>
          ))}
        </div>
      );

    case "rating":
      return (
        <div className="flex gap-2 py-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="w-10 h-10 rounded-full border-2 border-[#353540] flex items-center justify-center text-[14px] text-[#5a5a6e]"
              style={{ background: "#141418" }}
            >
              {n}
            </div>
          ))}
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center gap-3 px-4 py-3 border border-[#353540] rounded-xl" style={{ background: "#141418" }}>
          <div className="w-5 h-5 rounded border-2 border-[#5a5a6e]" />
          <span className="text-[13px] text-[#c6c5d5]">Yes</span>
        </div>
      );

    case "date":
      return (
        <input
          type="date"
          disabled
          className="w-full bg-[#141418] border border-[#353540] rounded-xl px-4 py-3 text-[14px] text-[#5a5a6e]"
        />
      );

    default:
      return (
        <input
          type="text"
          placeholder="Answer..."
          disabled
          className="w-full bg-[#141418] border border-[#353540] rounded-xl px-4 py-3 text-[14px] text-[#e4e1eb] placeholder:text-[#4a4a5a]"
        />
      );
  }
}
