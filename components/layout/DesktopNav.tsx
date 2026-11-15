"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors } from "@/components/ui/theme";
import { useViewerRole } from "@/hooks/useViewerRole";
import { getActiveHref, getDesktopNavItems } from "@/lib/navigation";

/**
 * PC 상단 메뉴 (768px 이상에서만 표시).
 * 모바일 하단 탭과 같은 메뉴 목록을 쓰므로 화면 크기가 바뀌어도 메뉴 구성이 같다.
 */
export function DesktopNav() {
  const pathname = usePathname();
  const { role } = useViewerRole();
  const items = getDesktopNavItems(role);
  const activeHref = getActiveHref(pathname, items);

  return (
    <nav aria-label="주 메뉴" className="gs-desktop-only" style={{ alignItems: "center", gap: "4px" }}>
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "14px", fontWeight: active ? 700 : 500, color: active ? colors.navy : colors.text, background: active ? colors.blueSoft : "transparent", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
