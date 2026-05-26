import { LoginForm, DemoCredentials } from "~/components/auth";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: "#0d0e14",
        color: "#e4e1eb",
        backgroundImage: "radial-gradient(#1f1f26 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <main className="w-full max-w-[420px] flex flex-col items-center gap-5">
        <LoginForm />
        <DemoCredentials />

        {/* System Footer */}
        <footer className="flex items-center justify-center gap-6 pt-3 w-full">
          <a
            href="#"
            className="text-[11px] text-[#908f9e] hover:text-[#bdc2ff] transition-colors"
          >
            Privacy Policy
          </a>
          <span className="text-[11px] text-[#454653]">·</span>
          <a
            href="#"
            className="text-[11px] text-[#908f9e] hover:text-[#bdc2ff] transition-colors"
          >
            Support
          </a>
          <span className="text-[11px] text-[#454653]">·</span>
          <span className="text-[11px] text-[#454653]">v2.4.0</span>
        </footer>
      </main>
    </div>
  );
}
