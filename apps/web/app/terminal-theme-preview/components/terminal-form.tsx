"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface TerminalField {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
  placeholder: string;
  options?: Array<{ label: string; value: string }>;
}

interface TerminalFormProps {
  formTitle: string;
  fields: TerminalField[];
  onSubmit: (answers: Record<string, string>) => void;
}

interface HistoryEntry {
  type: "system" | "question" | "answer" | "error";
  text: string;
}

export function TerminalForm({ formTitle, fields, onSubmit }: TerminalFormProps) {
  const [step, setStep] = useState(-1); // -1 = boot sequence
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentField = step >= 0 && step < fields.length ? fields[step] : null;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, step]);

  // Focus input
  useEffect(() => {
    if (!isTyping && !completed) inputRef.current?.focus();
  }, [isTyping, completed, step]);

  // Boot sequence
  useEffect(() => {
    const boot = async () => {
      setIsTyping(true);
      await addSystemMessage(`Initializing ${formTitle}...`, 400);
      await addSystemMessage("Loading questions...", 600);
      await addSystemMessage(`${fields.length} fields loaded.`, 300);
      await addSystemMessage("Ready.\n", 200);
      setStep(0);
      setIsTyping(false);
    };
    boot();
  }, []);

  // Show question when step changes
  useEffect(() => {
    if (step >= 0 && step < fields.length) {
      const field = fields[step]!;
      const suffix = field.required ? " *" : " (optional)";
      setHistory(h => [...h, { type: "question", text: field.label + suffix }]);

      if (field.fieldType === "single_select" && field.options) {
        const optText = field.options.map((o, i) => `  [${i + 1}] ${o.label}`).join("\n");
        setHistory(h => [...h, { type: "system", text: optText }]);
      }
      if (field.fieldType === "rating") {
        setHistory(h => [...h, { type: "system", text: "  Enter a number from 1 to 5" }]);
      }
    }
  }, [step]);

  const addSystemMessage = (text: string, delay: number): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        setHistory(h => [...h, { type: "system", text }]);
        resolve();
      }, delay);
    });
  };

  const handleSubmitAnswer = useCallback(() => {
    if (!currentField) return;
    const value = input.trim();

    // Validation
    if (currentField.required && !value) {
      setHistory(h => [...h, { type: "error", text: "This field is required." }]);
      return;
    }
    if (currentField.fieldType === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setHistory(h => [...h, { type: "error", text: "Please enter a valid email address." }]);
      return;
    }
    if (currentField.fieldType === "rating") {
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 5) {
        setHistory(h => [...h, { type: "error", text: "Enter a number between 1 and 5." }]);
        return;
      }
    }
    if (currentField.fieldType === "single_select" && currentField.options) {
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > currentField.options.length) {
        setHistory(h => [...h, { type: "error", text: `Enter a number between 1 and ${currentField.options.length}.` }]);
        return;
      }
    }

    // Record answer
    let displayValue = value;
    if (currentField.fieldType === "single_select" && currentField.options) {
      const idx = parseInt(value) - 1;
      displayValue = currentField.options[idx]?.label ?? value;
    }

    setHistory(h => [...h, { type: "answer", text: displayValue || "(skipped)" }]);
    setAnswers(a => ({ ...a, [currentField.id]: displayValue }));
    setInput("");

    // Next step
    if (step < fields.length - 1) {
      setStep(s => s + 1);
    } else {
      // Complete
      setIsTyping(true);
      setTimeout(() => {
        setHistory(h => [...h, { type: "system", text: "\nProcessing submission..." }]);
        setTimeout(() => {
          setHistory(h => [...h, { type: "system", text: "✓ Response recorded successfully." }]);
          setHistory(h => [...h, { type: "system", text: `Total fields: ${fields.length}` }]);
          setHistory(h => [...h, { type: "system", text: "Thank you for your response.\n" }]);
          setCompleted(true);
          setIsTyping(false);
          onSubmit(answers);
        }, 800);
      }, 500);
    }
  }, [input, currentField, step, fields, answers, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  return (
    <div
      className="w-full max-w-[700px] rounded-xl overflow-hidden border"
      style={{ background: "#0d0e14", borderColor: "#1e212d", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
    >
      {/* Terminal header */}
      <div className="h-9 flex items-center px-4 gap-3 border-b" style={{ background: "#121319", borderColor: "#1e212d" }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[10px] text-[#908f9e] ml-2" style={{ fontFamily: "var(--font-geist-mono)" }}>
          prashn — {formTitle}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[9px] text-[#5a5a6e]" style={{ fontFamily: "var(--font-geist-mono)" }}>
            {step >= 0 ? `${Math.min(step + 1, fields.length)}/${fields.length}` : "..."}
          </span>
          {!completed && step >= 0 && (
            <div className="w-16 h-1.5 rounded-full bg-[#1e212d] overflow-hidden">
              <div className="h-full bg-[#fca9d4] transition-all duration-300" style={{ width: `${((step + 1) / fields.length) * 100}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="h-[450px] overflow-y-auto p-5 space-y-1"
        style={{ fontFamily: "var(--font-geist-mono)" }}
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((entry, i) => (
          <HistoryLine key={i} entry={entry} />
        ))}

        {/* Active input line */}
        {!completed && !isTyping && step >= 0 && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[#fca9d4] text-[13px]">›</span>
            <input
              ref={inputRef}
              type={currentField?.fieldType === "email" ? "email" : "text"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentField?.placeholder || "Type your answer..."}
              className="flex-1 bg-transparent text-[13px] text-[#e4e1eb] placeholder:text-[#3a3a4a] outline-none caret-[#fca9d4]"
              autoFocus
            />
            <span className="w-[2px] h-4 bg-[#fca9d4] animate-pulse" />
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[#5a5a6e] text-[13px]">›</span>
            <span className="text-[#5a5a6e] text-[12px] animate-pulse">...</span>
          </div>
        )}

        {/* Completed state */}
        {completed && (
          <div className="mt-4 pt-3 border-t border-[#1e212d]">
            <p className="text-[11px] text-[#908f9e]">Session ended. <a href="/terminal-theme-preview" className="text-[#fca9d4] hover:underline">Start new session</a></p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-7 flex items-center justify-between px-4 border-t text-[9px] text-[#5a5a6e]" style={{ background: "#0a0a0f", borderColor: "#1e212d", fontFamily: "var(--font-geist-mono)" }}>
        <span>Press Enter to submit</span>
        <span>prashn v1.0.0</span>
      </div>
    </div>
  );
}

function HistoryLine({ entry }: { entry: HistoryEntry }) {
  const color = {
    system: "#908f9e",
    question: "#fca9d4",
    answer: "#e4e1eb",
    error: "#ff6b6b",
  }[entry.type];

  const prefix = {
    system: "  ",
    question: "? ",
    answer: "› ",
    error: "✗ ",
  }[entry.type];

  return (
    <div className="flex gap-0">
      <span className="text-[12px] whitespace-pre-wrap" style={{ color, fontFamily: "var(--font-geist-mono)" }}>
        <span style={{ color: entry.type === "question" ? "#fca9d4" : entry.type === "error" ? "#ff6b6b" : "#5a5a6e" }}>{prefix}</span>
        {entry.text}
      </span>
    </div>
  );
}
