import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
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
      <div className="w-full max-w-[420px] flex flex-col items-center gap-5">
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-[#1b1b22] border border-[#454653]/80 shadow-[0_12px_48px_rgba(0,0,0,0.4)] rounded-2xl",
              headerTitle: "text-[#e4e1eb]",
              headerSubtitle: "text-[#908f9e]",
              formFieldLabel: "text-[#908f9e]",
              formFieldInput: "bg-[#121319] border-[#353540] text-[#e4e1eb] rounded-xl",
              formButtonPrimary: "bg-[#fca9d4] hover:bg-[#fca9d4] text-[#0a0a0f] rounded-xl",
              footerActionLink: "text-[#fca9d4]",
              socialButtonsBlockButton: "bg-[#1f1f26] border-[#353540] text-[#e4e1eb] hover:bg-[#292930]",
              dividerLine: "bg-[#353540]",
              dividerText: "text-[#5a5a6e]",
            },
          }}
          forceRedirectUrl="/dashboard"
          signInUrl="/login"
        />
      </div>
    </div>
  );
}
