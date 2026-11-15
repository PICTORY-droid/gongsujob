import { afterEach, describe, expect, it, vi } from "vitest";

/** 환경변수 검증: 잘못된 설정은 조용히 넘어가지 않고 명확한 오류로 알린다 */

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("getPublicEnv", () => {
  it("URL 형식이 아니면 설정 오류", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    const { getPublicEnv } = await import("@/lib/config/env");
    expect(() => getPublicEnv()).toThrow(/공개 환경변수 설정 오류/);
  });

  it("정상 값이면 그대로 돌려준다", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    const { getPublicEnv } = await import("@/lib/config/env");
    expect(getPublicEnv()).toEqual({ NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" });
  });
});

describe("getServerEnv", () => {
  it("비어 있는 서버 키는 null로 통일", async () => {
    vi.stubEnv("KAKAO_REST_API_KEY", "");
    vi.stubEnv("WEATHER_API_KEY", "kma");
    const { getServerEnv } = await import("@/lib/config/env");
    expect(getServerEnv()).toEqual({ KAKAO_REST_API_KEY: null, WEATHER_API_KEY: "kma" });
  });
});
