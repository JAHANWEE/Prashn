"use client";

import { useUser } from "@clerk/nextjs";
import { trpc } from "~/trpc/client";
import {
  DashboardHeader,
  DashboardMetrics,
  DashboardFormCards,
  DashboardRightPanel,
} from "~/components/dashboard";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <>
      <DashboardHeader />

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Page heading */}
        <section>
          <h1
            className="text-[30px] font-semibold text-[#e4e1eb]"
            style={{
              fontFamily: "var(--font-geist-sans)",
              lineHeight: "38px",
              letterSpacing: "-0.02em",
            }}
          >
            {user ? `Welcome back, ${user.firstName ?? "Creator"}` : "Workspace"}
          </h1>
          <p
            className="text-base text-[#c6c5d5] mt-1"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            Create, publish, and analyze visual form flows.
          </p>
        </section>

        {/* Metrics */}
        <DashboardMetrics />

        {/* Main content + right panel */}
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardFormCards />
          <DashboardRightPanel />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-[#454653] bg-[#1b1b22] flex flex-col items-center gap-2 mt-8">
        <div className="text-[13px] font-black text-[#c6c5d5]">CanvasForms</div>
        <div className="flex gap-4">
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-opacity">
            Privacy
          </a>
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-opacity">
            Terms
          </a>
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-opacity">
            Support
          </a>
        </div>
        <p className="text-[11px] text-[#c6c5d5] opacity-70">
          Built with CanvasForms © 2024
        </p>
      </footer>
    </>
  );
}
