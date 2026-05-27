"use client";

import type { BuilderView } from "./view-toggle";

interface BuilderToolbarProps {
  view?: BuilderView;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onPreview?: () => void;
}

/**
 * Vertical icon toolbar on the far left of the builder.
 * Shows contextual actions based on the current view.
 */
export function BuilderToolbar({
  view = "form",
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onPreview,
}: BuilderToolbarProps) {
  return (
    <aside
      className="w-12 h-full flex flex-col items-center py-4 gap-1 border-r z-30"
      style={{
        background: "#0d0e14",
        borderColor: "rgba(53, 53, 64, 0.6)",
      }}
    >
      {/* Undo */}
      <ToolbarIconButton
        icon="undo"
        label="Undo (⌘Z)"
        onClick={onUndo}
        disabled={!canUndo}
      />
      {/* Redo */}
      <ToolbarIconButton
        icon="redo"
        label="Redo (⌘⇧Z)"
        onClick={onRedo}
        disabled={!canRedo}
      />

      <div className="w-6 h-[1px] my-2" style={{ background: "rgba(53, 53, 64, 0.5)" }} />

      {/* Preview */}
      <ToolbarIconButton
        icon="visibility"
        label="Preview Form"
        onClick={onPreview}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* View indicator */}
      <div className="flex flex-col items-center gap-0.5">
        <span
          className="material-symbols-outlined text-[16px]"
          style={{ color: view === "flow" ? "#818cf8" : "#5a5a6e" }}
        >
          {view === "flow" ? "account_tree" : "view_list"}
        </span>
        <span
          className="text-[8px] uppercase tracking-wider"
          style={{ color: "#5a5a6e", fontFamily: "var(--font-geist-mono)" }}
        >
          {view}
        </span>
      </div>
    </aside>
  );
}

function ToolbarIconButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
      style={{ color: "rgba(198, 197, 213, 0.7)" }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "rgba(31, 31, 38, 0.8)";
          e.currentTarget.style.color = "#e4e1eb";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "rgba(198, 197, 213, 0.7)";
      }}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}
