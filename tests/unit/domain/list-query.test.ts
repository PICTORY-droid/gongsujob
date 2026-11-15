import { describe, expect, it } from "vitest";
import { parseListQuery } from "@/domain/list-query";

describe("목록 주소 조건 해석", () => {
  it("정해진 직종과 검색어를 그대로 받는다", () => {
    expect(parseListQuery({ category: "철근", q: " 서울  강서 " })).toEqual({ category: "철근", query: "서울 강서" });
  });

  it("목록에 없는 직종·빈 값은 전체", () => {
    expect(parseListQuery({ category: "<script>" })).toEqual({ category: "전체", query: "" });
    expect(parseListQuery({})).toEqual({ category: "전체", query: "" });
  });

  it("여러 값이 오면 첫 번째만, 검색어는 50자까지", () => {
    expect(parseListQuery({ category: ["형틀", "철근"], q: "가".repeat(80) })).toEqual({ category: "형틀", query: "가".repeat(50) });
  });
});
