/**
 * 건설 일용직 실수령액 계산 (순수 함수).
 * 요율은 기존 계산기와 동일하게 유지한다.
 */
export const NET_PAY_RATES = {
  employmentInsurance: 0.009,
  dailyIncomeTaxThreshold: 150_000,
  dailyIncomeTaxRate: 0.06,
  dailyIncomeTaxCredit: 0.45,
  localIncomeTaxRatio: 0.1,
  nationalPension: 0.0475,
  healthInsurance: 0.03595,
  longTermCareOfHealth: 0.1314,
} as const;

export const MIN_DAYS = 1;
export const MAX_DAYS = 31;

export type NetPayBreakdown = {
  total: number;
  employment: number;
  incomeTax: number;
  localIncomeTax: number;
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  totalDeduction: number;
  net: number;
};

/**
 * 금액 × 요율의 원 단위 절사.
 * 부동소수점 오차(예: 200000 × 0.009 = 1799.9999…)로 1원이 덜 계산되는 문제를 막기 위해
 * 소수 6자리에서 먼저 반올림한 뒤 절사한다.
 */
export function floorWon(amount: number, rate: number): number {
  return Math.floor(Math.round(amount * rate * 1e6) / 1e6);
}

export function clampDays(days: number): number {
  return Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.floor(days)));
}

export function calculateNetPay(
  dailyPay: number,
  days: number,
  includePensionHealth: boolean,
): NetPayBreakdown | null {
  if (!dailyPay) return null;

  const r = NET_PAY_RATES;
  const daily = Number(dailyPay);
  const total = daily * days;

  const employment = floorWon(total, r.employmentInsurance);
  const dailyIncomeTax =
    daily > r.dailyIncomeTaxThreshold
      ? floorWon(daily - r.dailyIncomeTaxThreshold, r.dailyIncomeTaxRate * r.dailyIncomeTaxCredit)
      : 0;
  const incomeTax = dailyIncomeTax * days;
  const localIncomeTax = floorWon(incomeTax, r.localIncomeTaxRatio);

  const nationalPension = includePensionHealth ? floorWon(total, r.nationalPension) : 0;
  const healthInsurance = includePensionHealth ? floorWon(total, r.healthInsurance) : 0;
  const longTermCare = includePensionHealth ? floorWon(healthInsurance, r.longTermCareOfHealth) : 0;

  const totalDeduction = employment + incomeTax + localIncomeTax + nationalPension + healthInsurance + longTermCare;

  return {
    total,
    employment,
    incomeTax,
    localIncomeTax,
    nationalPension,
    healthInsurance,
    longTermCare,
    totalDeduction,
    net: total - totalDeduction,
  };
}
