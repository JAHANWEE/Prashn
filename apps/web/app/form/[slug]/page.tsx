"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { FormShell, FormCard } from "~/components/respondent";

export default function RespondentFormPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: form, isLoading, error } = trpc.public.getFormBySlug.useQuery({ slug });
  const submitResponse = trpc.public.submitResponse.useMutation();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (isLoading) {
    return (
      <FormShell progress={0}>
        <div className="w-full max-w-[560px] bg-[#1b1b22] border border-[#454653] rounded-lg p-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[#292930] rounded w-1/3 mx-auto" />
            <div className="h-8 bg-[#292930] rounded w-2/3 mx-auto" />
            <div className="h-12 bg-[#292930] rounded" />
            <div className="h-12 bg-[#292930] rounded" />
          </div>
        </div>
      </FormShell>
    );
  }

  if (error || !form) {
    return (
      <FormShell progress={0}>
        <div className="w-full max-w-[560px] bg-[#1b1b22] border border-[#454653] rounded-lg p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-[#ffb4ab] mb-4 block">error</span>
          <h2 className="text-xl font-semibold text-[#e4e1eb] mb-2">
            {error?.message ?? "Form not found"}
          </h2>
          <p className="text-sm text-[#c6c5d5]">
            This form may have been unpublished, expired, or doesn&apos;t exist.
          </p>
        </div>
      </FormShell>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <FormShell progress={100}>
        <div className="w-full max-w-[560px] bg-[#1b1b22] border border-[#454653] rounded-lg p-12 text-center">
          <span className="material-symbols-outlined text-[64px] text-[#fca9d4] mb-4 block">task_alt</span>
          <h2 className="text-2xl font-semibold text-[#e4e1eb] mb-2" style={{ fontFamily: "var(--font-geist-sans)" }}>
            Thank you!
          </h2>
          <p className="text-sm text-[#c6c5d5] mb-6">
            Your response has been submitted successfully.
          </p>
          <a
            href={`/form/${slug}`}
            onClick={() => { setSubmitted(false); setCurrentStep(0); setAnswers({}); }}
            className="text-[13px] text-[#fca9d4] hover:underline"
          >
            Submit another response
          </a>
        </div>
      </FormShell>
    );
  }

  const totalSteps = form.fields.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const currentField = form.fields[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = async () => {
    // Validate required
    if (currentField?.required && !answers[currentField.id]?.trim()) {
      setErrorMsg("This field is required.");
      return;
    }

    setErrorMsg(null);

    if (isLastStep) {
      // Submit
      try {
        await submitResponse.mutateAsync({
          slug,
          answers: Object.entries(answers).map(([fieldId, value]) => ({
            fieldId,
            value: value || null,
          })),
        });
        setSubmitted(true);
      } catch (err: any) {
        setErrorMsg(err.message ?? "Submission failed. Please try again.");
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const handleAnswerChange = (fieldId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  return (
    <FormShell progress={progress}>
      <FormCard step={currentStep + 1} totalSteps={totalSteps} formTitle={form.title}>
        {currentField && (
          <FieldRenderer
            field={currentField}
            value={answers[currentField.id] ?? ""}
            onChange={(val) => handleAnswerChange(currentField.id, val)}
          />
        )}

        {/* Error message */}
        {errorMsg && (
          <p className="text-[13px] text-[#ffb4ab] bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 rounded-lg px-4 py-2 mt-4">
            {errorMsg}
          </p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6">
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-6 py-3 text-[13px] font-medium text-[#b9c7e0] border border-[#454653] rounded-lg hover:bg-[#34343b] transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleNext}
            disabled={submitResponse.isPending}
            className="flex items-center gap-1 px-8 py-3 text-[13px] font-medium text-[#ffffff] bg-[#fca9d4] rounded-lg shadow-sm hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
          >
            {submitResponse.isPending ? "Submitting..." : isLastStep ? "Submit" : "Next"}
            <span className="material-symbols-outlined text-[18px]">
              {isLastStep ? "check" : "arrow_forward"}
            </span>
          </button>
        </div>
      </FormCard>
    </FormShell>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: any;
  value: string;
  onChange: (val: string) => void;
}) {
  const question = field.label;
  const description = field.description;

  return (
    <div>
      <h2
        className="text-2xl font-semibold text-[#e4e1eb] mb-2"
        style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.01em" }}
      >
        {question}
        {field.required && <span className="text-[#ffb4ab] ml-1">*</span>}
      </h2>
      {description && <p className="text-sm text-[#908f9e] mb-6">{description}</p>}
      {!description && <div className="mb-6" />}

      {(() => {
        switch (field.fieldType) {
          case "short_text":
          case "email":
          case "number":
            return (
              <input
                type={field.fieldType === "email" ? "email" : field.fieldType === "number" ? "number" : "text"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder ?? `Enter your ${field.fieldType === "email" ? "email" : "answer"}...`}
                className="w-full bg-[#0d0e14] border border-[#454653] rounded-xl px-4 py-3.5 text-[15px] text-[#e4e1eb] placeholder:text-[#5a5a6e] focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4] outline-none transition-all"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              />
            );

          case "long_text":
            return (
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder ?? "Type your answer here..."}
                rows={4}
                className="w-full bg-[#0d0e14] border border-[#454653] rounded-xl px-4 py-3.5 text-[15px] text-[#e4e1eb] placeholder:text-[#5a5a6e] focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4] outline-none transition-all resize-none"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              />
            );

          case "single_select":
          case "dropdown": {
            const options = (field.options as Array<{ label: string; value: string }>) ?? [];
            return (
              <div className="space-y-3">
                {options.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      value === opt.value
                        ? "border-[#fca9d4] bg-[#fca9d4]/10"
                        : "border-[#454653] hover:bg-[#1b1b22]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={field.id}
                      value={opt.value}
                      checked={value === opt.value}
                      onChange={() => onChange(opt.value)}
                      className="w-4 h-4 text-[#fca9d4] bg-[#0d0e14] border-[#454653] focus:ring-[#fca9d4]"
                    />
                    <span className="ml-3 text-[15px] text-[#e4e1eb]">{opt.label}</span>
                  </label>
                ))}
              </div>
            );
          }

          case "multi_select": {
            const options = (field.options as Array<{ label: string; value: string }>) ?? [];
            const selected = value ? value.split(",") : [];
            return (
              <div className="space-y-3">
                {options.map((opt) => {
                  const isChecked = selected.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                        isChecked
                          ? "border-[#fca9d4] bg-[#fca9d4]/10"
                          : "border-[#454653] hover:bg-[#1b1b22]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const newSelected = isChecked
                            ? selected.filter((v) => v !== opt.value)
                            : [...selected, opt.value];
                          onChange(newSelected.join(","));
                        }}
                        className="w-4 h-4 text-[#fca9d4] bg-[#0d0e14] border-[#454653] rounded focus:ring-[#fca9d4]"
                      />
                      <span className="ml-3 text-[15px] text-[#e4e1eb]">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            );
          }

          case "rating": {
            const max = 5;
            const currentRating = parseInt(value) || 0;
            return (
              <div className="flex gap-2 justify-center py-4">
                {Array.from({ length: max }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChange(String(i + 1))}
                    className={`w-12 h-12 rounded-full border text-lg font-semibold transition-all ${
                      i < currentRating
                        ? "bg-[#fca9d4] text-[#ffffff] border-[#fca9d4]"
                        : "bg-[#0d0e14] text-[#908f9e] border-[#454653] hover:border-[#fca9d4]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            );
          }

          case "checkbox":
            return (
              <label className="flex items-center gap-3 p-4 border border-[#454653] rounded-xl cursor-pointer hover:bg-[#1b1b22] transition-all">
                <input
                  type="checkbox"
                  checked={value === "true"}
                  onChange={(e) => onChange(e.target.checked ? "true" : "false")}
                  className="w-5 h-5 text-[#fca9d4] bg-[#0d0e14] border-[#454653] rounded focus:ring-[#fca9d4]"
                />
                <span className="text-[15px] text-[#e4e1eb]">Yes</span>
              </label>
            );

          case "date":
            return (
              <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#0d0e14] border border-[#454653] rounded-xl px-4 py-3.5 text-[15px] text-[#e4e1eb] focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4] outline-none transition-all"
              />
            );

          default:
            return (
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter your answer..."
                className="w-full bg-[#0d0e14] border border-[#454653] rounded-xl px-4 py-3.5 text-[15px] text-[#e4e1eb] placeholder:text-[#5a5a6e] focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4] outline-none transition-all"
              />
            );
        }
      })()}
    </div>
  );
}
