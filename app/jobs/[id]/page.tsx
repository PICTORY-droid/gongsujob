import type { Metadata } from "next";
import JobDetailContainer from "@/features/job-detail/JobDetailContainer";

export const metadata: Metadata = {
  title: "공고 상세 | 현장공수잡",
};

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  return <JobDetailContainer jobId={id} />;
}
