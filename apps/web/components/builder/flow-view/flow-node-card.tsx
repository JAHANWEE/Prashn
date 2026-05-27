"use client";

import { useState } from "react";
import type { FlowNode } from "./types";
import { NODE_WIDTH } from "./types";

interface FlowNodeCardProps {
  node: FlowNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onDragStart: (e: React.PointerEvent) => void;
}

export function FlowNodeCard({ node, isSelected, onSelect, onDelete, onDragStart }: FlowNodeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isSynthetic = node.id === "__welcome__" || node.id === "__success__";

  return (
    <div
      className="absolute select-none"
      style={{
        left: node.x,
        top: node.y,
        width: NODE_WIDTH,
        zIndex: isHovered || isSelected ? 20 : 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {/* Card container */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: isSelected
            ? "1.5px solid rgba(129, 140, 248, 0.7)"
            : isHovered
              ? "1px solid rgba(69, 70, 83, 0.9)"
              : "1px solid rgba(53, 53, 64, 0.7)",
          boxShadow: isSelected
            ? "0 0 0 3px rgba(129, 140, 248, 0.08), 0 4px 20px rgba(0, 0, 0, 0.4)"
            : isHovered
              ? "0 8px 32px rgba(0, 0, 0, 0.5)"
              : "0 2px 12px rgba(0, 0, 0, 0.3)",
          transform: isHovered ? "translateY(-1px)" : "translateY(0)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
          background: "#141418",
        }}
      >
        {/* Header bar */}
        <div
          className="px-3.5 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing touch-none"
          style={{ background: getHeaderBg(node.type) }}
          onPointerDown={onDragStart}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: getIconBg(node.type) }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "13px", color: getIconColor(node.type) }}
              >
                {getNodeIcon(node.type)}
              </span>
            </div>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-geist-mono)",
                color: "rgba(144, 143, 158, 0.9)",
              }}
            >
              {getNodeTypeLabel(node.type)}
            </span>
          </div>
          {!isSynthetic && isHovered && onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-[rgba(255,180,171,0.1)] transition-colors"
            >
              <span className="material-symbols-outlined text-[13px] text-[#908f9e] hover:text-[#ffb4ab]">close</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-3.5 py-3" style={{ background: "#141418" }}>
          {node.type === "welcome" && <WelcomeBody label={node.label} />}
          {node.type === "success" && <SuccessBody />}
          {node.type === "question" && <QuestionBody node={node} />}
          {node.type === "choice" && <ChoiceBody node={node} />}
          {node.type === "question_group" && <QuestionGroupBody node={node} />}
        </div>
      </div>

      {/* Connection ports */}
      <ConnectionPort position="top" visible={node.id !== "__welcome__"} isActive={isHovered || isSelected} />
      <ConnectionPort position="bottom" visible={node.id !== "__success__"} isActive={isHovered || isSelected} />
    </div>
  );
}

// ─── Connection Port ─────────────────────────────────────────────────────────

function ConnectionPort({ position, visible, isActive }: { position: "top" | "bottom"; visible: boolean; isActive: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={{
        [position]: "-5px",
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          border: `2px solid ${isActive ? "rgba(129, 140, 248, 0.6)" : "rgba(53, 53, 64, 0.8)"}`,
          background: isActive ? "rgba(129, 140, 248, 0.15)" : "#141418",
          transition: "border-color 0.15s ease, background 0.15s ease",
        }}
      />
    </div>
  );
}

// ─── Node Body Variants ──────────────────────────────────────────────────────

function WelcomeBody({ label }: { label: string }) {
  return (
    <div className="text-center py-1.5">
      <p
        className="text-[13px] font-medium text-[#e4e1eb] leading-tight"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        {label}
      </p>
      <p className="text-[10px] text-[#5a5a6e] mt-1">Start of form</p>
    </div>
  );
}

function SuccessBody() {
  return (
    <div className="text-center py-1.5">
      <div
        className="w-7 h-7 rounded-full mx-auto mb-1.5 flex items-center justify-center"
        style={{ background: "rgba(34, 197, 94, 0.1)" }}
      >
        <span className="material-symbols-outlined text-[16px] text-[#22c55e]">check</span>
      </div>
      <p
        className="text-[13px] font-medium text-[#e4e1eb] leading-tight"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        Thank You
      </p>
      <p className="text-[10px] text-[#5a5a6e] mt-0.5">End of form</p>
    </div>
  );
}

function QuestionBody({ node }: { node: FlowNode }) {
  const field = node.fields[0];
  if (!field) return null;

  return (
    <div>
      <p className="text-[12px] font-medium text-[#e4e1eb] leading-snug" style={{ fontFamily: "var(--font-geist-sans)" }}>
        {field.label}
        {field.required && <span className="text-[#ff6b6b] ml-0.5 text-[10px]">*</span>}
      </p>
      <div
        className="mt-2 h-7 rounded-md flex items-center px-2.5"
        style={{ background: "rgba(13, 14, 20, 0.6)", border: "1px solid rgba(53, 53, 64, 0.5)" }}
      >
        <span className="text-[10px] text-[#4a4a5a]" style={{ fontFamily: "var(--font-geist-mono)" }}>
          {getFieldPlaceholder(field.fieldType)}
        </span>
      </div>
    </div>
  );
}

function ChoiceBody({ node }: { node: FlowNode }) {
  const field = node.fields[0];
  if (!field) return null;
  const options = field.options ?? [];

  return (
    <div>
      <p className="text-[12px] font-medium text-[#e4e1eb] leading-snug mb-2" style={{ fontFamily: "var(--font-geist-sans)" }}>
        {field.label}
        {field.required && <span className="text-[#ff6b6b] ml-0.5 text-[10px]">*</span>}
      </p>
      <div className="space-y-1">
        {options.slice(0, 3).map((opt, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md"
            style={{ background: "rgba(13, 14, 20, 0.4)", border: "1px solid rgba(53, 53, 64, 0.4)" }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ border: "1.5px solid rgba(90, 90, 110, 0.6)" }}
            />
            <span className="text-[10px] text-[#a0a0b0] truncate">{opt.label}</span>
          </div>
        ))}
        {options.length > 3 && (
          <p className="text-[9px] text-[#4a4a5a] text-center pt-0.5">+{options.length - 3} more</p>
        )}
        {options.length === 0 && (
          <p className="text-[9px] text-[#4a4a5a] italic text-center py-1">No options</p>
        )}
      </div>
    </div>
  );
}

function QuestionGroupBody({ node }: { node: FlowNode }) {
  return (
    <div className="space-y-1.5">
      {node.fields.map((field) => (
        <div key={field.id} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[12px] text-[#4a4a5a]">
            {getFieldIcon(field.fieldType)}
          </span>
          <span className="text-[11px] text-[#a0a0b0]">{field.label}</span>
          {field.required && <span className="text-[8px] text-[#ff6b6b]">*</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getHeaderBg(type: FlowNode["type"]): string {
  switch (type) {
    case "welcome": return "rgba(129, 140, 248, 0.04)";
    case "success": return "rgba(34, 197, 94, 0.04)";
    case "choice": return "rgba(247, 189, 62, 0.04)";
    default: return "rgba(20, 20, 24, 1)";
  }
}

function getIconBg(type: FlowNode["type"]): string {
  switch (type) {
    case "welcome": return "rgba(129, 140, 248, 0.12)";
    case "success": return "rgba(34, 197, 94, 0.12)";
    case "choice": return "rgba(247, 189, 62, 0.12)";
    default: return "rgba(189, 194, 255, 0.08)";
  }
}

function getIconColor(type: FlowNode["type"]): string {
  switch (type) {
    case "welcome": return "#818cf8";
    case "success": return "#22c55e";
    case "choice": return "#f7bd3e";
    default: return "#bdc2ff";
  }
}

function getNodeIcon(type: FlowNode["type"]): string {
  switch (type) {
    case "welcome": return "play_arrow";
    case "success": return "check_circle";
    case "choice": return "rule";
    case "question": return "edit_note";
    case "question_group": return "layers";
    default: return "help";
  }
}

function getNodeTypeLabel(type: FlowNode["type"]): string {
  switch (type) {
    case "welcome": return "Start";
    case "success": return "End";
    case "choice": return "Choice";
    case "question": return "Input";
    case "question_group": return "Group";
    default: return "Node";
  }
}

function getFieldPlaceholder(fieldType: string): string {
  switch (fieldType) {
    case "short_text": return "Text input...";
    case "long_text": return "Paragraph...";
    case "email": return "email@example.com";
    case "number": return "123";
    case "rating": return "★ ★ ★ ★ ★";
    case "date": return "Pick a date";
    case "checkbox": return "Yes / No";
    default: return "...";
  }
}

function getFieldIcon(fieldType: string): string {
  switch (fieldType) {
    case "short_text": return "short_text";
    case "long_text": return "notes";
    case "email": return "mail";
    case "number": return "tag";
    case "single_select": return "radio_button_checked";
    case "multi_select": return "checklist";
    case "rating": return "star";
    case "checkbox": return "check_box";
    case "date": return "calendar_today";
    default: return "help";
  }
}
