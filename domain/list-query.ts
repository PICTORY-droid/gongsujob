import { normalizeCategory } from "@/domain/job-category";

/**
 * 목록 화면 주소의 검색 조건(?category=철근&q=서울)을 안전하게 해석한다.
 * 정해진 분야(group:키)·직종이 아니면 '전체'로, 검색어는 공백 정리 후 최대 50자로 제한한다.
 */

export type ListQuery = { category: string; query: string };

const MAX_QUERY = 50;

export function parseListQuery(params: { category?: string | string[]; q?: string | string[] }): ListQuery {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
  const category = first(params.category).trim();
  const query = first(params.q).replace(/\s+/g, " ").trim().slice(0, MAX_QUERY);
  return {
    category: normalizeCategory(category),
    query,
  };
}
