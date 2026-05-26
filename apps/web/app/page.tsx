import {
  LandingNav,
  LandingHero,
  LandingFeatures,
  LandingTemplates,
  LandingPricing,
  LandingFooter,
} from "~/components/landing";

export default function Home() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "var(--cf-background)", color: "var(--cf-on-surface)" }}
    >
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingTemplates />
      <LandingPricing />
      <LandingFooter />
    </div>
  );
}
