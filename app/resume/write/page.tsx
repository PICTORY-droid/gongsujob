import type { Metadata } from "next";
import ResumeWriteContainer from "@/features/resume-write/ResumeWriteContainer";

export const metadata: Metadata = {
  title: "이력서 작성 | 현장공수잡",
};

export default function ResumeWritePage() {
  return <ResumeWriteContainer />;
}
