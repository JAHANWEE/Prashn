"use client";

import { cn } from "~/lib/utils";

/** Animated SVG connector paths between canvas nodes */
function ConnectorLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="cf-connector-line"
        d="M 120,200 Q 200,200 240,150"
        fill="none"
        stroke="#454653"
        strokeWidth="2"
      />
      <path
        className="cf-connector-line"
        d="M 400,150 Q 450,150 480,220"
        fill="none"
        stroke="#454653"
        strokeWidth="2"
      />
      <path
        className="cf-connector-line"
        d="M 640,220 Q 700,220 740,180"
        fill="none"
        stroke="#454653"
        strokeWidth="2"
      />
      <path
        className="cf-connector-line"
        d="M 900,180 Q 950,180 980,250"
        fill="none"
        stroke="#454653"
        strokeWidth="2"
      />
    </svg>
  );
}

/** A single canvas node card */
function CanvasNode({
  label,
  icon,
  active = false,
  offsetY = 0,
  children,
}: {
  label: string;
  icon: string;
  active?: boolean;
  offsetY?: number;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-48 rounded cf-node-shadow flex flex-col pointer-events-auto",
        active
          ? "border-2 border-[#bdc2ff] bg-[#292930]"
          : "border border-[#454653] bg-[#292930]",
      )}
      style={{ transform: `translateY(${offsetY}px)` }}
    >
      {/* Node header */}
      <div
        className={cn(
          "px-2 py-1 border-b flex items-center justify-between",
          active
            ? "bg-[#bdc2ff]/10 border-[#bdc2ff]/20"
            : "bg-[#1f1f26] border-[#454653]",
        )}
      >
        <span
          className={cn(
            "text-[10px] uppercase tracking-wider font-medium",
            active ? "text-[#bdc2ff]" : "text-[#c6c5d5]",
          )}
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {label}
        </span>
        <span
          className={cn(
            "material-symbols-outlined text-[14px]",
            active ? "text-[#bdc2ff]" : "text-[#908f9e]",
          )}
        >
          {icon}
        </span>
      </div>
      {/* Node body */}
      <div className="p-2 flex flex-col gap-1">{children}</div>
    </div>
  );
}

export function LandingHero() {
  return (
    <main className="pt-32 pb-8 px-6">
      {/* Headline + CTA */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <h1
          className="text-4xl md:text-7xl font-semibold tracking-tight mb-4 text-[#e4e1eb]"
          style={{
            fontFamily: "var(--font-geist-sans)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Design forms like{" "}
          <span className="italic text-[#bdc2ff]">flows</span>.
        </h1>
        <p
          className="text-base leading-relaxed max-w-2xl mx-auto mb-8 text-[#c6c5d5]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Build dynamic forms on an infinite canvas, then publish them as clean
          finite screens your users can actually complete.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/register"
            className="text-xs font-medium tracking-widest px-8 py-3 rounded shadow-sm transition-all w-full sm:w-auto active:scale-95 bg-[#bdc2ff] text-[#131e8c] hover:bg-[#818cf8] text-center"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            GET STARTED
          </a>
          <a
            href="/dashboard/templates"
            className="text-xs font-medium tracking-widest px-8 py-3 rounded transition-all w-full sm:w-auto border border-[#454653] bg-[#1b1b22] text-[#c6c5d5] hover:bg-[#1f1f26] text-center"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            EXPLORE TEMPLATES
          </a>
        </div>
      </div>

      {/* Hero Visual: Infinite Canvas Mockup */}
      <div className="max-w-6xl mx-auto mt-8 relative">
        <div
          className="border border-[#454653] rounded-2xl overflow-hidden aspect-video cf-canvas-grid-bg relative group bg-[#0d0e14]"
          style={{ boxShadow: "0 0 80px rgba(0,0,0,0.5)" }}
        >
          {/* Canvas toolbar */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="border border-[#454653] rounded p-1 shadow-lg flex flex-col gap-1 bg-[#292930]">
              {[
                { icon: "add", active: false },
                { icon: "near_me", active: true },
                { icon: "pan_tool", active: false },
              ].map(({ icon, active }) => (
                <button
                  key={icon}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded transition-colors",
                    active
                      ? "text-[#bdc2ff] bg-[#bdc2ff]/10"
                      : "text-[#c6c5d5] hover:bg-[#1f1f26] hover:text-[#bdc2ff]",
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </button>
              ))}
              <div className="h-px mx-1 bg-[#454653]" />
              <button className="w-8 h-8 flex items-center justify-center rounded transition-colors text-[#c6c5d5] hover:bg-[#1f1f26] hover:text-[#bdc2ff]">
                <span className="material-symbols-outlined text-[20px]">zoom_in</span>
              </button>
            </div>
          </div>

          {/* Canvas nodes */}
          <div className="absolute inset-0 flex items-center justify-around px-8 pointer-events-none scale-75 md:scale-90 lg:scale-100">
            <ConnectorLines />

            {/* Node 1 — Welcome */}
            <CanvasNode label="Welcome" icon="drag_indicator">
              <div className="h-2 w-3/4 rounded bg-[#454653]/30" />
              <div className="h-2 w-1/2 rounded bg-[#454653]/30" />
            </CanvasNode>

            {/* Node 2 — Identity (active) */}
            <CanvasNode label="Identity" icon="check_circle" active offsetY={-40}>
              <div className="h-6 w-full border border-[#454653] rounded flex items-center px-2 bg-[#0d0e14]">
                <span
                  className="text-[10px] text-[#908f9e]"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  Full Name
                </span>
              </div>
              <div className="h-6 w-full border border-[#454653] rounded flex items-center px-2 bg-[#0d0e14]">
                <span
                  className="text-[10px] text-[#908f9e]"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  Email Address
                </span>
              </div>
            </CanvasNode>

            {/* Node 3 — Plans */}
            <CanvasNode label="Plans" icon="list" offsetY={40}>
              <div className="h-4 w-full rounded bg-[#bdc2ff]/20" />
              <div className="h-4 w-full rounded bg-[#1b1b22]" />
            </CanvasNode>

            {/* Node 4 — Success */}
            <CanvasNode label="Success" icon="celebration">
              <div className="text-center py-1">
                <span className="material-symbols-outlined text-[32px] text-[#bdc2ff]">
                  task_alt
                </span>
              </div>
            </CanvasNode>
          </div>
        </div>

        {/* Floating "Live Preview" badge */}
        <div className="absolute -bottom-6 -right-6 border border-[#454653] p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-xs animate-pulse md:animate-none bg-[#292930]">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#818cf8]">
            <span className="material-symbols-outlined text-[#101b8a]">publish</span>
          </div>
          <div>
            <p
              className="text-xs font-medium text-[#e4e1eb]"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              Live Preview
            </p>
            <p
              className="text-[10px] text-[#c6c5d5]"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              Updated just now
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
