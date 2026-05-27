"use client";

import type { FlowNode, FlowConnection } from "./types";
import { NODE_WIDTH } from "./types";

interface FlowConnectionsProps {
  nodes: FlowNode[];
  connections: FlowConnection[];
  hoveredNodeId: string | null;
}

/**
 * Renders clean SVG curved connections between nodes.
 * Subtle, consistent with the dark UI — no flashy animations.
 */
export function FlowConnections({ nodes, connections, hoveredNodeId }: FlowConnectionsProps) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="conn-gradient-default" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#353540" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#353540" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="conn-gradient-active" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {connections.map((conn) => {
        const fromNode = nodeMap.get(conn.from);
        const toNode = nodeMap.get(conn.to);
        if (!fromNode || !toNode) return null;

        const isActive = hoveredNodeId === conn.from || hoveredNodeId === conn.to;

        // Connection points: bottom-center of source → top-center of target
        const fromX = fromNode.x + NODE_WIDTH / 2;
        const fromY = fromNode.y + getNodeHeight(fromNode) + 5;
        const toX = toNode.x + NODE_WIDTH / 2;
        const toY = toNode.y - 5;

        // Smooth bezier with vertical bias
        const distance = Math.abs(toY - fromY);
        const curvature = Math.min(distance * 0.4, 60);
        const path = `M ${fromX} ${fromY} C ${fromX} ${fromY + curvature}, ${toX} ${toY - curvature}, ${toX} ${toY}`;

        return (
          <g key={conn.id}>
            {/* Invisible wider path for easier hover detection */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={16}
              className="pointer-events-auto"
            />
            {/* Main connection line */}
            <path
              d={path}
              fill="none"
              stroke={isActive ? "url(#conn-gradient-active)" : "url(#conn-gradient-default)"}
              strokeWidth={isActive ? 2 : 1.5}
              strokeLinecap="round"
              style={{
                transition: "stroke-width 0.15s ease",
              }}
            />
            {/* Small chevron arrow at target */}
            <ChevronArrow x={toX} y={toY} isActive={isActive} />
          </g>
        );
      })}
    </svg>
  );
}

function ChevronArrow({ x, y, isActive }: { x: number; y: number; isActive: boolean }) {
  return (
    <path
      d={`M ${x - 4} ${y - 6} L ${x} ${y - 2} L ${x + 4} ${y - 6}`}
      fill="none"
      stroke={isActive ? "#818cf8" : "#353540"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        opacity: isActive ? 0.9 : 0.6,
        transition: "stroke 0.15s ease, opacity 0.15s ease",
      }}
    />
  );
}

/**
 * Estimate node height based on content type.
 */
function getNodeHeight(node: FlowNode): number {
  const headerHeight = 32;
  const bodyPadding = 24;

  switch (node.type) {
    case "welcome":
    case "success":
      return headerHeight + bodyPadding + 52;
    case "choice": {
      const optCount = Math.min(node.fields[0]?.options?.length ?? 0, 3);
      return headerHeight + bodyPadding + 28 + optCount * 28 + (optCount === 0 ? 20 : 0);
    }
    case "question":
      return headerHeight + bodyPadding + 48;
    case "question_group":
      return headerHeight + bodyPadding + node.fields.length * 24;
    default:
      return headerHeight + bodyPadding + 36;
  }
}
