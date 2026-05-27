"use client";

import { useEffect, useState } from "react";

export type BuilderView = "form" | "flow";

interface ViewToggleProps {
  value: BuilderView;
  onChange: (view: BuilderView) => void;
}

/**
 * Toggle between Form View and Flow View.
 * Persists selection to localStorage.
 */
export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      className="flex items-center p-[3px] gap-[2px]"
      style={{
        background: "rgba(13, 14, 20, 0.8)",
        border: "1px solid rgba(53, 53, 64, 0.6)",
        borderRadius: "10px",
      }}
      role="tablist"
      aria-label="Builder view mode"
    >
      <ToggleButton
        active={value === "form"}
        onClick={() => onChange("form")}
        icon="view_list"
        label="Form"
        ariaLabel="Switch to Form View"
      />
      <ToggleButton
        active={value === "flow"}
        onClick={() => onChange("flow")}
        icon="timeline"
        label="Journey"
        ariaLabel="Switch to Journey View"
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  ariaLabel: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-[5px] rounded-[7px] text-[11px] font-medium"
      style={{
        fontFamily: "var(--font-geist-mono)",
        background: active ? "rgba(31, 31, 38, 0.9)" : "transparent",
        color: active ? "#fca9d4" : "rgba(144, 143, 158, 0.7)",
        border: active ? "1px solid rgba(69, 70, 83, 0.6)" : "1px solid transparent",
        boxShadow: active ? "0 1px 4px rgba(0, 0, 0, 0.2)" : "none",
        transition: "all 0.15s ease",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/**
 * Hook to persist builder view preference.
 */
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
