"use client";

import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { CreateFormButton } from "./create-form-button";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
  { icon: "style", label: "Templates", href: "/dashboard/templates" },
  { icon: "analytics", label: "Responses", href: "/dashboard/responses" },
  { icon: "query_stats", label: "Analytics", href: "/dashboard/analytics" },
  { icon: "api", label: "API Docs", href: "/dashboard/api-docs" },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-[#0d0e14] border-r border-[#454653] shadow-sm z-50 flex flex-col py-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-lg bg-[#818cf8] flex items-center justify-center">
          <svg
            width="22"
            height="22"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="6" height="6" rx="1" fill="#131e8c" />
            <rect x="10" y="2" width="6" height="6" rx="1" fill="#131e8c" opacity="0.6" />
            <rect x="2" y="10" width="6" height="6" rx="1" fill="#131e8c" opacity="0.6" />
            <rect x="10" y="10" width="6" height="6" rx="1" fill="#131e8c" />
          </svg>
        </div>
        <div>
          <h1
            className="text-lg font-bold text-[#e4e1eb]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            CanvasForms
          </h1>
          <p
            className="text-[11px] tracking-wider uppercase text-[#c6c5d5] opacity-70"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            Form Builder
          </p>
        </div>
      </div>

      {/* New Form button */}
      <CreateFormButton />

      {/* Navigation */}
      <nav className="flex-grow space-y-1">
        {NAV_ITEMS.map(({ icon, label, href }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <a
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-4 pl-4 py-2 transition-colors text-sm",
                isActive
                  ? "text-[#bdc2ff] border-l-2 border-[#bdc2ff] font-bold bg-[#1b1b22]"
                  : "text-[#c6c5d5] hover:bg-[#1b1b22]",
              )}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span>{label}</span>
            </a>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="mt-auto pt-6 border-t border-[#454653] flex items-center gap-3 px-2">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10",
            },
          }}
          showName
        />
      </div>
    </aside>
  );
}
