import { describe, expect, it } from "vitest";
import { getFeatureSection } from "@/features/home/home-menus";

describe("기능 안내 문구", () => {
  it("설명은 한 줄에 들어가도록 14자 이하 (PC 3열·태블릿 2열 칸 기준)", () => {
    for (const role of ["guest", "seeker", "employer"] as const) {
      for (const item of getFeatureSection(role).items) {
        expect(item.description.length, item.description).toBeLessThanOrEqual(14);
      }
    }
  });
});
