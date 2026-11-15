import type { Job } from "@/types/domain";

/**
 * 공고 목록 탐색 규칙 (순수 함수)
 * - 찜한 공고 저장 형식 검증·토글
 * - 출근일 배지(오늘·내일·D-n)
 * - 지역·급구·찜 필터 조합
 */

export const MAX_SAVED_JOBS = 100;

/** 저장소에서 읽은 값을 안전하게 문자열 ID 배열로 바꾼다. 형식이 틀리면 빈 배열. */
export function parseSavedJobIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const ids = value.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 64);
    return Array.from(new Set(ids)).slice(0, MAX_SAVED_JOBS);
  } catch {
    return [];
  }
}

/** 찜 토글: 있으면 빼고, 없으면 맨 앞에 추가(최대 개수 유지) */
export function toggleSavedJobId(ids: readonly string[], jobId: string): string[] {
  if (ids.includes(jobId)) return ids.filter((id) => id !== jobId);
  return [jobId, ...ids].slice(0, MAX_SAVED_JOBS);
}

export type StartDayBadge = { label: string; tone: "today" | "soon" | "upcoming" } | null;

const DAY_MS = 24 * 60 * 60 * 1000;

function toLocalDayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "YYYY-MM-DD" 출근일 → 배지. 지난 날짜·잘못된 값·7일 넘게 남은 날짜는 표시하지 않는다. */
export function getStartDayBadge(startDate: string | null | undefined, now: Date = new Date()): StartDayBadge {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(startDate ?? "");
  if (!match) return null;
  const start = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(start.getTime())) return null;

  const diff = Math.round((toLocalDayStart(start) - toLocalDayStart(now)) / DAY_MS);
  if (diff < 0 || diff > 7) return null;
  if (diff === 0) return { label: "오늘 출근", tone: "today" };
  if (diff === 1) return { label: "내일 출근", tone: "soon" };
  return { label: `D-${diff}`, tone: "upcoming" };
}

export type JobListFilter = {
  query: string;
  region: string | null;
  urgentOnly: boolean;
  savedOnly: boolean;
  savedIds: readonly string[];
};

export const EMPTY_JOB_FILTER: JobListFilter = { query: "", region: null, urgentOnly: false, savedOnly: false, savedIds: [] };

type FilterableJob = Pick<Job, "id" | "title" | "region" | "is_urgent"> & Partial<Pick<Job, "job_type" | "company">>;

/** 검색어(제목·지역·직종·업체) + 지역 + 급구 + 찜 조건을 모두 만족하는 공고만 남긴다. */
export function applyJobFilter<T extends FilterableJob>(jobs: readonly T[], filter: JobListFilter): T[] {
  const query = filter.query.trim();
  const saved = new Set(filter.savedIds);
  return jobs.filter((job) => {
    if (filter.region && job.region !== filter.region) return false;
    if (filter.urgentOnly && !job.is_urgent) return false;
    if (filter.savedOnly && !saved.has(job.id)) return false;
    if (!query) return true;
    return [job.title, job.region, job.job_type, job.company].some((field) => field?.includes(query));
  });
}

/** 현재 목록에 실제로 있는 지역만 칩으로 보여준다(빈 칩 방지). 입력 순서 유지. */
export function availableRegions(jobs: readonly Pick<Job, "region">[], order: readonly string[]): string[] {
  const present = new Set(jobs.map((job) => job.region));
  return order.filter((region) => present.has(region));
}
