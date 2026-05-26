"use client";

import { trpc } from "~/trpc/client";
import { useRouter } from "next/navigation";

export function CreateFormButton() {
  const createForm = trpc.forms.create.useMutation();
  const router = useRouter();
  const utils = trpc.useUtils();

  const handleCreate = async () => {
    const form = await createForm.mutateAsync({ title: "Untitled Form" });
    utils.forms.list.invalidate();
    router.push(`/builder?formId=${form.id}`);
  };

  return (
    <button
      onClick={handleCreate}
      disabled={createForm.isPending}
      className="w-full bg-[#818cf8] text-[#101b8a] text-[13px] font-medium py-4 rounded-lg flex items-center justify-center gap-1 mb-8 hover:opacity-90 transition-opacity active:scale-95 duration-75 disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[18px]">
        {createForm.isPending ? "hourglass_empty" : "add"}
      </span>
      {createForm.isPending ? "Creating..." : "New Form"}
    </button>
  );
}
