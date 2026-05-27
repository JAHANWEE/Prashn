"use client";

import { useEffect, useState } from "react";

export type BuilderView = "form" | "flow";

interface ViewToggleProps {
  value: BuilderView;
  onChange: (view: BuilderView) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="w-full flex items-center p-1 gap-1 rounded-xl bg-[#0a0a0f] border border-[#1e212d]">
      <button
        onClick={() => onChange("form")}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold transition-all"
        style={{
          fontFamily: "var(--font-geist-mono)",
          background: value === "form" ? "#1b1b22" : "transparent",
          color: value === "form" ? "#e4e1eb" : "#5a5a6e",
          border: value === "form" ? "1px solid #2d2d3a" : "1px solid transparent",
        }}
      >
        <span className="material-symbols-outlined text-[16px]">view_list</span>
        Form
      </button>
      <button
        onClick={() => onChange("flow")}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold transition-all relative"
        style={{
          fontFamily: "var(--font-geist-mono)",
          background: value === "flow" ? "rgba(252,169,212,0.12)" : "rgba(252,169,212,0.03)",
          color: value === "flow" ? "#fca9d4" : "#fca9d4",
          border: value === "flow" ? "1px solid rgba(252,169,212,0.4)" : "1px solid rgba(252,169,212,0.15)",
          boxShadow: value === "flow" ? "0 0 12px rgba(252,169,212,0.1)" : "none",
        }}
      >
        <span className="material-symbols-outlined text-[16px]">timeline</span>
        Canvas
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#fca9d4] animate-pulse" />
      </button>
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
