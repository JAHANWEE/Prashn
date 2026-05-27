"use client";

import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";

export function DashboardRightPanel() {
  return (
    <aside className="w-full lg:w-[320px] space-y-8">
      <QuickActions />
    </aside>
  );
}

function QuickActions() {
  const router = useRouter();
  const createForm = trpc.forms.create.useMutation();
  const utils = trpc.useUtils();

  const handleNewForm = async () => {
    const form = await createForm.mutateAsync({ title: "Untitled Form" });
    utils.forms.list.invalidate();
    router.push(`/builder?formId=${form.id}`);
  };

  return (
    <div className="bg-[#0d0e14] border border-[#454653] rounded-xl p-6" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" }}>
      <h3 className="text-lg font-semibold text-[#e4e1eb] mb-6" style={{ fontFamily: "var(--font-geist-sans)" }}>
        Quick Actions
      </h3>
      <div className="space-y-4">
        <button
          onClick={handleNewForm}
          disabled={createForm.isPending}
          className="w-full text-left p-4 border border-[#454653] rounded-lg flex items-center gap-4 hover:bg-[#1b1b22] transition-colors group disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[#bdc2ff] bg-[#bdc2ff]/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
            account_tree
          </span>
          <div>
            <p className="text-[13px] font-medium text-[#e4e1eb]">New Canvas Form</p>
            <p className="text-[11px] text-[#c6c5d5]">Visual node editor</p>
          </div>
        </button>
        <a
          href="/dashboard/templates"
          className="w-full text-left p-4 border border-[#454653] rounded-lg flex items-center gap-4 hover:bg-[#1b1b22] transition-colors group block"
        >
          <span className="material-symbols-outlined text-[#f7bd3e] bg-[#c08d00]/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
            temp_preferences_custom
          </span>
          <div>
            <p className="text-[13px] font-medium text-[#e4e1eb]">Use Template</p>
            <p className="text-[11px] text-[#c6c5d5]">Browse pre-built flows</p>
          </div>
        </a>
      </div>
    </div>
  );
}
