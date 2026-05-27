const FOOTER_LINKS = [
  { label: "FEATURES", href: "#features" },
  { label: "TEMPLATES", href: "/dashboard/templates" },
  { label: "PRICING", href: "/pricing" },
  { label: "DOCS", href: "/dashboard/api-docs" },
  { label: "PRIVACY", href: "/pricing" },
] as const;

export function LandingFooter() {
  return (
    <footer className="py-16 border-t border-[#454653] bg-[#121319]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2 opacity-50">
          <div className="w-6 h-6 rounded flex items-center justify-center grayscale bg-[#fca9d4]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="6" height="6" rx="1" fill="#ffffff" />
              <rect x="10" y="2" width="6" height="6" rx="1" fill="#ffffff" opacity="0.6" />
              <rect x="2" y="10" width="6" height="6" rx="1" fill="#ffffff" opacity="0.6" />
              <rect x="10" y="10" width="6" height="6" rx="1" fill="#ffffff" />
            </svg>
          </div>
          <span
            className="text-sm font-semibold text-[#e4e1eb]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            Prashn
          </span>
        </div>

        {/* Footer nav */}
        <nav className="flex flex-wrap justify-center gap-6">
          {FOOTER_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[11px] font-medium tracking-widest text-[#c6c5d5] hover:text-[#fca9d4] transition-colors"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Copyright + Twitter */}
        <div className="flex items-center gap-4">
          <p
            className="text-[11px] text-[#c6c5d5] opacity-50"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            © {new Date().getFullYear()} Prashn. All rights reserved.
          </p>
          <a
            href="https://x.com/jaaaani404"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c6c5d5] hover:text-[#fca9d4] transition-colors opacity-70 hover:opacity-100"
            title="@jaaaani404 on X"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
