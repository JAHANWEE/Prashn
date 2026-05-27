import { cn } from "~/lib/utils";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export async function LandingNav() {
  const { userId } = await auth();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16",
        "border-b backdrop-blur-md",
        "bg-[#121319]/80 border-[#454653]",
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-[#fca9d4]">
            <svg
              width="18"
              height="18"
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
            className="text-lg font-bold tracking-tight text-[#fca9d4]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            Prashn
          </span>
        </div>

        {/* Nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-8">
          {(["FEATURES", "TEMPLATES", "PRICING"] as const).map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="text-xs font-medium tracking-widest text-[#c6c5d5] hover:text-[#fca9d4] transition-colors"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              {label}
            </a>
          ))}
          <a
            href="/explore"
            className="text-xs font-medium tracking-widest text-[#c6c5d5] hover:text-[#fca9d4] transition-colors"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            EXPLORE
          </a>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          {userId ? (
            <>
              <a
                href="/dashboard"
                className="text-xs font-medium tracking-widest px-4 py-2 text-[#c6c5d5] hover:text-[#fca9d4] transition-colors"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                DASHBOARD
              </a>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </>
          ) : (
            <>
              <SignInButton mode="redirect">
                <button
                  className="text-xs font-medium tracking-widest px-4 py-2 text-[#c6c5d5] hover:text-[#fca9d4] transition-colors"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  LOG IN
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button
                  className="text-xs font-medium tracking-widest px-6 py-2 rounded bg-[#fca9d4] text-[#0a0a0f] hover:bg-[#fca9d4] transition-all active:scale-95 shadow-sm"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  START BUILDING
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
