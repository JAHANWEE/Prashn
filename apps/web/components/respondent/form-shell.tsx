/**
 * FormShell — The outer container for the respondent form experience.
 * Provides the dot-grid background, progress bar, and centered layout.
 */
export function FormShell({
  progress,
  children,
}: {
  progress: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{
        backgroundColor: "#121319",
        color: "#e4e1eb",
        backgroundImage: "radial-gradient(#292930 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Progress bar */}
      <header className="fixed top-0 left-0 w-full h-1 bg-[#0d0e14] z-50">
        <div
          className="h-full bg-[#fca9d4] transition-all duration-500"
          style={{
            width: `${progress}%`,
            boxShadow: "0 0 10px rgba(252,169,212,0.5)",
          }}
        />
      </header>

      {/* Main content area */}
      <main className="pt-24 pb-16 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 flex flex-col items-center gap-2 border-t border-[#454653] bg-[#1b1b22]">
        <div className="flex items-center gap-1">
          <span className="text-[13px] font-black text-[#e4e1eb]">Prashn</span>
          <span className="text-[11px] text-[#c6c5d5] opacity-70">Built with Prashn</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-all">
            Privacy
          </a>
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-all">
            Terms
          </a>
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-all">
            Support
          </a>
        </div>
      </footer>
    </div>
  );
}
