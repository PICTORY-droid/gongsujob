import { describe, expect, it } from "vitest";
import { getAvatarInitial, isEmployer, isProfileComplete } from "@/domain/profile";
import { formatPay, formatPhoneInput, isValidPhone, parseAmount } from "@/domain/format";
import { safeRedirectPath } from "@/domain/redirect";

describe("isProfileComplete", () => {
  const complete = { user_type: "구직자", name: "홍길동", phone: "010-1234-5678", address: "서울" } as const;

  it("4개 필수 항목이 모두 있으면 true", () => {
    expect(isProfileComplete(complete)).toBe(true);
  });

  it.each(["user_type", "name", "phone", "address"] as const)("%s 가 비면 false", (key) => {
    expect(isProfileComplete({ ...complete, [key]: "" })).toBe(false);
  });

  it("null/undefined 프로필은 false", () => {
    expect(isProfileComplete(null)).toBe(false);
    expect(isProfileComplete(undefined)).toBe(false);
  });
});

describe("isEmployer / getAvatarInitial", () => {
  it("구인자만 true", () => {
    expect(isEmployer("구인자")).toBe(true);
    expect(isEmployer("구직자")).toBe(false);
    expect(isEmployer(null)).toBe(false);
  });

  it("이름 → 이메일 대문자 → U 순으로 이니셜을 고른다", () => {
    expect(getAvatarInitial("김서인", "a@b.com")).toBe("김");
    expect(getAvatarInitial(null, "abc@b.com")).toBe("A");
    expect(getAvatarInitial(null, null)).toBe("U");
  });
});

describe("format", () => {
  it("휴대전화 입력을 단계별로 하이픈 처리하고 11자리로 자른다", () => {
    expect(formatPhoneInput("010")).toBe("010");
    expect(formatPhoneInput("0101234")).toBe("010-1234");
    expect(formatPhoneInput("01012345678999")).toBe("010-1234-5678");
    expect(formatPhoneInput("010-12ab34")).toBe("010-1234");
  });

  it("10자리 이상이면 유효한 전화번호", () => {
    expect(isValidPhone("010-123-4567")).toBe(true);
    expect(isValidPhone("010-123")).toBe(false);
  });

  it("금액이 없으면 협의, 있으면 천 단위 구분", () => {
    expect(formatPay(0)).toBe("협의");
    expect(formatPay(null)).toBe("협의");
    expect(formatPay(170000)).toBe("170,000원");
  });

  it("쉼표가 들어간 금액 문자열을 정수로", () => {
    expect(parseAmount("280,000")).toBe(280000);
    expect(Number.isNaN(parseAmount("abc"))).toBe(true);
  });
});

describe("safeRedirectPath (오픈 리다이렉트 방지)", () => {
  it("같은 사이트 상대 경로는 허용", () => {
    expect(safeRedirectPath("/jobs/123")).toBe("/jobs/123");
    expect(safeRedirectPath("/mypage?tab=1")).toBe("/mypage?tab=1");
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/ok\nSet-Cookie:x"])(
    "외부·위험 경로 %s 는 기본값으로 대체",
    (value) => {
      expect(safeRedirectPath(value, "/")).toBe("/");
    },
  );

  it("값이 없으면 기본값", () => {
    expect(safeRedirectPath(null, "/home")).toBe("/home");
  });
});
