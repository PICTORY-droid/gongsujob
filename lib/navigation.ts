import { ROUTES } from "@/lib/constants";

/**
 * 사이트 메뉴의 단일 출처.
 * 모바일 하단 탭, PC 상단 메뉴, 홈 화면 메뉴가 모두 이 목록을 그대로 쓴다.
 * (이전에는 세 곳에 따로 정의돼 있어 역할과 맞지 않는 메뉴가 보였다.)
 */

export type ViewerRole = "guest" | "seeker" | "employer";

export type NavIcon = "home" | "jobs" | "saved" | "resume" | "me" | "talent" | "post" | "manage" | "contact" | "login";

export type NavItem = { key: string; label: string; href: string; icon: NavIcon };

const ITEM = {
  home: { key: "home", label: "홈", href: ROUTES.home, icon: "home" },
  jobs: { key: "jobs", label: "일자리", href: ROUTES.jobs, icon: "jobs" },
  saved: { key: "saved", label: "찜", href: ROUTES.savedJobs, icon: "saved" },
  resume: { key: "resume", label: "내 이력서", href: ROUTES.resumeWrite, icon: "resume" },
  me: { key: "me", label: "내정보", href: ROUTES.mypage, icon: "me" },
  talent: { key: "talent", label: "인재찾기", href: ROUTES.resumes, icon: "talent" },
  post: { key: "post", label: "공고등록", href: ROUTES.jobWrite, icon: "post" },
  manage: { key: "manage", label: "현장관리", href: ROUTES.manage, icon: "manage" },
  contact: { key: "contact", label: "문의", href: ROUTES.contact, icon: "contact" },
  login: { key: "login", label: "로그인", href: ROUTES.loginForm, icon: "login" },
} as const satisfies Record<string, NavItem>;

const NAV_BY_ROLE: Record<ViewerRole, readonly NavItem[]> = {
  guest: [ITEM.home, ITEM.jobs, ITEM.talent, ITEM.contact, ITEM.login],
  seeker: [ITEM.home, ITEM.jobs, ITEM.saved, ITEM.resume, ITEM.me],
  employer: [ITEM.home, ITEM.talent, ITEM.post, ITEM.manage, ITEM.me],
};

export function getNavItems(role: ViewerRole): readonly NavItem[] {
  return NAV_BY_ROLE[role];
}

/** PC 상단 메뉴: 홈은 로고가 대신하고, 로그인은 헤더 버튼이 대신한다 */
export function getDesktopNavItems(role: ViewerRole): NavItem[] {
  return NAV_BY_ROLE[role].filter((item) => item.key !== "home" && item.key !== "login");
}

function pathOf(href: string) {
  return href.split("?")[0];
}

/**
 * 현재 경로에 해당하는 메뉴 하나를 고른다.
 * /jobs/saved 처럼 여러 메뉴(/jobs, /jobs/saved)에 걸리면 더 구체적인(긴) 경로를 우선한다.
 */
export function getActiveHref(pathname: string, items: readonly Pick<NavItem, "href">[]): string | null {
  let best: string | null = null;
  for (const { href } of items) {
    const path = pathOf(href);
    const matches = path === ROUTES.home ? pathname === ROUTES.home : pathname === path || pathname.startsWith(`${path}/`);
    if (matches && (!best || path.length > pathOf(best).length)) best = href;
  }
  return best;
}

export function toViewerRole(loggedIn: boolean, employer: boolean): ViewerRole {
  if (!loggedIn) return "guest";
  return employer ? "employer" : "seeker";
}
