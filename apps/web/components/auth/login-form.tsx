/**
 * LoginForm — Premium login card styled as a canvas node.
 */
export function LoginForm() {
  return (
    <div
      className="w-full bg-[#1b1b22] border border-[#454653]/80 rounded-2xl overflow-hidden flex flex-col"
      style={{ boxShadow: "0 12px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(69,70,83,0.3)" }}
    >
      {/* Node Header */}
      <div className="bg-[#161620] border-b border-[#454653]/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#fca9d4] flex items-center justify-center">
            <svg
              width="16"
              height="16"
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
            className="text-[15px] font-semibold tracking-tight text-[#e4e1eb]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            CanvasForms
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#454653]" />
          <div className="w-2 h-2 rounded-full bg-[#454653]" />
          <div className="w-2 h-2 rounded-full bg-[#454653]" />
        </div>
      </div>

      {/* Form Content */}
      <div className="px-7 pt-7 pb-6 flex flex-col gap-5">
        {/* Header */}
        <header className="text-center">
          <h1
            className="text-[22px] font-semibold text-[#e4e1eb]"
            style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.02em" }}
          >
            Welcome back
          </h1>
          <p className="text-[13px] text-[#908f9e] mt-1" style={{ fontFamily: "var(--font-geist-sans)" }}>
            Log in to manage your forms and data.
          </p>
        </header>

        {/* Form */}
        <form className="flex flex-col gap-4">
          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[12px] font-medium text-[#908f9e] uppercase tracking-wide"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              Email
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a6e] text-[18px] group-focus-within:text-[#fca9d4] transition-colors">
                mail
              </span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 bg-[#121319] border border-[#353540] rounded-xl text-[14px] text-[#e4e1eb] placeholder:text-[#5a5a6e] focus:ring-2 focus:ring-[#fca9d4]/25 focus:border-[#fca9d4]/60 transition-all outline-none"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-[12px] font-medium text-[#908f9e] uppercase tracking-wide"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                Password
              </label>
              <a
                href="#"
                className="text-[11px] font-medium text-[#fca9d4] hover:text-[#fca9d4] transition-colors"
              >
                Forgot?
              </a>
            </div>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a6e] text-[18px] group-focus-within:text-[#fca9d4] transition-colors">
                lock
              </span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 bg-[#121319] border border-[#353540] rounded-xl text-[14px] text-[#e4e1eb] placeholder:text-[#5a5a6e] focus:ring-2 focus:ring-[#fca9d4]/25 focus:border-[#fca9d4]/60 transition-all outline-none"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#fca9d4] text-[#ffffff] text-[13px] font-semibold py-3 rounded-xl hover:bg-[#fca9d4] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-1"
            style={{ fontFamily: "var(--font-geist-sans)", boxShadow: "0 2px 12px rgba(252,169,212,0.3)" }}
          >
            <span>Sign In</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#353540]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#1b1b22] px-3 text-[10px] uppercase tracking-widest text-[#5a5a6e] font-medium">
              or
            </span>
          </div>
        </div>

        {/* Register link */}
        <p className="text-center text-[13px] text-[#908f9e]">
          Don&apos;t have an account?{" "}
          <a href="#" className="text-[#fca9d4] font-semibold hover:text-white transition-colors">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
