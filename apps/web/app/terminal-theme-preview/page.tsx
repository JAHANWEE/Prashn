"use client";

import { useState } from "react";
import { TerminalForm } from "./components/terminal-form";

const DEMO_FIELDS = [
  { id: "1", label: "What is your name?", fieldType: "short_text", required: true, placeholder: "Enter your name" },
  { id: "2", label: "What is your email?", fieldType: "email", required: true, placeholder: "you@email.com" },
  { id: "3", label: "How would you rate our product?", fieldType: "rating", required: true, placeholder: "" },
  { id: "4", label: "What role best describes you?", fieldType: "single_select", required: true, placeholder: "", options: [{ label: "Engineer", value: "engineer" }, { label: "Designer", value: "designer" }, { label: "Product Manager", value: "pm" }, { label: "Founder", value: "founder" }] },
  { id: "5", label: "Any additional feedback?", fieldType: "long_text", required: false, placeholder: "Type your thoughts..." },
];

export default function TerminalThemePreviewPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0a0a0f" }}>
      <TerminalForm
        formTitle="CanvasForms Feedback"
        fields={DEMO_FIELDS}
        onSubmit={(answers) => {
          console.log("Submitted:", answers);
        }}
      />
    </div>
  );
}
