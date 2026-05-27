"use client";

import { useState } from "react";
import { TerminalForm } from "~/app/terminal-theme-preview/components/terminal-form";
import { THEMES } from "./theme-data";

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

type Device = "desktop" | "tablet" | "mobile";
type Zoom = 0.75 | 1 | 1.25;

const DEVICE_SIZES = {
  desktop: { w: 1024, h: 640, label: "Desktop", icon: "laptop_mac" },
  tablet: { w: 768, h: 500, label: "Tablet", icon: "tablet_mac" },
  mobile: { w: 375, h: 680, label: "Mobile", icon: "phone_iphone" },
};

export function PreviewModal({ open, onClose, formTitle, fields }: PreviewModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [device, setDevice] = useState<Device>("desktop");
  const [zoom, setZoom] = useState<Zoom>(0.75);
  const [theme, setTheme] = useState<string>("default");

  if (!open) return null;

  const totalSteps = fields?.length ?? 0;
  const currentField = fields?.[currentStep];
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const deviceInfo = DEVICE_SIZES[device];

  const handleNext = () => { if (currentStep < totalSteps - 1) setCurrentStep(s => s + 1); };
  const handleBack = () => { setCurrentStep(s => Math.max(0, s - 1)); };
  const handleReset = () => { setCurrentStep(0); };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: "radial-gradient(ellipse at 50% 30%, #12121a 0%, #08080c 70%)" }}>
      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#1e212d] bg-[#0c0c12]/80 backdrop-blur-md shrink-0">
        {/* Left: title */}
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[16px] text-[#fca9d4]">visibility</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>
            Preview
          </span>
          <span className="text-[10px] text-[#5a5a6e]">—</span>
          <span className="text-[11px] text-[#c6c5d5]" style={{ fontFamily: "var(--font-geist-mono)" }}>{formTitle ?? "Untitled"}</span>
        </div>

        {/* Center: Device switcher */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#0a0a0f] border border-[#1e212d]">
          {(["desktop", "tablet", "mobile"] as Device[]).map(d => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-medium transition-all"
              style={{
                fontFamily: "var(--font-geist-mono)",
                background: device === d ? "#1e212d" : "transparent",
                color: device === d ? "#fca9d4" : "#5a5a6e",
                border: device === d ? "1px solid #2d2d3a" : "1px solid transparent",
              }}
            >
              <span className="material-symbols-outlined text-[14px]">{DEVICE_SIZES[d].icon}</span>
              {DEVICE_SIZES[d].label}
            </button>
          ))}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {/* Theme selector */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#0a0a0f] border border-[#1e212d]">
            {THEMES.slice(0, 6).map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                className="w-4 h-4 rounded-full transition-all"
                style={{ background: t.color, opacity: theme === t.id ? 1 : 0.35, transform: theme === t.id ? "scale(1.3)" : "scale(1)", border: theme === t.id ? "2px solid white" : "none" }}
              />
            ))}
          </div>
          {/* Zoom */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0a0a0f] border border-[#1e212d]">
            {([0.75, 1, 1.25] as Zoom[]).map(z => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className="px-2 py-0.5 rounded text-[9px] font-medium transition-colors"
                style={{ fontFamily: "var(--font-geist-mono)", color: zoom === z ? "#fca9d4" : "#5a5a6e", background: zoom === z ? "#1e212d" : "transparent" }}
              >
                {Math.round(z * 100)}%
              </button>
            ))}
          </div>
          {/* Restart */}
          <button onClick={handleReset} className="p-1.5 rounded-md hover:bg-[#1e212d] transition-colors" title="Restart">
            <span className="material-symbols-outlined text-[16px] text-[#5a5a6e] hover:text-[#fca9d4]">refresh</span>
          </button>
          {/* Close */}
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#1e212d] transition-colors" title="Close">
            <span className="material-symbols-outlined text-[16px] text-[#5a5a6e]">close</span>
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-8">
        <div style={{ transform: `scale(${zoom})`, transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
          {theme === "terminal" ? (
            <TerminalForm
              formTitle={formTitle ?? "Untitled Form"}
              fields={(fields ?? []).map(f => ({ id: f.id, label: f.label, fieldType: f.fieldType, required: f.required, placeholder: f.placeholder ?? "", options: f.options as Array<{ label: string; value: string }> | undefined }))}
              onSubmit={() => {}}
            />
          ) : (
            <>
              {device === "desktop" && <DesktopFrame progress={progress}><FormContent field={currentField} fields={fields} step={currentStep} total={totalSteps} onNext={handleNext} onBack={handleBack} /></DesktopFrame>}
              {device === "tablet" && <TabletFrame><FormContent field={currentField} fields={fields} step={currentStep} total={totalSteps} onNext={handleNext} onBack={handleBack} /></TabletFrame>}
              {device === "mobile" && <MobileFrame progress={progress}><FormContent field={currentField} fields={fields} step={currentStep} total={totalSteps} onNext={handleNext} onBack={handleBack} /></MobileFrame>}
            </>
          )}
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="h-8 flex items-center justify-center gap-6 border-t border-[#1e212d] bg-[#0c0c12]/80 backdrop-blur-md shrink-0">
        <span className="text-[9px] text-[#5a5a6e]" style={{ fontFamily: "var(--font-geist-mono)" }}>{deviceInfo.label}</span>
        <span className="text-[9px] text-[#3a3a4a]">•</span>
        <span className="text-[9px] text-[#5a5a6e]" style={{ fontFamily: "var(--font-geist-mono)" }}>{deviceInfo.w} × {deviceInfo.h}</span>
        <span className="text-[9px] text-[#3a3a4a]">•</span>
        <span className="text-[9px] text-[#5a5a6e]" style={{ fontFamily: "var(--font-geist-mono)" }}>Step {currentStep + 1} / {totalSteps || 1}</span>
      </div>
    </div>
  );
}

// ─── Device Frames ───────────────────────────────────────────────────────────

function DesktopFrame({ children, progress }: { children: React.ReactNode; progress: number }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl" style={{ width: 900, border: "1px solid #2d2d3a", boxShadow: "0 20px 80px rgba(0,0,0,0.6)" }}>
      {/* Browser chrome */}
      <div className="h-9 bg-[#1a1a22] border-b border-[#2d2d3a] flex items-center px-3 gap-3">
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        {/* URL bar */}
        <div className="flex-1 h-5 bg-[#0d0e14] rounded-md flex items-center px-3 border border-[#2d2d3a]">
          <span className="material-symbols-outlined text-[10px] text-[#5a5a6e] mr-1.5">lock</span>
          <span className="text-[9px] text-[#5a5a6e]" style={{ fontFamily: "var(--font-geist-mono)" }}>canvasforms.io/form/your-form</span>
        </div>
      </div>
      {/* Progress */}
      <div className="h-[2px] bg-[#1a1a22]"><div className="h-full bg-[#fca9d4] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
      {/* Content */}
      <div className="bg-[#0d0e14] h-[520px] overflow-auto">{children}</div>
    </div>
  );
}

function TabletFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] overflow-hidden" style={{ width: 740, border: "8px solid #1a1a22", boxShadow: "0 20px 80px rgba(0,0,0,0.6), inset 0 0 0 1px #2d2d3a" }}>
      <div className="bg-[#0d0e14] h-[480px] overflow-auto rounded-[12px]">{children}</div>
    </div>
  );
}

function MobileFrame({ children, progress }: { children: React.ReactNode; progress: number }) {
  return (
    <div className="relative rounded-[40px] overflow-hidden" style={{ width: 340, border: "10px solid #1a1a22", boxShadow: "0 20px 80px rgba(0,0,0,0.6), inset 0 0 0 1px #2d2d3a" }}>
      {/* Dynamic island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0a0a0f] rounded-full z-20 border border-[#2d2d3a]" />
      {/* Progress */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-10 bg-[#1a1a22]"><div className="h-full bg-[#fca9d4] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
      {/* Content */}
      <div className="bg-[#0d0e14] h-[620px] overflow-auto pt-8 pb-6 rounded-[30px]">{children}</div>
      {/* Home indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-[#5a5a6e] rounded-full" />
    </div>
  );
}

// ─── Form Content (unchanged logic) ─────────────────────────────────────────

function FormContent({ field, fields, step, total, onNext, onBack }: { field: PreviewField | undefined; fields: PreviewField[] | undefined; step: number; total: number; onNext: () => void; onBack: () => void }) {
  if (!fields || fields.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="material-symbols-outlined text-[32px] text-[#353540] mb-2 block">draft</span>
          <p className="text-[13px] text-[#5a5a6e]">No fields to preview</p>
        </div>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="material-symbols-outlined text-[40px] text-[#22c55e] mb-2 block">task_alt</span>
          <p className="text-[16px] font-medium text-[#e4e1eb]">Thank you!</p>
          <p className="text-[12px] text-[#908f9e] mt-1">Response submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-8 py-8">
      <p className="text-[10px] text-[#5a5a6e] mb-4" style={{ fontFamily: "var(--font-geist-mono)" }}>{step + 1} of {total}</p>
      <h2 className="text-[20px] font-semibold text-[#e4e1eb] mb-2 leading-tight" style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.01em" }}>
        {field.label}{field.required && <span className="text-[#ff6b6b] ml-1">*</span>}
      </h2>
      {field.description && <p className="text-[12px] text-[#908f9e] mb-5">{field.description}</p>}
      <div className="flex-1 flex flex-col justify-center"><PreviewFieldInput field={field} /></div>
      {/* Nav */}
      <div className="flex items-center justify-between pt-4 mt-auto">
        <button onClick={onBack} disabled={step === 0} className="flex items-center gap-1 px-4 py-2 text-[11px] font-medium text-[#c6c5d5] border border-[#454653] rounded-lg hover:bg-[#1f1f26] transition-colors disabled:opacity-30">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>Back
        </button>
        <button onClick={onNext} disabled={step >= total - 1} className="flex items-center gap-1 px-5 py-2 text-[11px] font-medium text-[#0a0a0f] bg-[#fca9d4] rounded-lg hover:brightness-110 transition-all disabled:opacity-50">
          Next<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

// ─── Field Input Previews (unchanged) ────────────────────────────────────────

function PreviewFieldInput({ field }: { field: PreviewField }) {
  const options = (field.options as Array<{ label: string; value: string }>) ?? [];
  switch (field.fieldType) {
    case "short_text": case "email": case "number":
      return <input type="text" placeholder={field.placeholder ?? "Type your answer..."} disabled className="w-full bg-[#141418] border border-[#353540] rounded-xl px-4 py-3 text-[14px] text-[#e4e1eb] placeholder:text-[#4a4a5a]" style={{ fontFamily: "var(--font-geist-sans)" }} />;
    case "long_text":
      return <textarea placeholder={field.placeholder ?? "Type your answer..."} disabled rows={3} className="w-full bg-[#141418] border border-[#353540] rounded-xl px-4 py-3 text-[14px] text-[#e4e1eb] placeholder:text-[#4a4a5a] resize-none" style={{ fontFamily: "var(--font-geist-sans)" }} />;
    case "single_select": case "dropdown":
      return <div className="space-y-2">{options.map((opt, i) => (<div key={i} className="flex items-center gap-3 px-4 py-2.5 border border-[#353540] rounded-xl bg-[#141418]"><div className="w-4 h-4 rounded-full border-2 border-[#5a5a6e]"/><span className="text-[13px] text-[#c6c5d5]">{opt.label}</span></div>))}</div>;
    case "multi_select":
      return <div className="space-y-2">{options.map((opt, i) => (<div key={i} className="flex items-center gap-3 px-4 py-2.5 border border-[#353540] rounded-xl bg-[#141418]"><div className="w-4 h-4 rounded border-2 border-[#5a5a6e]"/><span className="text-[13px] text-[#c6c5d5]">{opt.label}</span></div>))}</div>;
    case "rating":
      return <div className="flex gap-2 py-2">{[1,2,3,4,5].map(n => (<div key={n} className="w-10 h-10 rounded-full border-2 border-[#353540] flex items-center justify-center text-[14px] text-[#5a5a6e] bg-[#141418]">{n}</div>))}</div>;
    case "checkbox":
      return <div className="flex items-center gap-3 px-4 py-3 border border-[#353540] rounded-xl bg-[#141418]"><div className="w-5 h-5 rounded border-2 border-[#5a5a6e]"/><span className="text-[13px] text-[#c6c5d5]">Yes</span></div>;
    case "date":
      return <input type="date" disabled className="w-full bg-[#141418] border border-[#353540] rounded-xl px-4 py-3 text-[14px] text-[#5a5a6e]" />;
    default:
      return <input type="text" placeholder="Answer..." disabled className="w-full bg-[#141418] border border-[#353540] rounded-xl px-4 py-3 text-[14px] text-[#e4e1eb] placeholder:text-[#4a4a5a]" />;
  }
}
