/**
 * FormNavigation — Back/Next buttons for multi-step form navigation.
 */
export function FormNavigation({
  showBack = true,
  nextLabel = "Next",
}: {
  showBack?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-4">
      {showBack ? (
        <button className="flex items-center gap-1 px-6 py-4 text-[13px] font-medium text-[#b9c7e0] border border-[#454653] rounded hover:bg-[#34343b] transition-all active:scale-95">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>
      ) : (
        <div />
      )}
      <button className="flex items-center gap-1 px-8 py-4 text-[13px] font-medium text-[#131e8c] bg-[#bdc2ff] rounded shadow-sm hover:brightness-110 transition-all active:scale-95">
        {nextLabel}
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </div>
  );
}
