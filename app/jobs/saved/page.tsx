import type { Metadata } from "next";
import JobListContainer from "@/features/jobs/JobListContainer";

export const metadata: Metadata = {
  title: "찜한 공고 | 현장공수잡",
};

/** /jobs/saved — 찜한 공고만 보이는 공고 목록 */
export default function SavedJobsPage() {
  return <JobListContainer initialSavedOnly />;
}
