import type { Metadata } from "next";
import JobListContainer from "@/features/jobs/JobListContainer";
import { parseListQuery } from "@/domain/list-query";

export const metadata: Metadata = {
  title: "일자리 | 현장공수잡",
};

type JobsPageProps = {
  searchParams: Promise<{ category?: string | string[]; q?: string | string[] }>;
};

/** /jobs?category=철근&q=서울 — 홈의 직종 메뉴·검색에서 넘어온 조건을 서버에서 읽어 넘긴다 */
export default async function JobsPage({ searchParams }: JobsPageProps) {
  const { category, query } = parseListQuery(await searchParams);
  return <JobListContainer key={`${category}:${query}`} initialCategory={category} initialQuery={query} />;
}
