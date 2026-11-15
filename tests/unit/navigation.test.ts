import { describe, expect, it } from "vitest";
import { getActiveHref, getDesktopNavItems, getNavItems, toViewerRole } from "@/lib/navigation";

describe("역할별 메뉴", () => {
  it("구직자에게는 인재·공고등록이, 구인자에게는 이력서·찜이 보이지 않는다", () => {
    const seeker = getNavItems("seeker").map((i) => i.key);
    const employer = getNavItems("employer").map((i) => i.key);
    expect(seeker).toEqual(["home", "jobs", "saved", "resume", "me"]);
    expect(employer).toEqual(["home", "talent", "post", "manage", "me"]);
    expect(seeker).not.toContain("talent");
    expect(employer).not.toContain("resume");
  });

  it("모든 역할의 하단 탭은 5개 이하", () => {
    for (const role of ["guest", "seeker", "employer"] as const) expect(getNavItems(role).length).toBeLessThanOrEqual(5);
  });

  it("PC 메뉴에서는 홈·로그인을 뺀다", () => {
    expect(getDesktopNavItems("guest").map((i) => i.key)).toEqual(["jobs", "talent", "contact"]);
  });

  it("로그인 여부·유형으로 역할을 정한다", () => {
    expect(toViewerRole(false, true)).toBe("guest");
    expect(toViewerRole(true, false)).toBe("seeker");
    expect(toViewerRole(true, true)).toBe("employer");
  });
});

describe("현재 메뉴 판별", () => {
  const items = getNavItems("seeker");

  it("더 구체적인 경로를 우선한다", () => {
    expect(getActiveHref("/jobs/saved", items)).toBe("/jobs/saved");
    expect(getActiveHref("/jobs/abc-123", items)).toBe("/jobs");
    expect(getActiveHref("/jobs", items)).toBe("/jobs");
  });

  it("홈은 정확히 / 일 때만", () => {
    expect(getActiveHref("/", items)).toBe("/");
    expect(getActiveHref("/mypage", items)).toBe("/mypage");
    expect(getActiveHref("/unknown", items)).toBeNull();
  });

  it("쿼리가 붙은 메뉴도 경로로 비교한다", () => {
    expect(getActiveHref("/login", getNavItems("guest"))).toBe("/login?mode=login");
  });
});
