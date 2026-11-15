import type { Metadata } from "next";
import JobWriteContainer from "@/features/job-write/JobWriteContainer";

export const metadata: Metadata = {
  title: "공고 등록 | 현장공수잡",
};

export default function JobWritePage() {
  return <JobWriteContainer />;
}
