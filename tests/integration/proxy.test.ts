import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/** 서버 측 접근 제어(proxy.ts) 테스트: 로그인·온보딩 여부에 따른 리다이렉트 */

let user: { id: string } | null = null;
let profile: Record<string, string> | null = null;

vi.mock("@/lib/supabase/proxy", async () => {
  const { NextResponse } = await import("next/server");
  return {
    createProxySupabase: () => ({
      supabase: {
        auth: { getUser: async () => ({ data: { user } }) },
        from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: profile }) }) }) }),
      },
      getResponse: () => NextResponse.next(),
    }),
  };
});

const { proxy, config } = await import("@/proxy");
const request = (path: string) => new NextRequest(new URL(path, "http://localhost:3000"));

beforeEach(() => {
  user = null;
  profile = null;
});

describe("proxy (접근 제어)", () => {
  it("보호 경로 목록", () => {
    expect(config.matcher).toEqual(["/jobs/:path*", "/mypage", "/onboarding", "/resume/:path*", "/resumes/:path*"]);
  });

  it("비로그인 → /login?redirectedFrom=원래경로", async () => {
    const res = await proxy(request("/mypage"));
    const location = new URL(res.headers.get("location")!);
    expect(res.status).toBe(307);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("redirectedFrom")).toBe("/mypage");
  });

  it("로그인했지만 프로필 미완성 → /onboarding", async () => {
    user = { id: "u1" };
    profile = { user_type: "구직자", name: "홍길동", phone: "", address: "서울" };
    const res = await proxy(request("/jobs/abc"));
    expect(new URL(res.headers.get("location")!).pathname).toBe("/onboarding");
  });

  it("온보딩 화면 자체는 미완성이어도 통과 (무한 리다이렉트 방지)", async () => {
    user = { id: "u1" };
    const res = await proxy(request("/onboarding"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("프로필 완성 사용자는 통과", async () => {
    user = { id: "u1" };
    profile = { user_type: "구인자", name: "김소장", phone: "010-1111-2222", address: "세종" };
    const res = await proxy(request("/resumes"));
    expect(res.headers.get("location")).toBeNull();
  });
});
