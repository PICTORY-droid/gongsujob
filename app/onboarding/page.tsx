import type { Metadata } from "next";
import OnboardingContainer from "@/features/onboarding/OnboardingContainer";

export const metadata: Metadata = {
  title: "첫 설정 | 현장공수잡",
};

export default function OnboardingPage() {
  return <OnboardingContainer />;
}
