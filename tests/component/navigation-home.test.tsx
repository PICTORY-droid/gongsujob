// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

let mockRole: "guest" | "seeker" | "employer" = "seeker";
let mockPath = "/jobs/saved";

vi.mock("next/navigation", () => ({ usePathname: () => mockPath }));
vi.mock("@/hooks/useViewerRole", () => ({ useViewerRole: () => ({ role: mockRole, ready: true }) }));
// Embla 는 jsdom 에 레이아웃이 없어 동작 검증 대상이 아니므로 최소 스텁으로 대체
vi.mock("embla-carousel-react", () => ({ default: () => [() => {}, undefined] }));
vi.mock("embla-carousel-autoplay", () => ({ default: () => ({}) }));

const { default: MobileBottomNav } = await import("@/components/layout/MobileBottomNav");
const { CategoryMenu, FeatureMenu } = await import("@/features/home/HomeMenus");
const { HomeBanner } = await import("@/features/home/HomeBanner");
const { getBannerSlides, getFeatureSection } = await import("@/features/home/home-menus");

describe("MobileBottomNav", () => {
  it("구직자: 역할에 맞는 탭만, 현재 위치(찜)를 표시한다", () => {
    mockRole = "seeker";
    mockPath = "/jobs/saved";
    render(<MobileBottomNav />);
    const nav = screen.getByRole("navigation", { name: "하단 메뉴" });
    const labels = within(nav).getAllByRole("link").map((a) => a.textContent);
    expect(labels).toEqual(["홈", "일자리", "찜", "내 이력서", "내정보"]);
    expect(within(nav).getByRole("link", { name: "찜" }).getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("link", { name: "일자리" }).getAttribute("aria-current")).toBeNull();
  });

  it("비로그인: 보호된 탭을 누르면 이동 대신 로그인 안내", () => {
    mockRole = "guest";
    mockPath = "/";
    const onRequireLogin = vi.fn();
    render(<MobileBottomNav onRequireLogin={onRequireLogin} />);
    fireEvent.click(screen.getByRole("link", { name: "인재찾기" }));
    expect(onRequireLogin).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("link", { name: "문의" }));
    expect(onRequireLogin).toHaveBeenCalledTimes(1);
  });
});

describe("홈 메뉴", () => {
  it("직종 메뉴: 전체 + 11개 직종, 누르면 직종을 넘긴다", () => {
    const onSelect = vi.fn();
    render(<CategoryMenu title="직종별 일자리 찾기" subtitle="" onSelect={onSelect} />);
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("button")).toHaveLength(12);
    fireEvent.click(within(list).getByRole("button", { name: "용접" }));
    expect(onSelect).toHaveBeenLastCalledWith("용접");
    fireEvent.click(within(list).getByRole("button", { name: "전체" }));
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it("기능 안내: 각 항목이 실제 화면 주소로 연결된다", () => {
    const onSelect = vi.fn();
    const section = getFeatureSection("employer");
    render(<FeatureMenu {...section} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: /노임대장 엑셀/ }));
    expect(onSelect).toHaveBeenCalledWith("/manage");
  });

  it("배너: 슬라이드 제목·버튼과 멈춤/이동 버튼을 갖는다", () => {
    const onNavigate = vi.fn();
    const slides = getBannerSlides("employer");
    render(<HomeBanner slides={slides} onNavigate={onNavigate} />);
    expect(screen.getByRole("tablist", { name: "배너 선택" }).children).toHaveLength(slides.length);
    expect(screen.getByRole("button", { name: /자동 넘김/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /현장관리 열기/ }));
    expect(onNavigate).toHaveBeenCalledWith("/manage");
  });
});
