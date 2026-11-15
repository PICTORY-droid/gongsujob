import type { Job, PublicResume } from "@/types/domain";

/** 화면 내 검색어 필터 (서버 조회 결과를 클라이언트에서 좁힌다). 기존 동작과 동일. */

export function filterJobs<T extends Pick<Job, "title" | "region">>(jobs: T[], query: string): T[] {
  return jobs.filter((job) => job.title?.includes(query) || job.region?.includes(query));
}

export function filterResumes<T extends Pick<PublicResume, "name" | "job_type" | "address" | "skills">>(
  resumes: T[],
  query: string,
): T[] {
  return resumes.filter(
    (resume) =>
      resume.name?.includes(query) ||
      resume.job_type?.includes(query) ||
      resume.address?.includes(query) ||
      resume.skills?.includes(query),
  );
}
