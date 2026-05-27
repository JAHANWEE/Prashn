"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { trpc } from "~/trpc/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export function DashboardFormCards() {
  const { isSignedIn } = useAuth();
  const { data, isLoading } = trpc.forms.list.useQuery(
    { page: 1, limit: 6 },
    { enabled: !!isSignedIn },
  );
  const createForm = trpc.forms.create.useMutation();
  const router = useRouter();
  const utils = trpc.useUtils();

  const handleCreateForm = async () => {
    const form = await createForm.mutateAsync({ title: "Untitled Form" });
    utils.forms.list.invalidate();
    router.push(`/builder?formId=${form.id}`);
  };

  return (
    <section className="flex-grow space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#e4e1eb]" style={{ fontFamily: "var(--font-geist-sans)" }}>
          Your Forms
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading && (
          <>
            <FormCardSkeleton />
            <FormCardSkeleton />
          </>
        )}
        {data?.forms.map((form) => (
          <FormCard key={form.id} form={form} />
        ))}
        <CreateNewCard onClick={handleCreateForm} loading={createForm.isPending} />
      </div>
    </section>
  );
}

function FormCard({ form }: { form: any }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const utils = trpc.useUtils();
  const publishForm = trpc.forms.publish.useMutation({ onSuccess: () => { utils.forms.list.invalidate(); toast.success("Form published"); } });
  const unpublishForm = trpc.forms.unpublish.useMutation({ onSuccess: () => { utils.forms.list.invalidate(); toast("Form unpublished"); } });
  const archiveForm = trpc.forms.archive.useMutation({ onSuccess: () => { utils.forms.list.invalidate(); toast("Form archived"); } });
  const unarchiveForm = trpc.forms.unarchive.useMutation({ onSuccess: () => { utils.forms.list.invalidate(); toast("Form unarchived"); } });
  const cloneForm = trpc.forms.clone.useMutation({ onSuccess: () => { utils.forms.list.invalidate(); toast.success("Form duplicated"); } });
  const deleteForm = trpc.forms.delete.useMutation({ onSuccess: () => { utils.forms.list.invalidate(); toast("Form deleted"); } });

  const isPublished = form.status === "published";
  const isDraft = form.status === "draft";
  const isArchived = form.status === "archived";
  const formUrl = `${window.location.origin}/form/${form.slug}`;

  const updatedAt = new Date(form.updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - updatedAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const timeAgo = diffDays > 0 ? `${diffDays}d ago` : diffHours > 0 ? `${diffHours}h ago` : `${diffMins}m ago`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formUrl);
    toast.success("Link copied to clipboard");
    setMenuOpen(false);
  };

  return (
    <div
      className="group bg-[#0d0e14] border border-[#454653] rounded-xl overflow-hidden hover:border-[#fca9d4] transition-all relative"
      style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}
    >
      {/* Canvas preview area */}
      <a href={`/builder?formId=${form.id}`} className="block">
        <div className="h-32 bg-[#1b1b22] cf-canvas-grid-bg p-4 relative flex items-center justify-center overflow-hidden">
          <CanvasPreviewGeneric />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-[#fca9d4] text-[#0a0a0f] px-6 py-2 rounded-lg text-[13px] font-medium shadow-lg">
              Open Canvas
            </span>
          </div>
        </div>
      </a>

      {/* Card content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-base font-semibold text-[#e4e1eb] truncate" style={{ fontFamily: "var(--font-geist-sans)" }}>
            {form.title}
          </h4>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span
              className={cn(
                "px-2 py-0.5 text-[10px] font-medium rounded-full border",
                isPublished
                  ? "bg-green-900/30 text-green-300 border-green-800"
                  : isArchived
                    ? "bg-red-900/30 text-red-300 border-red-800"
                    : isDraft
                      ? "bg-[#292930] text-[#c6c5d5] border-[#454653]"
                      : "bg-amber-900/30 text-amber-300 border-amber-800",
              )}
            >
              {form.status}
            </span>
            {/* Menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#908f9e] hover:text-[#fca9d4] transition-colors p-0.5"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-[#c6c5d5] text-[11px] font-medium mb-3">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">link</span>
            /{form.slug}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">history</span>
            {timeAgo}
          </span>
          {isPublished && (
            <span className="flex items-center gap-1 text-[#fca9d4]">
              <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
              Live
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isArchived ? (
            <>
              <button
                onClick={() => unarchiveForm.mutate({ formId: form.id })}
                disabled={unarchiveForm.isPending}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-[11px] font-medium bg-[#fca9d4] text-[#0a0a0f] rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">unarchive</span>
                Unarchive
              </button>
              <button
                onClick={() => deleteForm.mutate({ formId: form.id })}
                disabled={deleteForm.isPending}
                className="flex items-center justify-center px-3 py-1.5 text-[11px] font-medium bg-[#1b1b22] border border-[#454653] rounded-lg text-[#ffb4ab] hover:border-[#ffb4ab] transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
              </button>
            </>
          ) : isPublished ? (
            <>
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-[11px] font-medium bg-[#1b1b22] border border-[#454653] rounded-lg text-[#c6c5d5] hover:border-[#fca9d4] hover:text-[#fca9d4] transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                Copy Link
              </button>
              <button
                onClick={() => unpublishForm.mutate({ formId: form.id })}
                disabled={unpublishForm.isPending}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-[11px] font-medium bg-[#1b1b22] border border-[#454653] rounded-lg text-[#f7bd3e] hover:border-[#f7bd3e] transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">unpublished</span>
                Unpublish
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => publishForm.mutate({ formId: form.id })}
                disabled={publishForm.isPending}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-[11px] font-medium bg-[#fca9d4] text-[#0a0a0f] rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">publish</span>
                Publish
              </button>
              <button
                onClick={() => { if (confirm("Delete this form?")) deleteForm.mutate({ formId: form.id }); }}
                disabled={deleteForm.isPending}
                className="flex items-center justify-center px-3 py-1.5 text-[11px] font-medium bg-[#1b1b22] border border-[#454653] rounded-lg text-[#ffb4ab] hover:border-[#ffb4ab] transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute top-12 right-4 bg-[#1f1f26] border border-[#454653] rounded-lg shadow-xl z-50 py-1 min-w-[160px]">
          <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-[12px] text-[#e4e1eb] hover:bg-[#292930] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">content_copy</span> Copy Link
          </button>
          {isPublished && (
            <a href={formUrl} target="_blank" className="w-full text-left px-4 py-2 text-[12px] text-[#e4e1eb] hover:bg-[#292930] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">open_in_new</span> View Live
            </a>
          )}
          <button
            onClick={() => { cloneForm.mutate({ formId: form.id }); setMenuOpen(false); }}
            className="w-full text-left px-4 py-2 text-[12px] text-[#e4e1eb] hover:bg-[#292930] flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span> Duplicate
          </button>
          <button
            onClick={() => { archiveForm.mutate({ formId: form.id }); setMenuOpen(false); }}
            className="w-full text-left px-4 py-2 text-[12px] text-[#f7bd3e] hover:bg-[#292930] flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">archive</span> Archive
          </button>
          <button
            onClick={() => { if (confirm("Permanently delete?")) { deleteForm.mutate({ formId: form.id }); setMenuOpen(false); } }}
            className="w-full text-left px-4 py-2 text-[12px] text-[#ffb4ab] hover:bg-[#292930] flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">delete_forever</span> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function CanvasPreviewGeneric() {
  return (
    <div className="flex gap-4 items-center z-10">
      <div className="w-14 h-9 bg-[#0d0e14] border border-[#454653] rounded-sm flex items-center justify-center" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}>
        <div className="w-8 h-1 bg-[#454653] rounded-full" />
      </div>
      <div className="w-3 h-[1.5px] bg-[#454653]" />
      <div className="w-14 h-9 bg-[#0d0e14] border border-[#fca9d4] rounded-sm flex items-center justify-center" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}>
        <div className="w-8 h-1 bg-[#fca9d4]/20 rounded-full" />
      </div>
    </div>
  );
}

function CreateNewCard({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group border-2 border-dashed border-[#454653] rounded-xl flex flex-col items-center justify-center p-8 hover:border-[#fca9d4] hover:bg-[#fca9d4]/5 transition-all text-[#c6c5d5] hover:text-[#fca9d4] disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[48px] mb-4">
        {loading ? "hourglass_empty" : "add_circle"}
      </span>
      <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-geist-sans)" }}>
        {loading ? "Creating..." : "Create New Form"}
      </p>
      <p className="text-[11px] opacity-70">Start with a blank canvas</p>
    </button>
  );
}

function FormCardSkeleton() {
  return (
    <div className="bg-[#0d0e14] border border-[#454653] rounded-xl overflow-hidden animate-pulse">
      <div className="h-32 bg-[#1b1b22]" />
      <div className="p-4 space-y-2">
        <div className="h-5 bg-[#292930] rounded w-2/3" />
        <div className="h-3 bg-[#292930] rounded w-1/3" />
        <div className="h-8 bg-[#292930] rounded mt-3" />
      </div>
    </div>
  );
}
