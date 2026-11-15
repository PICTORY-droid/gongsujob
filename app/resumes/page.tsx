import type { Metadata } from "next";
import TalentSearchContainer from "@/features/resumes/TalentSearchContainer";

export const metadata: Metadata = {
  title: "인재 찾기 | 현장공수잡",
};

export default function ResumesPage() {
  return <TalentSearchContainer />;
}
