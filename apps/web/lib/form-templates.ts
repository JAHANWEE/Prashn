/**
 * Pre-built form templates with field definitions.
 * When a user clicks "Use Template", a form is created with these fields.
 */

export interface TemplateField {
  label: string;
  fieldType: string;
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor: "secondary" | "tertiary" | "primary" | "neutral";
  icon: string;
  fields: TemplateField[];
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "customer-feedback",
    title: "Customer Feedback",
    description: "Collect product feedback and satisfaction ratings from your users.",
    category: "Feedback",
    categoryColor: "primary",
    icon: "rate_review",
    fields: [
      { label: "Your Name", fieldType: "short_text", required: true, placeholder: "John Doe" },
      { label: "Email Address", fieldType: "email", required: true, placeholder: "you@company.com" },
      { label: "How satisfied are you with our product?", fieldType: "rating", required: true },
      { label: "What do you like most?", fieldType: "single_select", required: true, options: [{ label: "Ease of use", value: "ease" }, { label: "Features", value: "features" }, { label: "Design", value: "design" }, { label: "Performance", value: "performance" }, { label: "Support", value: "support" }] },
      { label: "What could we improve?", fieldType: "long_text", required: false, placeholder: "Tell us what you think..." },
      { label: "Would you recommend us to a friend?", fieldType: "single_select", required: true, options: [{ label: "Definitely", value: "yes" }, { label: "Maybe", value: "maybe" }, { label: "Probably not", value: "no" }] },
    ],
  },
  {
    id: "job-application",
    title: "Job Application",
    description: "Standard hiring form for collecting candidate information and qualifications.",
    category: "Hiring",
    categoryColor: "tertiary",
    icon: "work",
    fields: [
      { label: "Full Name", fieldType: "short_text", required: true, placeholder: "Jane Smith" },
      { label: "Email", fieldType: "email", required: true, placeholder: "jane@email.com" },
      { label: "Phone Number", fieldType: "short_text", required: true, placeholder: "+1 (555) 000-0000" },
      { label: "Position Applied For", fieldType: "single_select", required: true, options: [{ label: "Software Engineer", value: "swe" }, { label: "Product Designer", value: "design" }, { label: "Product Manager", value: "pm" }, { label: "Marketing", value: "marketing" }, { label: "Other", value: "other" }] },
      { label: "Years of Experience", fieldType: "number", required: true, placeholder: "3" },
      { label: "Preferred Start Date", fieldType: "date", required: false },
      { label: "Why do you want to join us?", fieldType: "long_text", required: true, placeholder: "Tell us about your motivation..." },
      { label: "Are you willing to relocate?", fieldType: "checkbox", required: false },
    ],
  },
  {
    id: "event-rsvp",
    title: "Event RSVP",
    description: "Elegant event registration with dietary preferences and attendance details.",
    category: "Events",
    categoryColor: "secondary",
    icon: "event",
    fields: [
      { label: "Your Name", fieldType: "short_text", required: true },
      { label: "Email", fieldType: "email", required: true },
      { label: "Number of Guests", fieldType: "number", required: true, placeholder: "1" },
      { label: "Dietary Preferences", fieldType: "multi_select", required: false, options: [{ label: "Vegetarian", value: "veg" }, { label: "Vegan", value: "vegan" }, { label: "Gluten-free", value: "gf" }, { label: "Halal", value: "halal" }, { label: "No restrictions", value: "none" }] },
      { label: "Will you attend the after-party?", fieldType: "checkbox", required: false },
      { label: "Any special requests?", fieldType: "long_text", required: false, placeholder: "Accessibility needs, parking, etc." },
    ],
  },
  {
    id: "contact-form",
    title: "Contact Form",
    description: "Simple contact form for websites. Name, email, subject, and message.",
    category: "General",
    categoryColor: "neutral",
    icon: "mail",
    fields: [
      { label: "Name", fieldType: "short_text", required: true, placeholder: "Your name" },
      { label: "Email", fieldType: "email", required: true, placeholder: "your@email.com" },
      { label: "Subject", fieldType: "single_select", required: true, options: [{ label: "General Inquiry", value: "general" }, { label: "Support", value: "support" }, { label: "Sales", value: "sales" }, { label: "Partnership", value: "partnership" }] },
      { label: "Message", fieldType: "long_text", required: true, placeholder: "How can we help?" },
    ],
  },
  {
    id: "newsletter-signup",
    title: "Newsletter Signup",
    description: "Quick email capture form with interest preferences.",
    category: "Marketing",
    categoryColor: "primary",
    icon: "campaign",
    fields: [
      { label: "Email Address", fieldType: "email", required: true, placeholder: "you@email.com" },
      { label: "First Name", fieldType: "short_text", required: false, placeholder: "Optional" },
      { label: "Interests", fieldType: "multi_select", required: false, options: [{ label: "Product Updates", value: "product" }, { label: "Engineering Blog", value: "engineering" }, { label: "Design Tips", value: "design" }, { label: "Industry News", value: "news" }] },
    ],
  },
  {
    id: "bug-report",
    title: "Bug Report",
    description: "Structured bug reporting form for product teams.",
    category: "Product",
    categoryColor: "tertiary",
    icon: "bug_report",
    fields: [
      { label: "Bug Title", fieldType: "short_text", required: true, placeholder: "Brief description of the issue" },
      { label: "Your Email", fieldType: "email", required: true },
      { label: "Severity", fieldType: "single_select", required: true, options: [{ label: "Critical — App crashes", value: "critical" }, { label: "High — Feature broken", value: "high" }, { label: "Medium — Workaround exists", value: "medium" }, { label: "Low — Cosmetic issue", value: "low" }] },
      { label: "Steps to Reproduce", fieldType: "long_text", required: true, placeholder: "1. Go to...\n2. Click on...\n3. See error" },
      { label: "Expected Behavior", fieldType: "long_text", required: true, placeholder: "What should have happened?" },
      { label: "Browser / Device", fieldType: "short_text", required: false, placeholder: "Chrome 120, macOS" },
    ],
  },
  {
    id: "nps-survey",
    title: "NPS Survey",
    description: "Net Promoter Score survey to measure customer loyalty.",
    category: "Feedback",
    categoryColor: "primary",
    icon: "trending_up",
    fields: [
      { label: "How likely are you to recommend us? (1-10)", fieldType: "rating", required: true },
      { label: "What's the primary reason for your score?", fieldType: "long_text", required: true, placeholder: "Tell us more..." },
      { label: "What could we do to improve?", fieldType: "long_text", required: false },
      { label: "Your Role", fieldType: "single_select", required: false, options: [{ label: "Founder / CEO", value: "founder" }, { label: "Engineer", value: "engineer" }, { label: "Designer", value: "designer" }, { label: "Product Manager", value: "pm" }, { label: "Other", value: "other" }] },
    ],
  },
  {
    id: "meeting-scheduler",
    title: "Meeting Request",
    description: "Let people request meetings with preferred dates and topics.",
    category: "Scheduling",
    categoryColor: "secondary",
    icon: "calendar_month",
    fields: [
      { label: "Your Name", fieldType: "short_text", required: true },
      { label: "Email", fieldType: "email", required: true },
      { label: "Preferred Date", fieldType: "date", required: true },
      { label: "Meeting Topic", fieldType: "single_select", required: true, options: [{ label: "Product Demo", value: "demo" }, { label: "Technical Discussion", value: "tech" }, { label: "Partnership", value: "partnership" }, { label: "General Chat", value: "general" }] },
      { label: "Duration", fieldType: "single_select", required: true, options: [{ label: "15 minutes", value: "15" }, { label: "30 minutes", value: "30" }, { label: "60 minutes", value: "60" }] },
      { label: "Additional Notes", fieldType: "long_text", required: false, placeholder: "Anything we should prepare?" },
    ],
  },
];
