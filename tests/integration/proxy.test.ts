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
    expect(config.matcher).toEqual(["/jobs/:path*", "/mypage", "/onboarding", "/resume/:path*", "/resumes/:path*", "/manage/:path*"]);
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

describe("proxy 적용 범위", () => {
  /** Next.js matcher 문법 중 이 프로젝트가 쓰는 두 형태(정확 경로, /:path*)만 해석 */
  const matches = (path: string) =>
    (config.matcher as string[]).some((pattern) => {
      if (pattern.endsWith("/:path*")) {
        const base = pattern.slice(0, -"/:path*".length);
        return path === base || path.startsWith(`${base}/`);
      }
      return path === pattern;
    });

  it("로그인이 필요한 모든 화면이 서버 접근 검사 대상에 들어 있다 (새 화면 누락 방지)", async () => {
    const { ROUTES, PUBLIC_ROUTES } = await import("@/lib/constants");
    const loginPaths = new Set(["/login"]);
    const protectedPaths = Object.values(ROUTES)
      .map((href) => href.split("?")[0])
      .filter((path) => !PUBLIC_ROUTES.includes(path) && !loginPaths.has(path));

    const missing = protectedPaths.filter((path) => !matches(path));
    expect(missing).toEqual([]);
    expect(matches("/manage/contract/abc")).toBe(true);
  });

  it("비로그인으로 현장관리에 들어오면 로그인으로 보낸다", async () => {
    const response = await proxy(request("/manage"));
    expect(response.headers.get("location")).toContain("/login?redirectedFrom=%2Fmanage");
  });
});
