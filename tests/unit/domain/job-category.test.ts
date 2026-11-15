import { describe, expect, it } from "vitest";
import { JOB_GROUPS, JOB_TYPES } from "@/lib/job-taxonomy";
import { categoryLabel, findGroupOfType, groupCategoryValue, isConstructionJobType, jobTypesForCategory, normalizeCategory, resolveCategory } from "@/domain/job-category";

describe("직종 분류표", () => {
  it("분야는 6개, 세부 직종은 중복 없이 한 분야에만 속한다", () => {
    expect(JOB_GROUPS.map((g) => g.label)).toEqual(["현장 인력", "기술 인력", "물류 인력", "이사 인력", "식당 파출", "공장·농장"]);
    expect(new Set(JOB_TYPES).size).toBe(JOB_TYPES.length);
  });

  it("기존 건설 11개 직종은 그대로 남아 있다 (기존 데이터 호환)", () => {
    for (const type of ["철근", "형틀", "방수", "도장", "미장", "전기", "배관", "용접", "타일", "조적", "기타"]) {
      expect(JOB_TYPES).toContain(type);
    }
  });
});

describe("필터 값 해석", () => {
  it("전체 / 분야 / 세부 직종", () => {
    expect(resolveCategory("전체")).toEqual({ kind: "all" });
    expect(resolveCategory(groupCategoryValue("logistics"))).toMatchObject({ kind: "group", group: { label: "물류 인력" } });
    expect(resolveCategory("철근")).toMatchObject({ kind: "type", type: "철근", group: { key: "site" } });
  });

  it("조회 조건: 분야는 소속 직종 전부, 직종은 하나, 전체는 조건 없음", () => {
    expect(jobTypesForCategory("group:restaurant")).toEqual(["홀서빙", "주방보조", "설거지"]);
    expect(jobTypesForCategory("용접")).toEqual(["용접"]);
    expect(jobTypesForCategory("전체")).toBeNull();
  });

  it("모르는 값은 전체로 정규화", () => {
    expect(normalizeCategory("group:space")).toBe("전체");
    expect(normalizeCategory("<script>")).toBe("전체");
    expect(normalizeCategory("group:moving")).toBe("group:moving");
    expect(normalizeCategory("상하차")).toBe("상하차");
  });

  it("표시 이름", () => {
    expect(categoryLabel("전체")).toBe("전체 직종");
    expect(categoryLabel("group:factory")).toBe("공장·농장 전체");
    expect(categoryLabel("지게차")).toBe("지게차");
  });

  it("건설 직종 여부 (근로계약서 양식 선택)", () => {
    expect(isConstructionJobType("철근")).toBe(true);
    expect(isConstructionJobType("전기")).toBe(true);
    expect(isConstructionJobType("홀서빙")).toBe(false);
    expect(isConstructionJobType(null)).toBe(false);
    expect(findGroupOfType("포장")?.key).toBe("factory");
  });
});
