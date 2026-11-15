import { describe, expect, it } from "vitest";
import {
  EMPTY_JOB_FILTER,
  MAX_SAVED_JOBS,
  applyJobFilter,
  availableRegions,
  getStartDayBadge,
  parseSavedJobIds,
  toggleSavedJobId,
} from "@/domain/job-list";

describe("찜한 공고 저장 형식", () => {
  it("올바른 JSON 배열만 받아들이고 중복을 없앤다", () => {
    expect(parseSavedJobIds('["a","b","a"]')).toEqual(["a", "b"]);
  });

  it("깨진 값·다른 타입·빈 값은 빈 배열", () => {
    expect(parseSavedJobIds(null)).toEqual([]);
    expect(parseSavedJobIds("not json")).toEqual([]);
    expect(parseSavedJobIds('{"a":1}')).toEqual([]);
    expect(parseSavedJobIds('[1, null, "", "ok"]')).toEqual(["ok"]);
  });

  it("너무 긴 ID와 최대 개수를 넘는 항목은 버린다", () => {
    const many = JSON.stringify(Array.from({ length: MAX_SAVED_JOBS + 10 }, (_, i) => `id${i}`));
    expect(parseSavedJobIds(many)).toHaveLength(MAX_SAVED_JOBS);
    expect(parseSavedJobIds(JSON.stringify(["x".repeat(65)]))).toEqual([]);
  });

  it("토글: 없으면 맨 앞에 추가, 있으면 제거", () => {
    expect(toggleSavedJobId(["a"], "b")).toEqual(["b", "a"]);
    expect(toggleSavedJobId(["b", "a"], "b")).toEqual(["a"]);
  });
});

describe("출근일 배지", () => {
  const now = new Date(2026, 10, 16, 21, 30); // 2026-11-16 밤

  it("오늘·내일·D-n", () => {
    expect(getStartDayBadge("2026-11-16", now)).toEqual({ label: "오늘 출근", tone: "today" });
    expect(getStartDayBadge("2026-11-17", now)).toEqual({ label: "내일 출근", tone: "soon" });
    expect(getStartDayBadge("2026-11-20", now)).toEqual({ label: "D-4", tone: "upcoming" });
  });

  it("지난 날짜·8일 이후·잘못된 값은 표시 안 함", () => {
    expect(getStartDayBadge("2026-11-15", now)).toBeNull();
    expect(getStartDayBadge("2026-11-24", now)).toBeNull();
    expect(getStartDayBadge("내일", now)).toBeNull();
    expect(getStartDayBadge(null, now)).toBeNull();
  });

  it("월말을 넘어가도 날짜 차이를 정확히 계산한다", () => {
    expect(getStartDayBadge("2026-12-01", new Date(2026, 10, 30))).toEqual({ label: "내일 출근", tone: "soon" });
  });
});

describe("공고 목록 필터", () => {
  const jobs = [
    { id: "1", title: "철근 반장 구함", region: "서울", is_urgent: true, job_type: "철근", company: "가나건설" },
    { id: "2", title: "형틀 목수", region: "경기", is_urgent: false, job_type: "형틀", company: "다라종합" },
    { id: "3", title: "타일 기공", region: "서울", is_urgent: false, job_type: "타일", company: null },
  ];

  it("조건이 없으면 전부", () => {
    expect(applyJobFilter(jobs, EMPTY_JOB_FILTER)).toHaveLength(3);
  });

  it("검색어는 제목·지역·직종·업체에서 찾는다", () => {
    expect(applyJobFilter(jobs, { ...EMPTY_JOB_FILTER, query: "다라" }).map((j) => j.id)).toEqual(["2"]);
    expect(applyJobFilter(jobs, { ...EMPTY_JOB_FILTER, query: " 타일 " }).map((j) => j.id)).toEqual(["3"]);
  });

  it("지역 + 급구 + 찜 조건을 함께 적용한다", () => {
    expect(applyJobFilter(jobs, { ...EMPTY_JOB_FILTER, region: "서울", urgentOnly: true }).map((j) => j.id)).toEqual(["1"]);
    expect(applyJobFilter(jobs, { ...EMPTY_JOB_FILTER, savedOnly: true, savedIds: ["3", "2"] }).map((j) => j.id)).toEqual(["2", "3"]);
    expect(applyJobFilter(jobs, { ...EMPTY_JOB_FILTER, savedOnly: true, savedIds: [] })).toEqual([]);
  });

  it("목록에 있는 지역만, 정해진 순서대로 칩을 만든다", () => {
    expect(availableRegions(jobs, ["서울", "부산", "경기"])).toEqual(["서울", "경기"]);
  });
});
