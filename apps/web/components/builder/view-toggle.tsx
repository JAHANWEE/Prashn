"use client";

import { useEffect, useState } from "react";

export type BuilderView = "form" | "flow";

interface ViewToggleProps {
  value: BuilderView;
  onChange: (view: BuilderView) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="w-full space-y-2">
      {/* Form button */}
      <button
        onClick={() => onChange("form")}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all"
        style={{
          fontFamily: "var(--font-geist-mono)",
          background: value === "form" ? "#1b1b22" : "transparent",
          color: value === "form" ? "#e4e1eb" : "#5a5a6e",
          border: value === "form" ? "1px solid #454653" : "1px solid transparent",
        }}
      >
        <span className="material-symbols-outlined text-[18px]">view_list</span>
        Form View
      </button>

      {/* Canvas Flow button — highlighted */}
      <button
        onClick={() => onChange("flow")}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all relative overflow-hidden"
        style={{
          fontFamily: "var(--font-geist-mono)",
          background: value === "flow"
            ? "linear-gradient(135deg, rgba(252,169,212,0.15) 0%, rgba(252,169,212,0.05) 100%)"
            : "linear-gradient(135deg, rgba(252,169,212,0.06) 0%, rgba(252,169,212,0.02) 100%)",
          color: value === "flow" ? "#fca9d4" : "#fca9d4",
          border: value === "flow" ? "1px solid rgba(252,169,212,0.5)" : "1px solid rgba(252,169,212,0.2)",
          boxShadow: value === "flow"
            ? "0 0 20px rgba(252,169,212,0.15), inset 0 1px 0 rgba(252,169,212,0.1)"
            : "0 0 8px rgba(252,169,212,0.05)",
        }}
      >
        <span className="material-symbols-outlined text-[18px]">timeline</span>
        Canvas View
        {/* Badge */}
        <span
          className="ml-auto px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider"
          style={{ background: "#fca9d4", color: "#0a0a0f" }}
        >
          NEW
        </span>
        {/* Animated shimmer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(252,169,212,0.08) 50%, transparent 100%)",
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />
      </button>

      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export function useBuilderView(): [BuilderView, (v: BuilderView) => void] {
  const [view, setView] = useState<BuilderView>("form");

  useEffect(() => {
    const stored = localStorage.getItem("builder-view");
    if (stored === "form" || stored === "flow") {
      setView(stored);
    }
  }, []);

  const setAndPersist = (v: BuilderView) => {
    setView(v);
    localStorage.setItem("builder-view", v);
  };

  return [view, setAndPersist];
}
