"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors } from "@/components/ui/theme";
import { PUBLIC_ROUTES, ROUTES } from "@/lib/constants";

const BOTTOM_TABS = [
  { icon: "🏠", label: "홈", href: ROUTES.home },
  { icon: "📋", label: "공고", href: ROUTES.jobs },
  { icon: "👷", label: "인재", href: ROUTES.resumes },
  { icon: "📝", label: "이력서", href: ROUTES.resumeWrite },
  { icon: "👤", label: "내정보", href: ROUTES.mypage },
] as const;

export function isTabActive(pathname: string, href: string): boolean {
  if (href === ROUTES.home) return pathname === ROUTES.home;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type MobileBottomNavProps = {
  userLoggedIn?: boolean;
  onRequireLogin?: () => void;
};

/** 모바일 하단 탭바. 비로그인 상태에서 보호된 탭을 누르면 로그인 안내를 띄운다. */
export default function MobileBottomNav({ userLoggedIn = true, onRequireLogin }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="하단 메뉴" className="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--gs-surface)", borderTop: `1px solid ${colors.line}`, display: "flex", padding: "8px 0", zIndex: 80 }}>
      {BOTTOM_TABS.map((tab) => {
        const active = isTabActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            onClick={(event) => {
              if (!userLoggedIn && !PUBLIC_ROUTES.includes(tab.href)) {
                event.preventDefault();
                onRequireLogin?.();
              }
            }}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textDecoration: "none" }}
          >
            <span style={{ fontSize: "20px" }}>{tab.icon}</span>
            <span style={{ fontSize: "10px", color: active ? colors.brand : colors.muted, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
