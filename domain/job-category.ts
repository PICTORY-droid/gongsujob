import { JOB_GROUPS, type JobGroup, type JobGroupKey } from "@/lib/job-taxonomy";
import { ALL_CATEGORY } from "@/lib/constants";

/**
 * 직종 필터 값 해석 (순수 함수)
 * 필터 값은 세 가지 중 하나다: "전체" / 분야("group:logistics") / 세부 직종("상하차")
 */

const GROUP_PREFIX = "group:";

export type CategoryFilter = { kind: "all" } | { kind: "group"; group: JobGroup } | { kind: "type"; type: string; group: JobGroup };

export function groupCategoryValue(key: JobGroupKey): string {
  return `${GROUP_PREFIX}${key}`;
}

export function findGroupOfType(type: string | null | undefined): JobGroup | null {
  if (!type) return null;
  return JOB_GROUPS.find((group) => (group.types as readonly string[]).includes(type)) ?? null;
}

export function resolveCategory(value: string | null | undefined): CategoryFilter {
  if (!value || value === ALL_CATEGORY) return { kind: "all" };
  if (value.startsWith(GROUP_PREFIX)) {
    const group = JOB_GROUPS.find((g) => g.key === value.slice(GROUP_PREFIX.length));
    return group ? { kind: "group", group } : { kind: "all" };
  }
  const group = findGroupOfType(value);
  return group ? { kind: "type", type: value, group } : { kind: "all" };
}

/** 조회 조건: null 이면 전체, 아니면 job_type 이 이 목록 중 하나 */
export function jobTypesForCategory(value: string | null | undefined): readonly string[] | null {
  const filter = resolveCategory(value);
  if (filter.kind === "all") return null;
  if (filter.kind === "group") return filter.group.types;
  return [filter.type];
}

/** 화면 표시용 이름 */
export function categoryLabel(value: string | null | undefined, allLabel = "전체 직종"): string {
  const filter = resolveCategory(value);
  if (filter.kind === "all") return allLabel;
  if (filter.kind === "group") return `${filter.group.label} 전체`;
  return filter.type;
}

/** 알 수 없는 값은 "전체"로 정규화 (주소창 입력 방어) */
export function normalizeCategory(value: string | null | undefined): string {
  const filter = resolveCategory(value);
  if (filter.kind === "all") return ALL_CATEGORY;
  if (filter.kind === "group") return groupCategoryValue(filter.group.key);
  return filter.type;
}

/** 건설업 일용직 직종인지 (근로계약서 양식 선택). 모르는 직종은 일반 일용직으로 본다 */
export function isConstructionJobType(type: string | null | undefined): boolean {
  return findGroupOfType(type)?.construction ?? false;
}
