"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { trpc } from "~/trpc/client";

export default function ResponsesPage() {
  const { isSignedIn } = useAuth();
  const { data: formsList } = trpc.forms.list.useQuery(
    { page: 1, limit: 50 },
    { enabled: !!isSignedIn },
  );

  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const activeFormId = selectedFormId ?? formsList?.forms[0]?.id ?? null;

  const { data: responsesData, isLoading } = trpc.responses.list.useQuery(
    { formId: activeFormId!, page: 1, limit: 20 },
    { enabled: !!activeFormId && !!isSignedIn },
  );

  return (
    <>
      <div className="sticky top-0 bg-[#0d0e14] border-b border-[#454653] z-40 h-16 flex items-center px-6">
        <span className="text-lg font-bold text-[#bdc2ff]" style={{ fontFamily: "var(--font-geist-sans)" }}>
          Responses
        </span>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Form selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-semibold text-[#e4e1eb]" style={{ fontFamily: "var(--font-geist-sans)" }}>
            Form Responses
          </h2>
          {formsList && formsList.forms.length > 0 && (
            <select
              value={activeFormId ?? ""}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="bg-[#1b1b22] border border-[#454653] text-[#e4e1eb] rounded-lg py-2 pl-4 pr-10 text-[13px] font-medium focus:ring-2 focus:ring-[#bdc2ff]/20 focus:border-[#bdc2ff] outline-none appearance-none"
            >
              {formsList.forms.map((f) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          )}
        </div>

        {/* Responses table */}
        {isLoading && (
          <div className="bg-[#1b1b22] border border-[#454653] rounded-xl p-8 text-center">
            <p className="text-[#908f9e]">Loading responses...</p>
          </div>
        )}

        {responsesData && responsesData.responses.length === 0 && (
          <div className="bg-[#1b1b22] border border-[#454653] rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-[#454653] mb-4 block">inbox</span>
            <p className="text-lg font-semibold text-[#e4e1eb] mb-1">No responses yet</p>
            <p className="text-sm text-[#908f9e]">Share your form link to start collecting responses.</p>
          </div>
        )}

        {responsesData && responsesData.responses.length > 0 && (
          <div className="bg-[#1b1b22] border border-[#454653] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1f1f26] border-b border-[#454653]">
                  <tr>
                    <th className="px-6 py-3 text-[11px] font-medium text-[#908f9e] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-[11px] font-medium text-[#908f9e] uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-[11px] font-medium text-[#908f9e] uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-[11px] font-medium text-[#908f9e] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#454653]">
                  {responsesData.responses.map((r) => (
                    <tr key={r.id} className="hover:bg-[#1f1f26] transition-colors">
                      <td className="px-6 py-4 text-sm text-[#e4e1eb] whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#e4e1eb]">
                        {r.respondentEmail ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#e4e1eb]">
                        {r.respondentName ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          r.status === "completed"
                            ? "bg-green-900/40 text-green-300"
                            : "bg-amber-900/40 text-amber-300"
                        }`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-[#1f1f26] border-t border-[#454653] text-[11px] text-[#908f9e]">
              Showing {responsesData.responses.length} of {responsesData.total} responses
            </div>
          </div>
        )}
      </div>
    </>
  );
}
