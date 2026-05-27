"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFlowData } from "./use-flow-data";
import type { FlowNode } from "./types";
import { trpc } from "~/trpc/client";

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

interface Pos { x: number; y: number; }
interface Connection { from: string; to: string; }

const CARD_W = 380;
const CARD_H = 90;
const SNAP_DIST = 250;
const DEFAULT_GAP = 140;

export function FlowCanvas({
  fields, formTitle, formId, onAddField, onDeleteField, onSelectField, selectedFieldId,
}: FlowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { nodes } = useFlowData(fields, formTitle);

  // Persist positions & connections in localStorage keyed by formId
  const storageKey = `flow-positions-${formId}`;
  const connStorageKey = `flow-connections-${formId}`;

  const [cam, setCam] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Pos>({ x: 0, y: 0 });
  const [positions, setPositions] = useState<Map<string, Pos>>(() => {
    if (typeof window === "undefined") return new Map();
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return new Map(JSON.parse(stored));
    } catch {}
    return new Map();
  });
  const [connections, setConnections] = useState<Connection[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(connStorageKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Pos>({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectingMouse, setConnectingMouse] = useState<Pos>({ x: 0, y: 0 });
  const [fitted, setFitted] = useState(false);

  const reorderFields = trpc.fields.reorder.useMutation();
  const utils = trpc.useUtils();

  // Save positions to localStorage whenever they change
  useEffect(() => {
    if (positions.size > 0) {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(positions.entries())));
    }
  }, [positions, storageKey]);

  // Save connections to localStorage whenever they change
  useEffect(() => {
    if (connections.length > 0) {
      localStorage.setItem(connStorageKey, JSON.stringify(connections));
    }
  }, [connections, connStorageKey]);

  // Init positions for NEW nodes only — never overwrite existing positions
  useEffect(() => {
    // Don't run cleanup until fields are actually loaded
    const fieldsLoaded = fields && fields.length > 0;

    setPositions(prev => {
      const next = new Map(prev);
      let changed = false;
      nodes.forEach((node) => {
        if (!next.has(node.id)) {
          // Place new nodes below the last existing node
          const allY = Array.from(next.values()).map(p => p.y);
          const maxY = allY.length > 0 ? Math.max(...allY) : -DEFAULT_GAP;
          next.set(node.id, { x: 0, y: maxY + DEFAULT_GAP });
          changed = true;
        }
      });
      // Only remove stale nodes if fields are loaded (avoid wiping on initial render)
      if (fieldsLoaded) {
        for (const key of next.keys()) {
          if (!nodes.find(n => n.id === key)) { next.delete(key); changed = true; }
        }
      }
      return changed ? next : prev;
    });
    // Build default linear connections only on first load
    setConnections(prev => {
      if (prev.length > 0) return prev;
      const conns: Connection[] = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        conns.push({ from: nodes[i]!.id, to: nodes[i + 1]!.id });
      }
      return conns;
    });
  }, [nodes, fields]);

  // Fit view once
  useEffect(() => {
    if (!fitted && nodes.length > 0 && containerRef.current) {
      const t = setTimeout(() => { fitView(); setFitted(true); }, 100);
      return () => clearTimeout(t);
    }
  }, [nodes.length, fitted]);

  // ─── Pan ─────────────────────────────────────────────────────────
  const onCanvasDown = useCallback((e: React.PointerEvent) => {
    if (e.target === e.currentTarget || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - cam.x, y: e.clientY - cam.y });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [cam.x, cam.y]);

  const onCanvasMove = useCallback((e: React.PointerEvent) => {
    if (isPanning) setCam(c => ({ ...c, x: e.clientX - panStart.x, y: e.clientY - panStart.y }));
    if (dragId) {
      const nx = (e.clientX - dragOffset.x - cam.x) / cam.zoom;
      const ny = (e.clientY - dragOffset.y - cam.y) / cam.zoom;
      setPositions(prev => { const n = new Map(prev); n.set(dragId, { x: nx, y: ny }); return n; });
    }
    if (connectingFrom) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setConnectingMouse({
          x: (e.clientX - rect.left - cam.x) / cam.zoom,
          y: (e.clientY - rect.top - cam.y) / cam.zoom,
        });
      }
    }
  }, [isPanning, panStart, dragId, dragOffset, cam, connectingFrom]);

  const onCanvasUp = useCallback((e: React.PointerEvent) => {
    if (isPanning) { setIsPanning(false); try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {} }
    if (dragId) {
      const pos = positions.get(dragId);
      if (pos) {
        // Break connections that are too stretched
        let newConns = connections.filter(c => {
          if (c.from !== dragId && c.to !== dragId) return true;
          const otherId = c.from === dragId ? c.to : c.from;
          const otherPos = positions.get(otherId);
          if (!otherPos) return false;
          const dist = Math.sqrt((pos.x - otherPos.x) ** 2 + (pos.y - otherPos.y) ** 2);
          return dist < SNAP_DIST * 2.5;
        });

        // Auto-connect: find closest node ABOVE (becomes parent → connects TO this node)
        let closestAbove: { id: string; dist: number } | null = null;
        let closestBelow: { id: string; dist: number } | null = null;

        for (const [id, p] of positions.entries()) {
          if (id === dragId) continue;
          const dx = Math.abs((p.x + CARD_W / 2) - (pos.x + CARD_W / 2));
          if (dx > CARD_W) continue; // too far horizontally

          // Above: other node's bottom is above this node's top
          const otherBottom = p.y + CARD_H;
          if (otherBottom <= pos.y && pos.y - otherBottom < SNAP_DIST) {
            const dist = pos.y - otherBottom + dx * 0.5;
            if (!closestAbove || dist < closestAbove.dist) closestAbove = { id, dist };
          }

          // Below: other node's top is below this node's bottom
          const thisBottom = pos.y + CARD_H;
          if (p.y >= thisBottom && p.y - thisBottom < SNAP_DIST) {
            const dist = p.y - thisBottom + dx * 0.5;
            if (!closestBelow || dist < closestBelow.dist) closestBelow = { id, dist };
          }
        }

        // Add auto-connections if not already connected
        if (closestAbove) {
          const alreadyConnected = newConns.some(c => c.from === closestAbove!.id && c.to === dragId);
          if (!alreadyConnected) {
            // Remove any existing connection TO dragId from others (one parent only)
            newConns = newConns.filter(c => c.to !== dragId);
            newConns.push({ from: closestAbove.id, to: dragId });
          }
        }
        if (closestBelow) {
          const alreadyConnected = newConns.some(c => c.from === dragId && c.to === closestBelow!.id);
          if (!alreadyConnected) {
            // Remove any existing connection FROM dragId to others (one child only)
            newConns = newConns.filter(c => c.from !== dragId);
            newConns.push({ from: dragId, to: closestBelow.id });
          }
        }

        setConnections(newConns);
      }
      setDragId(null);
    }
    if (connectingFrom) {
      // Check if mouse is over a node to connect
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mx = (e.clientX - rect.left - cam.x) / cam.zoom;
        const my = (e.clientY - rect.top - cam.y) / cam.zoom;
        let targetId: string | null = null;
        for (const [id, p] of positions.entries()) {
          if (id === connectingFrom) continue;
          if (mx >= p.x && mx <= p.x + CARD_W && my >= p.y && my <= p.y + CARD_H) {
            targetId = id; break;
          }
        }
        if (targetId) {
          // Add connection (avoid duplicates)
          setConnections(prev => {
            const exists = prev.some(c => c.from === connectingFrom && c.to === targetId);
            if (exists) return prev;
            // Remove any existing outgoing from connectingFrom
            const filtered = prev.filter(c => c.from !== connectingFrom);
            return [...filtered, { from: connectingFrom!, to: targetId! }];
          });
        }
      }
      setConnectingFrom(null);
    }
  }, [isPanning, dragId, positions, connections, connectingFrom, cam]);

  // ─── Zoom ───────────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const f = e.deltaY > 0 ? 0.92 : 1.08;
    setCam(c => {
      const nz = Math.min(2.5, Math.max(0.3, c.zoom * f));
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { ...c, zoom: nz };
      const mx = e.clientX - rect.left; const my = e.clientY - rect.top;
      const r = nz / c.zoom;
      return { zoom: nz, x: mx - (mx - c.x) * r, y: my - (my - c.y) * r };
    });
  }, []);

  // ─── Node Drag ──────────────────────────────────────────────────
  const startDrag = useCallback((id: string, e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    const pos = positions.get(id) ?? { x: 0, y: 0 };
    setDragId(id);
    setDragOffset({ x: e.clientX - (pos.x * cam.zoom + cam.x), y: e.clientY - (pos.y * cam.zoom + cam.y) });
  }, [positions, cam]);

  // ─── Start connecting from bottom port ──────────────────────────
  const startConnect = useCallback((fromId: string, e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    setConnectingFrom(fromId);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setConnectingMouse({ x: (e.clientX - rect.left - cam.x) / cam.zoom, y: (e.clientY - rect.top - cam.y) / cam.zoom });
    }
  }, [cam]);

  // ─── Fit View ───────────────────────────────────────────────────
  const fitView = () => {
    if (!containerRef.current || positions.size === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const all = Array.from(positions.values());
    const minX = Math.min(...all.map(p => p.x)); const maxX = Math.max(...all.map(p => p.x + CARD_W));
    const minY = Math.min(...all.map(p => p.y)); const maxY = Math.max(...all.map(p => p.y + CARD_H));
    const pad = 100;
    const zoom = Math.min((rect.width - pad * 2) / Math.max(maxX - minX, 1), (rect.height - pad * 2) / Math.max(maxY - minY, 1), 1.2);
    setCam({ zoom, x: rect.width / 2 - ((minX + maxX) / 2) * zoom, y: rect.height / 2 - ((minY + maxY) / 2) * zoom });
  };

  // ─── Render ─────────────────────────────────────────────────────
  const gridSize = 24 * cam.zoom;

  return (
    <main
      ref={containerRef}
      className="flex-1 relative overflow-hidden"
      style={{
        backgroundColor: "#0a0a0f",
        backgroundImage: "radial-gradient(circle, #2d2d3a 1px, transparent 1px)",
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${cam.x % gridSize}px ${cam.y % gridSize}px`,
        cursor: isPanning ? "grabbing" : connectingFrom ? "crosshair" : dragId ? "grabbing" : "grab",
      }}
      onPointerDown={onCanvasDown}
      onPointerMove={onCanvasMove}
      onPointerUp={onCanvasUp}
      onWheel={onWheel}
      onClick={() => { onSelectField(null); }}
    >
      <div className="absolute inset-0 origin-top-left pointer-events-none" style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.zoom})`, willChange: "transform" }}>
        {/* SVG Connections (strings) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
          {connections.map((conn, i) => {
            const fromPos = positions.get(conn.from);
            const toPos = positions.get(conn.to);
            if (!fromPos || !toPos) return null;
            const x1 = fromPos.x + CARD_W / 2; const y1 = fromPos.y + CARD_H;
            const x2 = toPos.x + CARD_W / 2; const y2 = toPos.y;
            const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const tension = Math.min(dist * 0.4, 80);
            const path = `M ${x1} ${y1} C ${x1} ${y1 + tension}, ${x2} ${y2 - tension}, ${x2} ${y2}`;
            const color = getLineColor(nodes.find(n => n.id === conn.from));
            const isStretched = dist > SNAP_DIST * 2;
            return (
              <g key={`${conn.from}-${conn.to}`}>
                <path d={path} fill="none" stroke={color} strokeWidth={isStretched ? 1.5 : 2} strokeDasharray={isStretched ? "8 6" : "none"} opacity={isStretched ? 0.35 : 0.7} />
                {!isStretched && <circle cx={(x1+x2)/2} cy={(y1+y2)/2} r={4} fill={color} opacity={0.8}><animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></circle>}
              </g>
            );
          })}
          {/* Live connecting line */}
          {connectingFrom && (() => {
            const fromPos = positions.get(connectingFrom);
            if (!fromPos) return null;
            const x1 = fromPos.x + CARD_W / 2; const y1 = fromPos.y + CARD_H;
            return <line x1={x1} y1={y1} x2={connectingMouse.x} y2={connectingMouse.y} stroke="#6366f1" strokeWidth={2} strokeDasharray="6 4" opacity={0.8} />;
          })()}
        </svg>

        {/* Node cards */}
        {nodes.map(node => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const isSynthetic = node.id === "__welcome__" || node.id === "__success__";
          const isDragging = dragId === node.id;
          const isSelected = selectedFieldId === node.id;
          return (
            <div key={node.id} className="absolute pointer-events-auto" style={{ left: pos.x, top: pos.y, width: CARD_W, zIndex: isDragging ? 100 : isSelected ? 50 : 10, transform: isDragging ? "scale(1.03) rotate(0.8deg)" : "none", filter: isDragging ? "drop-shadow(0 16px 40px rgba(0,0,0,0.6))" : "none", transition: isDragging ? "none" : "transform 0.15s ease, filter 0.15s ease" }}>
              <div
                className={`rounded-xl p-4 shadow-2xl relative cursor-grab active:cursor-grabbing ${isSelected ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-[#0a0a0f]" : ""}`}
                style={{ background: getNodeBg(node), border: `1px solid ${getNodeBorder(node)}` }}
                onClick={(e) => { e.stopPropagation(); if (!isSynthetic) onSelectField(node.id); }}
                onPointerDown={(e) => startDrag(node.id, e)}
              >
                <NodeContent node={node} onDelete={!isSynthetic ? () => onDeleteField(node.id) : undefined} />
              </div>
              {/* Bottom port — drag to connect */}
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 cursor-crosshair pointer-events-auto z-50 transition-all hover:scale-125"
                style={{ borderColor: getNodeBorder(node), background: "#0a0a0f", boxShadow: `0 0 6px ${getLineColor(node)}` }}
                onPointerDown={(e) => startConnect(node.id, e)}
              />
              {/* Top port — visual only */}
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 pointer-events-none"
                style={{ borderColor: getNodeBorder(node), background: "#0a0a0f" }}
              />
            </div>
          );
        })}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#0f111a] border border-[#1e212d] rounded-xl p-3 shadow-2xl">
        <div className="flex items-center space-x-3">
          <button onClick={() => setCam(c => ({ ...c, zoom: Math.max(0.3, c.zoom * 0.8) }))} className="text-gray-500 hover:text-white text-sm">−</button>
          <span className="text-xs font-medium w-10 text-center">{Math.round(cam.zoom * 100)}%</span>
          <button onClick={() => setCam(c => ({ ...c, zoom: Math.min(2.5, c.zoom * 1.25) }))} className="text-gray-500 hover:text-white text-sm">+</button>
          <div className="w-px h-4 bg-[#1e212d]" />
          <button onClick={fitView} className="text-gray-500 hover:text-white text-[10px] uppercase tracking-wider font-bold">Fit</button>
        </div>
      </div>
    </main>
  );
}

// ─── Node Content ────────────────────────────────────────────────────────────

function NodeContent({ node, onDelete }: { node: FlowNode; onDelete?: () => void }) {
  if (node.type === "welcome") return (<div className="flex items-center space-x-4"><div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center text-2xl">👋</div><div><h3 className="font-medium text-sm">{node.label}</h3><p className="text-xs text-gray-500">Start of the form</p></div></div>);
  if (node.type === "success") return (<div className="flex items-center space-x-4"><div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center text-green-500 border border-green-500/30"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg></div><div className="flex-1"><h3 className="font-medium text-sm text-white">{node.label}</h3><p className="text-xs text-gray-500">End of the form</p></div><span className="text-3xl">🎉</span></div>);
  if (node.type === "choice") {
    const field = node.fields[0]; if (!field) return null;
    const opts = field.options ?? [];
    return (<div><div className="flex items-center space-x-4 mb-3"><div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center text-orange-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7"/></svg></div><div className="flex-1"><div className="flex items-center justify-between"><h3 className="font-medium text-sm">{field.label}</h3>{onDelete && <Dots onDelete={onDelete}/>}</div><p className="text-[11px] text-gray-500">{getDesc(field.fieldType)}</p></div></div><div className="flex space-x-2">{opts.slice(0,3).map((o,i)=>(<div key={i} className="flex-1 px-3 py-2 bg-black/40 border border-white/5 rounded-md flex items-center space-x-2 text-[10px] text-gray-400"><div className="w-3 h-3 rounded-full border border-orange-500/50"/><span>{o.label}</span></div>))}</div></div>);
  }
  // question
  const field = node.fields[0]; if (!field) return null;
  const icon = getFieldIcon(field.fieldType);
  return (<div className="flex items-center space-x-4"><div className={`w-12 h-12 rounded-lg ${icon.bg} flex items-center justify-center ${icon.text} font-bold text-lg`}>{icon.content}</div><div className="flex-1"><div className="flex items-center justify-between"><h3 className="font-medium text-sm">{field.label}</h3>{onDelete && <Dots onDelete={onDelete}/>}</div><p className="text-[11px] text-gray-500">{getDesc(field.fieldType)}</p></div></div>);
}

function Dots({ onDelete }: { onDelete: () => void }) {
  return <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-gray-500 hover:text-red-400 p-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/></svg></button>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getNodeBg(n: FlowNode) { switch(n.type){case"welcome":return"#14151f";case"success":return"#0d1a14";case"choice":return"#1a140d";default:return"#0d1421";} }
function getNodeBorder(n: FlowNode) { switch(n.type){case"welcome":return"rgba(99,102,241,0.4)";case"success":return"rgba(34,197,94,0.4)";case"choice":return"rgba(249,115,22,0.4)";default:return"rgba(59,130,246,0.4)";} }
function getLineColor(n?: FlowNode) { if(!n) return "#6366f1"; switch(n.type){case"welcome":return"#6366f1";case"success":return"#22c55e";case"choice":return"#f97316";default:return"#3b82f6";} }
function getFieldIcon(ft:string){switch(ft){case"short_text":return{bg:"bg-indigo-500/20",text:"text-indigo-400",content:"T"};case"long_text":return{bg:"bg-purple-500/20",text:"text-purple-400",content:"¶"};case"email":return{bg:"bg-blue-500/20",text:"text-blue-400",content:"✉"};case"number":return{bg:"bg-orange-500/20",text:"text-orange-400",content:"123"};case"rating":return{bg:"bg-blue-600/20",text:"text-blue-400",content:"★"};case"checkbox":return{bg:"bg-green-500/20",text:"text-green-400",content:"☑"};case"date":return{bg:"bg-pink-500/20",text:"text-pink-400",content:"📅"};default:return{bg:"bg-indigo-500/20",text:"text-indigo-400",content:"T"};}}
function getDesc(ft:string){switch(ft){case"short_text":return"Short text response";case"long_text":return"Paragraph response";case"email":return"Email address";case"number":return"Numeric value";case"rating":return"Star rating";case"single_select":return"Select one option";case"multi_select":return"Select multiple";case"checkbox":return"Yes or no";case"date":return"Date picker";default:return"";}}
