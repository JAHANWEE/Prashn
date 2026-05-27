"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FlowNode, CanvasTransform } from "./types";
import { NODE_WIDTH, NODE_GAP_Y } from "./types";
import { FlowNodeCard } from "./flow-node-card";
import { FlowConnections } from "./flow-connections";
import { FlowToolbar } from "./flow-toolbar";
import { Minimap } from "./minimap";
import { useFlowData } from "./use-flow-data";

interface Field {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
  position: number;
  options?: unknown;
  [key: string]: unknown;
}

interface FlowCanvasProps {
  fields: Field[] | undefined;
  formTitle?: string;
  formId: string;
  onAddField: (fieldType: string) => void;
  onDeleteField: (fieldId: string) => void;
  onSelectField: (fieldId: string | null) => void;
  selectedFieldId: string | null;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_SENSITIVITY = 0.001;

export function FlowCanvas({
  fields,
  formTitle,
  formId,
  onAddField,
  onDeleteField,
  onSelectField,
  selectedFieldId,
}: FlowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 0.85 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [hasFitted, setHasFitted] = useState(false);

  // Convert fields to flow data
  const { nodes: baseNodes, connections } = useFlowData(fields, formTitle);

  // Local node positions (for dragging)
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  // Sync base nodes into positions when they change
  useEffect(() => {
    setNodePositions((prev) => {
      const next = new Map(prev);
      baseNodes.forEach((node) => {
        if (!next.has(node.id)) {
          next.set(node.id, { x: node.x, y: node.y });
        }
      });
      // Remove stale nodes
      for (const key of next.keys()) {
        if (!baseNodes.find((n) => n.id === key)) {
          next.delete(key);
        }
      }
      return next;
    });
  }, [baseNodes]);

  // Merge positions into nodes
  const nodes: FlowNode[] = baseNodes.map((node) => {
    const pos = nodePositions.get(node.id);
    return pos ? { ...node, x: pos.x, y: pos.y } : node;
  });

  // Measure container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setCanvasSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Initial fit-to-view (once)
  useEffect(() => {
    if (!hasFitted && nodes.length > 0 && containerRef.current) {
      const timer = setTimeout(() => {
        fitView();
        setHasFitted(true);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [nodes.length, hasFitted]);

  // ─── Pan ─────────────────────────────────────────────────────────────────

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && e.target === e.currentTarget)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [transform.x, transform.y]);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanning) {
      setTransform((t) => ({
        ...t,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      }));
    }
    if (draggedNodeId) {
      setNodePositions((prev) => {
        const next = new Map(prev);
        next.set(draggedNodeId, {
          x: (e.clientX - dragOffset.x - transform.x) / transform.scale,
          y: (e.clientY - dragOffset.y - transform.y) / transform.scale,
        });
        return next;
      });
    }
  }, [isPanning, panStart, draggedNodeId, dragOffset, transform]);

  const handleCanvasPointerUp = useCallback((e: React.PointerEvent) => {
    setIsPanning(false);
    setDraggedNodeId(null);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  }, []);

  // ─── Zoom (smooth, toward cursor) ───────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * ZOOM_SENSITIVITY;
    setTransform((t) => {
      const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, t.scale * (1 + delta)));
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { ...t, scale: newScale };
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const ratio = newScale / t.scale;
      return {
        scale: newScale,
        x: cx - (cx - t.x) * ratio,
        y: cy - (cy - t.y) * ratio,
      };
    });
  }, []);

  // ─── Node Drag ───────────────────────────────────────────────────────────

  const handleNodeDragStart = useCallback((nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    const pos = nodePositions.get(nodeId) ?? { x: 0, y: 0 };
    setDraggedNodeId(nodeId);
    setDragOffset({
      x: e.clientX - (pos.x * transform.scale + transform.x),
      y: e.clientY - (pos.y * transform.scale + transform.y),
    });
  }, [nodePositions, transform]);

  // ─── Toolbar Actions ─────────────────────────────────────────────────────

  const zoomIn = () => {
    setTransform((t) => {
      const newScale = Math.min(MAX_ZOOM, t.scale * 1.25);
      const ratio = newScale / t.scale;
      return {
        scale: newScale,
        x: canvasSize.width / 2 - (canvasSize.width / 2 - t.x) * ratio,
        y: canvasSize.height / 2 - (canvasSize.height / 2 - t.y) * ratio,
      };
    });
  };

  const zoomOut = () => {
    setTransform((t) => {
      const newScale = Math.max(MIN_ZOOM, t.scale * 0.8);
      const ratio = newScale / t.scale;
      return {
        scale: newScale,
        x: canvasSize.width / 2 - (canvasSize.width / 2 - t.x) * ratio,
        y: canvasSize.height / 2 - (canvasSize.height / 2 - t.y) * ratio,
      };
    });
  };

  const fitView = () => {
    if (nodes.length === 0 || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const minX = Math.min(...nodes.map((n) => n.x));
    const maxX = Math.max(...nodes.map((n) => n.x + NODE_WIDTH));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y + 100));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const padding = 120;
    const scaleX = (rect.width - padding * 2) / Math.max(contentWidth, 1);
    const scaleY = (rect.height - padding * 2) / Math.max(contentHeight, 1);
    const scale = Math.min(Math.min(scaleX, scaleY), 1.1);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setTransform({
      scale,
      x: rect.width / 2 - centerX * scale,
      y: rect.height / 2 - centerY * scale,
    });
  };

  const autoArrange = () => {
    setNodePositions(() => {
      const next = new Map<string, { x: number; y: number }>();
      baseNodes.forEach((node, idx) => {
        next.set(node.id, { x: 0, y: 60 + idx * NODE_GAP_Y });
      });
      return next;
    });
    setTimeout(fitView, 30);
  };

  const handleAddStep = () => {
    onAddField("short_text");
  };

  const handleCanvasClick = () => {
    onSelectField(null);
  };

  // Grid size that scales with zoom
  const gridSize = 20 * transform.scale;

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden"
      style={{
        background: "#0b0b10",
        backgroundImage: `
          radial-gradient(circle, rgba(40, 40, 52, 0.4) 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${transform.x % gridSize}px ${transform.y % gridSize}px`,
        cursor: isPanning ? "grabbing" : draggedNodeId ? "grabbing" : "grab",
      }}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
    >
      {/* Transformed content layer */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-none"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          willChange: "transform",
        }}
      >
        {/* Connections (behind nodes) */}
        <FlowConnections
          nodes={nodes}
          connections={connections}
          hoveredNodeId={hoveredNodeId}
        />

        {/* Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="pointer-events-auto"
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
          >
            <FlowNodeCard
              node={node}
              isSelected={selectedFieldId === node.id}
              onSelect={() => {
                if (node.id !== "__welcome__" && node.id !== "__success__") {
                  onSelectField(node.id);
                }
              }}
              onDelete={
                node.id !== "__welcome__" && node.id !== "__success__"
                  ? () => onDeleteField(node.id)
                  : undefined
              }
              onDragStart={(e) => handleNodeDragStart(node.id, e)}
            />
          </div>
        ))}
      </div>

      {/* Bottom toolbar */}
      <FlowToolbar
        onAddStep={handleAddStep}
        onAutoArrange={autoArrange}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitView={fitView}
        zoom={transform.scale}
      />

      {/* Minimap */}
      <Minimap
        nodes={nodes}
        transform={transform}
        canvasWidth={canvasSize.width}
        canvasHeight={canvasSize.height}
      />

      {/* Empty state */}
      {(!fields || fields.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: "rgba(129, 140, 248, 0.06)", border: "1px solid rgba(53, 53, 64, 0.4)" }}
            >
              <span className="material-symbols-outlined text-[24px] text-[#4a4a5a]">account_tree</span>
            </div>
            <p className="text-[14px] font-medium text-[#5a5a6e] mb-1" style={{ fontFamily: "var(--font-geist-sans)" }}>
              Your flow starts here
            </p>
            <p className="text-[11px] text-[#3a3a4a]">Add fields from the panel or click + below</p>
          </div>
        </div>
      )}
    </div>
  );
}
