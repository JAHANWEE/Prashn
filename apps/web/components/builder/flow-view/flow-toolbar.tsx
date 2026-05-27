"use client";

interface FlowToolbarProps {
  onAddStep: () => void;
  onAutoArrange: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  zoom: number;
}

export function FlowToolbar({
  onAddStep,
  onAutoArrange,
  onZoomIn,
  onZoomOut,
  onFitView,
  zoom,
}: FlowToolbarProps) {
  return (
    <div
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-0.5 px-1.5 py-1"
      style={{
        background: "rgba(13, 14, 20, 0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(53, 53, 64, 0.6)",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
      }}
    >
      <ToolbarButton icon="add_circle" label="Add Step" onClick={onAddStep} accent />
      <ToolbarDivider />
      <ToolbarButton icon="auto_awesome" label="Auto Arrange" onClick={onAutoArrange} />
      <ToolbarDivider />
      <ToolbarButton icon="remove" label="Zoom Out" onClick={onZoomOut} />
      <span
        className="text-[10px] w-9 text-center tabular-nums select-none"
        style={{
          fontFamily: "var(--font-geist-mono)",
          color: "rgba(144, 143, 158, 0.8)",
        }}
      >
        {Math.round(zoom * 100)}%
      </span>
      <ToolbarButton icon="add" label="Zoom In" onClick={onZoomIn} />
      <ToolbarDivider />
      <ToolbarButton icon="fit_screen" label="Fit View" onClick={onFitView} />
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  accent,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
      style={{
        color: accent ? "#bdc2ff" : "rgba(198, 197, 213, 0.7)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(31, 31, 38, 0.8)";
        e.currentTarget.style.color = accent ? "#bdc2ff" : "#e4e1eb";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = accent ? "#bdc2ff" : "rgba(198, 197, 213, 0.7)";
      }}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-[1px] h-4 mx-0.5" style={{ background: "rgba(53, 53, 64, 0.5)" }} />;
}
