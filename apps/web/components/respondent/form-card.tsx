/**
 * FormCard — The main form container card with header and body.
 */
export function FormCard({
  step,
  totalSteps,
  formTitle,
  children,
}: {
  step: number;
  totalSteps: number;
  formTitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-[90vw] max-w-[680px] bg-[#1b1b22] border border-[#454653] shadow-2xl rounded-2xl overflow-hidden">
      {/* Node Header */}
      <div className="bg-[#292930] px-8 py-5 border-b border-[#454653] flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>
            Step {step} of {totalSteps}
          </span>
          <h1
            className="text-xl font-semibold text-[#e4e1eb] mt-0.5"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {formTitle}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#fca9d4] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#0a0a0f]">description</span>
        </div>
      </div>

      {/* Form Body */}
      <div className="px-8 py-8 space-y-6">{children}</div>
    </div>
  );
}
