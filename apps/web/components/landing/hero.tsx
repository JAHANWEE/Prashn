"use client";

import { useState, useCallback } from "react";
import { cn } from "~/lib/utils";

interface NodeData {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
  children?: React.ReactNode;
}

const INITIAL_NODES: NodeData[] = [
  { id: "welcome", label: "Welcome", icon: "waving_hand", x: 60, y: 140 },
  { id: "identity", label: "Identity", icon: "person", x: 280, y: 80 },
  { id: "plans", label: "Plans", icon: "list", x: 500, y: 160 },
  { id: "success", label: "Success", icon: "celebration", x: 720, y: 100 },
];

export function LandingHero() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [activeId, setActiveId] = useState<string>("identity");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = useCallback((id: string, e: React.PointerEvent) => {
    e.preventDefault();
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    setDragId(id);
    setActiveId(id);
    const rect = (e.currentTarget as HTMLElement).closest("[data-canvas]")?.getBoundingClientRect();
    if (rect) {
      setDragOffset({ x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y });
    }
  }, [nodes]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragId) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 180, e.clientX - rect.left - dragOffset.x));
    const y = Math.max(0, Math.min(rect.height - 100, e.clientY - rect.top - dragOffset.y));
    setNodes(prev => prev.map(n => n.id === dragId ? { ...n, x, y } : n));
  }, [dragId, dragOffset]);

  const handlePointerUp = useCallback(() => {
    setDragId(null);
  }, []);

  return (
    <main className="pt-32 pb-8 px-6">
      {/* Headline + CTA */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <h1
          className="text-4xl md:text-7xl font-semibold tracking-tight mb-4 text-[#e4e1eb]"
          style={{ fontFamily: "var(--font-geist-sans)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
        >
          Design forms like{" "}
          <span className="italic text-[#fca9d4]">flows</span>.
        </h1>
        <p className="text-base leading-relaxed max-w-2xl mx-auto mb-8 text-[#c6c5d5]" style={{ fontFamily: "var(--font-geist-sans)" }}>
          Build dynamic forms on an infinite canvas, then publish them as clean finite screens your users can actually complete.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/register" className="text-xs font-medium tracking-widest px-8 py-3 rounded shadow-sm transition-all w-full sm:w-auto active:scale-95 bg-[#fca9d4] text-[#0a0a0f] hover:brightness-110 text-center" style={{ fontFamily: "var(--font-geist-mono)" }}>
            GET STARTED
          </a>
          <a href="/explore" className="text-xs font-medium tracking-widest px-8 py-3 rounded transition-all w-full sm:w-auto border border-[#454653] bg-[#1b1b22] text-[#c6c5d5] hover:bg-[#1f1f26] text-center" style={{ fontFamily: "var(--font-geist-mono)" }}>
            EXPLORE FORMS
          </a>
        </div>
      </div>

      {/* Interactive Canvas */}
      <div className="max-w-5xl mx-auto mt-8 relative">
        <div
          data-canvas
          className="border border-[#454653] rounded-2xl overflow-hidden relative bg-[#0d0e14] select-none"
          style={{
            height: 380,
            backgroundImage: "radial-gradient(circle, #2d2d3a 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            boxShadow: "0 0 80px rgba(0,0,0,0.5)",
            cursor: dragId ? "grabbing" : "default",
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Hint */}
          <div className="absolute top-3 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b1b22] border border-[#454653]">
            <span className="material-symbols-outlined text-[12px] text-[#fca9d4]">touch_app</span>
            <span className="text-[9px] text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>Drag the cards</span>
          </div>

          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
            {nodes.slice(0, -1).map((node, i) => {
              const next = nodes[i + 1]!;
              const x1 = node.x + 90;
              const y1 = node.y + 40;
              const x2 = next.x;
              const y2 = next.y + 40;
              const midX = (x1 + x2) / 2;
              return (
                <path
                  key={`conn-${i}`}
                  d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={activeId === node.id || activeId === next.id ? "#fca9d4" : "#454653"}
                  strokeWidth={activeId === node.id || activeId === next.id ? 2 : 1.5}
                  strokeDasharray={activeId === node.id || activeId === next.id ? "none" : "4 4"}
                  opacity={activeId === node.id || activeId === next.id ? 0.8 : 0.5}
                  style={{ transition: "stroke 0.2s, opacity 0.2s" }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const isActive = activeId === node.id;
            return (
              <div
                key={node.id}
                className="absolute"
                style={{
                  left: node.x,
                  top: node.y,
                  width: 180,
                  zIndex: dragId === node.id ? 50 : isActive ? 20 : 10,
                  transform: dragId === node.id ? "scale(1.05)" : "none",
                  transition: dragId === node.id ? "none" : "transform 0.15s ease",
                  cursor: "grab",
                }}
                onPointerDown={(e) => handlePointerDown(node.id, e)}
                onClick={() => setActiveId(node.id)}
              >
                <div
                  className={cn(
                    "rounded-xl overflow-hidden shadow-xl",
                    isActive ? "ring-2 ring-[#fca9d4] ring-offset-1 ring-offset-[#0d0e14]" : "",
                  )}
                  style={{
                    background: "#14151f",
                    border: `1px solid ${isActive ? "rgba(252,169,212,0.5)" : "#454653"}`,
                  }}
                >
                  {/* Header */}
                  <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: isActive ? "rgba(252,169,212,0.06)" : "#1b1b22" }}>
                    <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: isActive ? "#fca9d4" : "#908f9e", fontFamily: "var(--font-geist-mono)" }}>
                      {node.label}
                    </span>
                    <span className="material-symbols-outlined text-[14px]" style={{ color: isActive ? "#fca9d4" : "#5a5a6e" }}>
                      {node.icon}
                    </span>
                  </div>
                  {/* Body */}
                  <div className="px-3 py-2">
                    <NodeBody id={node.id} active={isActive} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating badge */}
        <div className="absolute -bottom-5 -right-4 border border-[#454653] p-3 rounded-xl shadow-2xl flex items-center gap-3 bg-[#292930]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#fca9d4]">
            <span className="material-symbols-outlined text-[16px] text-[#0a0a0f]">publish</span>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#e4e1eb]" style={{ fontFamily: "var(--font-geist-mono)" }}>Live Preview</p>
            <p className="text-[9px] text-[#908f9e]">Updated just now</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function NodeBody({ id, active }: { id: string; active: boolean }) {
  switch (id) {
    case "welcome":
      return (
        <div className="space-y-1">
          <div className="h-2 w-3/4 rounded bg-[#454653]/40" />
          <div className="h-2 w-1/2 rounded bg-[#454653]/30" />
        </div>
      );
    case "identity":
      return (
        <div className="space-y-1.5">
          <div className="h-5 w-full border border-[#353540] rounded flex items-center px-2 bg-[#0d0e14]">
            <span className="text-[9px] text-[#5a5a6e]" style={{ fontFamily: "var(--font-geist-mono)" }}>Full Name</span>
          </div>
          <div className="h-5 w-full border border-[#353540] rounded flex items-center px-2 bg-[#0d0e14]">
            <span className="text-[9px] text-[#5a5a6e]" style={{ fontFamily: "var(--font-geist-mono)" }}>Email</span>
          </div>
        </div>
      );
    case "plans":
      return (
        <div className="space-y-1">
          <div className="h-4 w-full rounded bg-[#fca9d4]/15 border border-[#fca9d4]/20 flex items-center px-2">
            <span className="text-[8px] text-[#fca9d4]">Pro</span>
          </div>
          <div className="h-4 w-full rounded bg-[#1b1b22] border border-[#353540] flex items-center px-2">
            <span className="text-[8px] text-[#5a5a6e]">Free</span>
          </div>
        </div>
      );
    case "success":
      return (
        <div className="text-center py-1">
          <span className="material-symbols-outlined text-[24px] text-[#22c55e]">task_alt</span>
        </div>
      );
    default:
      return null;
  }
}
