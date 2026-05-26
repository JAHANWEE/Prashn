const FOOTER_LINKS = [
  { label: "FEATURES", href: "#features" },
  { label: "TEMPLATES", href: "#templates" },
  { label: "PRICING", href: "#pricing" },
  { label: "DOCS", href: "#" },
  { label: "PRIVACY", href: "#" },
] as const;

export function LandingFooter() {
  return (
    <footer className="py-16 border-t border-[#454653] bg-[#121319]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2 opacity-50">
          <div className="w-6 h-6 rounded flex items-center justify-center grayscale bg-[#818cf8]">
            <svg
              width="14"
              height="14"
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
          <span
            className="text-sm font-semibold text-[#e4e1eb]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            CanvasForms
          </span>
        </div>

        {/* Footer nav */}
        <nav className="flex flex-wrap justify-center gap-6">
          {FOOTER_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[11px] font-medium tracking-widest text-[#c6c5d5] hover:text-[#bdc2ff] transition-colors"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Copyright */}
        <p
          className="text-[11px] text-[#c6c5d5] opacity-50"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          © {new Date().getFullYear()} CanvasForms. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
