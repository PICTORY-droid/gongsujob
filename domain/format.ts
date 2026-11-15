/** 표시용 포맷 함수 모음 (순수 함수, 단위 테스트 대상) */

export function onlyDigits(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

/** 입력 중인 휴대전화 번호를 010-0000-0000 형태로 정리 */
export function formatPhoneInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function isValidPhone(value: string): boolean {
  return onlyDigits(value).length >= 10;
}

/** 금액 표기. 값이 없으면 "협의" */
export function formatPay(pay: number | null | undefined): string {
  if (!pay) return "협의";
  return `${Number(pay).toLocaleString()}원`;
}

export function formatWon(amount: number | null | undefined): string {
  return `${Number(amount ?? 0).toLocaleString()}원`;
}

/** "1,234" 같은 입력을 정수로. 숫자가 아니면 NaN */
export function parseAmount(value: string): number {
  return parseInt(value.replace(/,/g, ""), 10);
}
