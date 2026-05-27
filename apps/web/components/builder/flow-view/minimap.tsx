"use client";

import type { FlowNode, CanvasTransform } from "./types";
import { NODE_WIDTH } from "./types";

interface MinimapProps {
  nodes: FlowNode[];
  transform: CanvasTransform;
  canvasWidth: number;
  canvasHeight: number;
}

const MINIMAP_WIDTH = 140;
const MINIMAP_HEIGHT = 90;

export function Minimap({ nodes, transform, canvasWidth, canvasHeight }: MinimapProps) {
  if (nodes.length === 0) return null;

  // Calculate bounds
  const minX = Math.min(...nodes.map((n) => n.x));
  const maxX = Math.max(...nodes.map((n) => n.x + NODE_WIDTH));
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxY = Math.max(...nodes.map((n) => n.y + 80));

  const contentWidth = Math.max(maxX - minX + 160, 300);
  const contentHeight = Math.max(maxY - minY + 160, 300);

  const scaleX = MINIMAP_WIDTH / contentWidth;
  const scaleY = MINIMAP_HEIGHT / contentHeight;
  const scale = Math.min(scaleX, scaleY);

  // Viewport rectangle
  const vpWidth = (canvasWidth / transform.scale) * scale;
  const vpHeight = (canvasHeight / transform.scale) * scale;
  const vpX = ((-transform.x / transform.scale) - minX + 80) * scale;
  const vpY = ((-transform.y / transform.scale) - minY + 80) * scale;

  return (
    <div
      className="absolute bottom-5 right-5 z-40 overflow-hidden"
      style={{
        background: "rgba(13, 14, 20, 0.75)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(53, 53, 64, 0.4)",
        borderRadius: "10px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",
      }}
    >
      <svg width={MINIMAP_WIDTH} height={MINIMAP_HEIGHT}>
        {/* Connection lines (simplified) */}
        {nodes.slice(0, -1).map((node, i) => {
          const next = nodes[i + 1];
          if (!next) return null;
          const x1 = (node.x - minX + 80) * scale + (NODE_WIDTH * scale) / 2;
          const y1 = (node.y - minY + 80) * scale + 5;
          const x2 = (next.x - minX + 80) * scale + (NODE_WIDTH * scale) / 2;
          const y2 = (next.y - minY + 80) * scale;
          return (
            <line
              key={`line-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(53, 53, 64, 0.5)"
              strokeWidth={0.8}
            />
          );
        })}
        {/* Node indicators */}
        {nodes.map((node) => (
          <rect
            key={node.id}
            x={(node.x - minX + 80) * scale}
            y={(node.y - minY + 80) * scale}
            width={Math.max(NODE_WIDTH * scale, 4)}
            height={8}
            rx={1.5}
            fill={getMinimapColor(node.type)}
            opacity={0.7}
          />
        ))}
        {/* Viewport */}
        <rect
          x={vpX}
          y={vpY}
          width={Math.max(vpWidth, 8)}
          height={Math.max(vpHeight, 8)}
          fill="rgba(129, 140, 248, 0.04)"
          stroke="rgba(129, 140, 248, 0.4)"
          strokeWidth={1}
          rx={2}
        />
      </svg>
    </div>
  );
}

function getMinimapColor(type: string): string {
  switch (type) {
    case "welcome": return "rgba(129, 140, 248, 0.7)";
    case "success": return "rgba(34, 197, 94, 0.7)";
    case "choice": return "rgba(247, 189, 62, 0.7)";
    default: return "rgba(90, 90, 110, 0.6)";
  }
}
