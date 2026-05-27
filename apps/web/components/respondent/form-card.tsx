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
    <div className="w-full max-w-[560px] bg-[#1b1b22] border border-[#454653] shadow-2xl rounded-lg overflow-hidden">
      {/* Node Header */}
      <div className="bg-[#292930] px-6 py-4 border-b border-[#454653] flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#c6c5d5]">
            Step {step} of {totalSteps}
          </span>
          <h1
            className="text-lg font-semibold text-[#e4e1eb]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {formTitle}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#fca9d4] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#ffffff]">description</span>
        </div>
      </div>

      {/* Form Body */}
      <div className="p-6 space-y-8">{children}</div>
    </div>
  );
}
