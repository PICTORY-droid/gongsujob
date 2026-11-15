import { describe, expect, it } from "vitest";
import { calculateNetPay, clampDays, floorWon } from "@/domain/net-pay";

describe("calculateNetPay (일용직 실수령액)", () => {
  it("일당이 없으면 계산하지 않는다", () => {
    expect(calculateNetPay(0, 1, false)).toBeNull();
  });

  it("일당 15만원 이하: 고용보험만 공제", () => {
    const r = calculateNetPay(150_000, 1, false)!;
    expect(r.employment).toBe(1_350);
    expect(r.incomeTax).toBe(0);
    expect(r.localIncomeTax).toBe(0);
    expect(r.net).toBe(148_650);
  });

  it("일당 20만원 × 3일: 소득세 = (20만-15만)×6%×45% = 1,350원/일", () => {
    const r = calculateNetPay(200_000, 3, false)!;
    expect(r.total).toBe(600_000);
    expect(r.employment).toBe(5_400);
    expect(r.incomeTax).toBe(4_050);
    expect(r.localIncomeTax).toBe(405);
    expect(r.totalDeduction).toBe(9_855);
    expect(r.net).toBe(590_145);
  });

  it("부동소수점 오차로 1원이 덜 공제되지 않는다 (200,000 × 0.9% = 1,800)", () => {
    expect(200_000 * 0.009).toBeLessThan(1800); // JS 부동소수점 한계 확인
    expect(floorWon(200_000, 0.009)).toBe(1_800);
    expect(calculateNetPay(200_000, 1, false)!.employment).toBe(1_800);
  });

  it("국민연금·건강보험 포함 시 4대보험 항목이 추가된다", () => {
    const r = calculateNetPay(200_000, 10, true)!;
    expect(r.nationalPension).toBe(95_000);
    expect(r.healthInsurance).toBe(71_900);
    expect(r.longTermCare).toBe(9_447);
    expect(r.net).toBe(r.total - r.totalDeduction);
  });

  it("공제 합계는 항목 합과 같다 (회귀 방지)", () => {
    const r = calculateNetPay(280_000, 22, true)!;
    const sum = r.employment + r.incomeTax + r.localIncomeTax + r.nationalPension + r.healthInsurance + r.longTermCare;
    expect(r.totalDeduction).toBe(sum);
  });
});

describe("clampDays", () => {
  it("1~31일 범위로 제한", () => {
    expect(clampDays(0)).toBe(1);
    expect(clampDays(32)).toBe(31);
    expect(clampDays(5.7)).toBe(5);
  });
});
