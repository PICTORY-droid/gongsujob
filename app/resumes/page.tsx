import type { Metadata } from "next";
import TalentSearchContainer from "@/features/resumes/TalentSearchContainer";
import { parseListQuery } from "@/domain/list-query";

export const metadata: Metadata = {
  title: "인재 찾기 | 현장공수잡",
};

type ResumesPageProps = {
  searchParams: Promise<{ category?: string | string[]; q?: string | string[] }>;
};

export default async function ResumesPage({ searchParams }: ResumesPageProps) {
  const { category, query } = parseListQuery(await searchParams);
  return <TalentSearchContainer key={`${category}:${query}`} initialCategory={category} initialQuery={query} />;
}
