/**
 * MultipleChoiceQuestion — Radio-style single-select question.
 */
export function MultipleChoiceQuestion({
  question,
  options,
  name,
}: {
  question: string;
  options: { value: string; label: string; description: string }[];
  name: string;
}) {
  return (
    <div>
      <h2
        className="text-2xl font-semibold text-[#e4e1eb] mb-8"
        style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.01em" }}
      >
        {question}
      </h2>
      <div className="space-y-4">
        {options.map((option) => (
          <label
            key={option.value}
            className="group flex items-center p-4 border border-[#454653] rounded-lg cursor-pointer hover:bg-[#34343b] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#fca9d4]/20"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              className="w-4 h-4 text-[#fca9d4] bg-[#1f1f26] border-[#454653] focus:ring-[#fca9d4] focus:ring-offset-[#121319]"
            />
            <div className="ml-4">
              <span
                className="text-base text-[#e4e1eb] block"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                {option.label}
              </span>
              <span className="text-[11px] text-[#c6c5d5]">{option.description}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

/**
 * ShortTextQuestion — Single-line text input.
 */
export function ShortTextQuestion({
  question,
  placeholder,
  name,
}: {
  question: string;
  placeholder?: string;
  name: string;
}) {
  return (
    <div>
      <h2
        className="text-2xl font-semibold text-[#e4e1eb] mb-8"
        style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.01em" }}
      >
        {question}
      </h2>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        className="w-full bg-[#1b1b22] border border-[#454653] rounded-lg px-4 py-3 text-base text-[#e4e1eb] placeholder:text-[#908f9e] focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4] focus:outline-none transition-all"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      />
    </div>
  );
}

/**
 * LongTextQuestion — Multi-line textarea input.
 */
export function LongTextQuestion({
  question,
  placeholder,
  name,
}: {
  question: string;
  placeholder?: string;
  name: string;
}) {
  return (
    <div>
      <h2
        className="text-2xl font-semibold text-[#e4e1eb] mb-8"
        style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.01em" }}
      >
        {question}
      </h2>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-[#1b1b22] border border-[#454653] rounded-lg px-4 py-3 text-base text-[#e4e1eb] placeholder:text-[#908f9e] focus:ring-2 focus:ring-[#fca9d4]/20 focus:border-[#fca9d4] focus:outline-none transition-all resize-none"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      />
    </div>
  );
}

/**
 * RatingQuestion — Star/dot rating scale.
 */
export function RatingQuestion({
  question,
  maxRating = 5,
  name,
}: {
  question: string;
  maxRating?: number;
  name: string;
}) {
  return (
    <div>
      <h2
        className="text-2xl font-semibold text-[#e4e1eb] mb-8"
        style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.01em" }}
      >
        {question}
      </h2>
      <div className="flex gap-3 justify-center">
        {Array.from({ length: maxRating }, (_, i) => (
          <button
            key={i}
            type="button"
            className="w-10 h-10 rounded-full border border-[#454653] bg-[#1b1b22] hover:bg-[#fca9d4]/20 hover:border-[#fca9d4] transition-all flex items-center justify-center"
            aria-label={`Rate ${i + 1} of ${maxRating}`}
          >
            <span className="text-sm text-[#c6c5d5]">{i + 1}</span>
          </button>
        ))}
      </div>
      <input type="hidden" name={name} />
    </div>
  );
}
