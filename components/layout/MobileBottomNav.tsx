"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/layout/NavIcon";
import { colors } from "@/components/ui/theme";
import { useViewerRole } from "@/hooks/useViewerRole";
import { PUBLIC_ROUTES, ROUTES } from "@/lib/constants";
import { getActiveHref, getNavItems } from "@/lib/navigation";

/** 기존 테스트·외부 사용 호환용: 단일 메뉴 활성 여부 */
export function isTabActive(pathname: string, href: string): boolean {
  return getActiveHref(pathname, [{ href }]) === href;
}

type MobileBottomNavProps = {
  onRequireLogin?: () => void;
};

/**
 * 모바일 하단 탭바 (PC에서는 숨김). 로그인 상태·이용 유형에 맞는 메뉴만 보여준다.
 * 비로그인 상태에서 보호된 메뉴를 누르면 로그인 안내를 띄운다(안내 콜백이 있을 때).
 */
export default function MobileBottomNav({ onRequireLogin }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { role, ready } = useViewerRole();
  // 역할을 확인하기 전에는 탭을 그리지 않고 높이만 유지한다
  const items = ready ? getNavItems(role) : [];
  const activeHref = getActiveHref(pathname, items);

  return (
    <nav
      aria-label="하단 메뉴"
      className="mobile-bottom-nav"
      style={{ minHeight: "61px", boxSizing: "border-box", position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.94)", backdropFilter: "saturate(180%) blur(12px)", WebkitBackdropFilter: "saturate(180%) blur(12px)", borderTop: `1px solid ${colors.line}`, display: "flex", padding: "6px 4px calc(6px + env(safe-area-inset-bottom))", zIndex: 80 }}
    >
      {items.map((item) => {
        const active = item.href === activeHref;
        const needsLogin = role === "guest" && !PUBLIC_ROUTES.includes(item.href) && item.href !== ROUTES.loginForm;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={(event) => {
              if (needsLogin && onRequireLogin) {
                event.preventDefault();
                onRequireLogin();
              }
            }}
            style={{ flex: 1, minHeight: "48px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", textDecoration: "none", color: active ? colors.navy : colors.muted }}
          >
            <NavIcon name={item.icon} active={active} />
            <span style={{ fontSize: "11px", fontWeight: active ? 700 : 500 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
