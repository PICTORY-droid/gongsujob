// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, renderHook, screen, waitFor } from "@testing-library/react";

/** 역할(구인자/구직자) 확인 전 화면이 잘못 그려졌다가 바뀌는(깜빡이는) 문제 재발 방지 */

let resolveProfile: (profile: unknown) => void = () => {};
vi.mock("@/services/auth.service", () => ({
  getCurrentUser: async () => ({ id: "u1", email: "a@b.c" }),
  onAuthUserChange: () => () => {},
}));
vi.mock("@/services/profile.service", () => ({
  getProfile: () => new Promise((resolve) => (resolveProfile = resolve)),
}));

let viewer = { role: "guest" as "guest" | "seeker" | "employer", ready: false };
vi.mock("@/hooks/useViewerRole", () => ({ useViewerRole: () => viewer }));
vi.mock("next/navigation", () => ({ usePathname: () => "/resumes" }));

const { useSession } = await import("@/hooks/useSession");
const { default: MobileBottomNav } = await import("@/components/layout/MobileBottomNav");
const { DesktopNav } = await import("@/components/layout/DesktopNav");

describe("useSession", () => {
  it("프로필을 받기 전에는 사용자도 비워 두고, 받은 뒤 한 번에 채운다", async () => {
    const seen: Array<{ user: boolean; employer: boolean; loading: boolean }> = [];
    const { result } = renderHook(() => {
      const state = useSession();
      seen.push({ user: Boolean(state.user), employer: state.isEmployer, loading: state.loading });
      return state;
    });

    // 프로필 응답 전: '로그인했지만 구직자' 같은 중간 상태가 없어야 한다
    await waitFor(() => expect(seen.length).toBeGreaterThan(0));
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);

    resolveProfile({ id: "u1", user_type: "구인자", name: "소장", phone: null, address: null, region: null, avatar_url: null });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isEmployer).toBe(true);

    expect(seen.some((s) => s.user && !s.employer)).toBe(false);
  });
});

describe("메뉴", () => {
  it("역할 확인 전에는 메뉴 항목을 그리지 않는다", () => {
    viewer = { role: "guest", ready: false };
    render(
      <>
        <DesktopNav />
        <MobileBottomNav />
      </>,
    );
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("확인 후에는 역할에 맞는 메뉴만 그린다", () => {
    viewer = { role: "employer", ready: true };
    render(<MobileBottomNav />);
    expect(screen.getAllByRole("link").map((a) => a.textContent)).toEqual(["홈", "인재찾기", "공고등록", "현장관리", "내정보"]);
  });
});
