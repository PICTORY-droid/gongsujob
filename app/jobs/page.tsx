import type { Metadata } from "next";
import JobListContainer from "@/features/jobs/JobListContainer";

export const metadata: Metadata = {
  title: "공고 목록 | 현장공수잡",
};

export default function JobsPage() {
  return <JobListContainer />;
}
