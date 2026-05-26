import {
  FormShell,
  FormCard,
  MultipleChoiceQuestion,
  FormNavigation,
  FormStateCards,
} from "~/components/respondent";

/** Mock form data — structured for future tRPC API replacement */
const MOCK_FORM = {
  title: "Startup Feedback Flow",
  currentStep: 3,
  totalSteps: 7,
  question: {
    type: "multiple_choice" as const,
    text: "What is your role?",
    name: "role",
    options: [
      { value: "founder", label: "Founder", description: "CEO, Co-founder, or Business Owner" },
      { value: "engineer", label: "Engineer", description: "Frontend, Backend, or Full-stack Developer" },
      { value: "designer", label: "Designer", description: "Product, UX/UI, or Brand Designer" },
      { value: "student", label: "Student", description: "Currently enrolled in an academic program" },
    ],
  },
};

export default function RespondentFormPage() {
  const { title, currentStep, totalSteps, question } = MOCK_FORM;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <FormShell progress={progress}>
      <FormCard step={currentStep} totalSteps={totalSteps} formTitle={title}>
        <MultipleChoiceQuestion
          question={question.text}
          options={question.options}
          name={question.name}
        />
        <FormNavigation />
      </FormCard>

      {/* State preview cards (design reference) */}
      <FormStateCards />
    </FormShell>
  );
}
