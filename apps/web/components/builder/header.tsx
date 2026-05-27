"use client";

import { useSearchParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { useAuth } from "@clerk/nextjs";

export function BuilderHeader({ formTitle, onPreview, autoSave, onToggleAutoSave }: { formTitle?: string; onPreview?: () => void; autoSave?: boolean; onToggleAutoSave?: () => void }) {
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");
  const { isSignedIn } = useAuth();

  const { data: form } = trpc.forms.getById.useQuery(
    { formId: formId! },
    { enabled: !!formId && !!isSignedIn },
  );

  const utils = trpc.useUtils();
  const publishForm = trpc.forms.publish.useMutation({
    onSuccess: () => utils.forms.getById.invalidate(),
  });

  const slug = form?.slug;
  const isPublished = form?.status === "published";
  const formUrl = slug ? `${window.location.origin}/form/${slug}` : "";

  const handleShare = () => {
    if (formUrl) {
      navigator.clipboard.writeText(formUrl);
    }
  };

  const handlePublish = () => {
    if (formId) publishForm.mutate({ formId });
  };

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-[#121319] border-b border-[#454653] flex items-center justify-between px-6 z-50">
      {/* Left: Logo + Breadcrumb */}
      <div className="flex items-center gap-4">
        <a href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-[#fca9d4]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="2" y="2" width="6" height="6" rx="1" fill="#ffffff" />
              <rect x="10" y="2" width="6" height="6" rx="1" fill="#ffffff" opacity="0.6" />
              <rect x="2" y="10" width="6" height="6" rx="1" fill="#ffffff" opacity="0.6" />
              <rect x="10" y="10" width="6" height="6" rx="1" fill="#ffffff" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-[#fca9d4]" style={{ fontFamily: "var(--font-geist-sans)" }}>
            CanvasForms
          </span>
        </a>
        <div className="h-5 w-[1px] bg-[#454653]" />
        <nav className="flex items-center gap-2 text-[12px] text-[#c6c5d5]" style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}>
          <a href="/dashboard" className="text-[#908f9e] hover:text-[#fca9d4] transition-colors">Dashboard</a>
          <span className="text-[#454653]">/</span>
          <span className="text-[#e4e1eb] font-medium">{formTitle ?? "Loading..."}</span>
        </nav>
      </div>

      {/* Center: Tabs */}
      <div className="flex items-center gap-6">
        <span className="text-[12px] font-medium text-[#fca9d4] border-b-2 border-[#fca9d4] pb-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
          Builder
        </span>
        <button
          onClick={onPreview}
          className="text-[12px] font-medium text-[#c6c5d5] hover:text-[#fca9d4] pb-1 transition-all"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          Preview
        </button>
        {formId && (
          <a
            href="/dashboard/responses"
            className="text-[12px] font-medium text-[#c6c5d5] hover:text-[#fca9d4] pb-1 transition-all"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            Responses
          </a>
        )}
        {formId && (
          <a
            href={`/terminal-theme-preview?formId=${formId}`}
            target="_blank"
            className="text-[12px] font-medium text-[#c6c5d5] hover:text-[#fca9d4] pb-1 transition-all flex items-center gap-1"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            <span className="material-symbols-outlined text-[14px]">terminal</span>
            IDE
          </a>
        )}
        {formId && (
          <a
            href={`/chat-theme-preview?formId=${formId}`}
            target="_blank"
            className="text-[12px] font-medium text-[#c6c5d5] hover:text-[#fca9d4] pb-1 transition-all flex items-center gap-1"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            <span className="material-symbols-outlined text-[14px]">chat</span>
            Chat
          </a>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {isPublished && (
          <span className="text-[11px] text-green-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Published
          </span>
        )}
        <button
          onClick={handleShare}
          disabled={!isPublished}
          className="px-4 py-1.5 bg-[#1b1b22] text-[#e4e1eb] text-[12px] font-medium rounded border border-[#454653] hover:bg-[#1f1f26] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-geist-mono)" }}
          title={isPublished ? "Copy form link" : "Publish first to share"}
        >
          {isPublished ? "Copy Link" : "Share"}
        </button>
        {/* Auto-save toggle */}
        <div className="flex items-center gap-2 px-2 border-r border-[#454653]">
          <span className="text-[10px] text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>Auto-save</span>
          <button
            onClick={onToggleAutoSave}
            className="w-8 h-[18px] rounded-full relative transition-colors"
            style={{ background: autoSave ? "#fca9d4" : "#454653" }}
            title={autoSave ? "Auto-save ON" : "Auto-save OFF"}
          >
            <div
              className="absolute top-[3px] w-3 h-3 bg-white rounded-full transition-all"
              style={{ left: autoSave ? "calc(100% - 15px)" : "3px" }}
            />
          </button>
        </div>
        {!isPublished && (
          <button
            onClick={handlePublish}
            disabled={publishForm.isPending}
            className="px-4 py-1.5 bg-[#fca9d4] text-[#0a0a0f] text-[12px] font-medium rounded hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            style={{ fontFamily: "var(--font-geist-mono)", boxShadow: "0px 1px 3px rgba(0,0,0,0.3)" }}
          >
            {publishForm.isPending ? "Publishing..." : "Publish"}
          </button>
        )}
      </div>
    </header>
  );
}
