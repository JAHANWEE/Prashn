"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";

interface ChatField {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
  placeholder: string;
  options?: Array<{ label: string; value: string }>;
}

interface ChatFormProps {
  formTitle: string;
  fields: ChatField[];
  onSubmit: (answers: Record<string, string>) => void;
}

interface Message {
  id: string;
  type: "assistant" | "user" | "system";
  text: string;
  timestamp: string;
}

export function ChatForm({ formTitle, fields, onSubmit }: ChatFormProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(-1);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [completed, setCompleted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentField = step >= 0 && step < fields.length ? fields[step] : null;
  const progress = fields.length > 0 ? Math.round(((step + 1) / fields.length) * 100) : 0;

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const addMessage = useCallback((msg: Omit<Message, "id">) => {
    setMessages(prev => [...prev, { ...msg, id: `${Date.now()}-${Math.random()}` }]);
  }, []);

  const typeAssistant = useCallback((text: string, delay = 800): Promise<void> => {
    return new Promise(resolve => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage({ type: "assistant", text, timestamp: now() });
        resolve();
      }, delay);
    });
  }, [addMessage]);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, [messages, isTyping]);

  // Focus input
  useEffect(() => {
    if (!isTyping && !completed) inputRef.current?.focus();
  }, [isTyping, completed, step]);

  // Boot (guarded against StrictMode double-fire)
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    const boot = async () => {
      await typeAssistant("👋 Hi there! Welcome.", 600);
      await typeAssistant("I'd love to ask you a few quick questions.", 700);
      await typeAssistant("Let's get started!", 500);
      setStep(0);
    };
    boot();
  }, []);

  // Ask question when step changes
  useEffect(() => {
    if (step < 0 || step >= fields.length) return;
    const field = fields[step]!;
    const askQuestion = async () => {
      let questionText = field.label;
      if (!field.required) questionText += " _(optional)_";
      await typeAssistant(questionText, 600);

      if (field.fieldType === "single_select" && field.options) {
        const optionsText = field.options.map((o, i) => `${i + 1}. ${o.label}`).join("\n");
        await typeAssistant(optionsText, 400);
      }
      if (field.fieldType === "rating") {
        await typeAssistant("Pick a number from 1 to 5 ⭐", 400);
      }
    };
    askQuestion();
  }, [step]);

  const handleSend = useCallback(() => {
    if (!currentField || isTyping) return;
    const value = input.trim();

    // Validation
    if (currentField.required && !value) return;
    if (currentField.fieldType === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      addMessage({ type: "system", text: "Please enter a valid email.", timestamp: now() });
      return;
    }
    if (currentField.fieldType === "rating") {
      const n = parseInt(value);
      if (isNaN(n) || n < 1 || n > 5) {
        addMessage({ type: "system", text: "Enter a number between 1 and 5.", timestamp: now() });
        return;
      }
    }
    if (currentField.fieldType === "single_select" && currentField.options) {
      const n = parseInt(value);
      if (isNaN(n) || n < 1 || n > currentField.options.length) {
        addMessage({ type: "system", text: `Pick a number between 1 and ${currentField.options.length}.`, timestamp: now() });
        return;
      }
    }

    // Display value
    let displayValue = value || "(skipped)";
    if (currentField.fieldType === "single_select" && currentField.options) {
      displayValue = currentField.options[parseInt(value) - 1]?.label ?? value;
    }

    addMessage({ type: "user", text: displayValue, timestamp: now() });
    setAnswers(a => ({ ...a, [currentField.id]: displayValue }));
    setInput("");

    if (step < fields.length - 1) {
      setTimeout(() => setStep(s => s + 1), 300);
    } else {
      // Complete
      setTimeout(async () => {
        await typeAssistant("🎉 That's everything!", 800);
        await typeAssistant("Thank you for completing the form. Your responses have been submitted successfully.", 600);
        setCompleted(true);
        onSubmit(answers);
      }, 300);
    }
  }, [input, currentField, step, fields, answers, isTyping, addMessage, typeAssistant, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-[480px] h-[700px] rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0d0e14", border: "1px solid #1e212d", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-[#1e212d]" style={{ background: "#121319" }}>
        <div className="w-9 h-9 rounded-full bg-[#fca9d4] flex items-center justify-center">
          <span className="material-symbols-outlined text-[18px] text-[#0a0a0f]">smart_toy</span>
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-[#e4e1eb]" style={{ fontFamily: "var(--font-geist-sans)" }}>{formTitle}</p>
          <p className="text-[10px] text-[#22c55e] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            {completed ? "Completed" : isTyping ? "Typing..." : "Online"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>
            {step >= 0 ? `${Math.min(step + 1, fields.length)} of ${fields.length}` : "..."}
          </p>
          {!completed && step >= 0 && (
            <p className="text-[9px] text-[#fca9d4]" style={{ fontFamily: "var(--font-geist-mono)" }}>{progress}%</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        {completed && (
          <div className="flex justify-center pt-2">
            <div className="flex items-center gap-2 text-[10px] text-[#908f9e]" style={{ fontFamily: "var(--font-geist-mono)" }}>
              <span className="text-[#22c55e]">✓✓</span> Delivered & Saved
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#1e212d]" style={{ background: "#0a0a0f" }}>
        {!completed ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type={currentField?.fieldType === "email" ? "email" : "text"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentField?.placeholder || "Type a message..."}
              disabled={isTyping}
              className="flex-1 bg-[#121319] border border-[#1e212d] rounded-xl px-4 py-2.5 text-[13px] text-[#e4e1eb] placeholder:text-[#5a5a6e] outline-none focus:border-[#fca9d4]/40 transition-colors disabled:opacity-50"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            />
            <button
              onClick={handleSend}
              disabled={isTyping || (!input.trim() && currentField?.required)}
              className="w-9 h-9 rounded-full bg-[#fca9d4] flex items-center justify-center hover:brightness-110 transition-all active:scale-90 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px] text-[#0a0a0f]">send</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <a href={window.location.pathname + window.location.search} className="text-[11px] text-[#fca9d4] hover:underline" style={{ fontFamily: "var(--font-geist-mono)" }}>
              Start new conversation
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chat Bubble ─────────────────────────────────────────────────────────────

const ChatBubble = memo(function ChatBubble({ message }: { message: Message }) {
  if (message.type === "system") {
    return (
      <div className="flex justify-center">
        <span className="text-[10px] text-[#ff6b6b] bg-[#ff6b6b]/10 px-3 py-1 rounded-full">{message.text}</span>
      </div>
    );
  }

  const isUser = message.type === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`} style={{ animation: "fadeSlideIn 0.2s ease-out" }}>
      <div className={`max-w-[80%] ${isUser ? "order-1" : ""}`}>
        <div
          className="px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap"
          style={{
            fontFamily: "var(--font-geist-sans)",
            background: isUser ? "#fca9d4" : "#1b1b22",
            color: isUser ? "#0a0a0f" : "#e4e1eb",
            borderBottomRightRadius: isUser ? "4px" : "16px",
            borderBottomLeftRadius: isUser ? "16px" : "4px",
          }}
        >
          {message.text}
        </div>
        <p className={`text-[9px] text-[#5a5a6e] mt-1 ${isUser ? "text-right" : "text-left"}`} style={{ fontFamily: "var(--font-geist-mono)" }}>
          {message.timestamp}
          {isUser && " ✓✓"}
        </p>
      </div>
    </div>
  );
});

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-[#1b1b22] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-[#908f9e] animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-[#908f9e] animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-[#908f9e] animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
