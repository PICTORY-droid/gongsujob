import Image from "next/image";
import Link from "next/link";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { colors } from "@/components/ui/theme";
import { ROUTES } from "@/lib/constants";

type AppHeaderProps = {
  backHref?: string;
  backLabel?: string;
  title?: string;
  rightSpace?: number;
};

/** 하위 페이지 공통 헤더 — 폰: 뒤로가기 · 가운데 로고 / PC: 로고 · 주 메뉴 */
export default function AppHeader({ backHref = ROUTES.home, backLabel = "← 홈", title = "현장공수잡", rightSpace = 40 }: AppHeaderProps) {
  return (
    <header className="gs-header-inset gs-app-header" style={{ background: "var(--gs-surface)", borderBottom: `1px solid ${colors.line}`, padding: "0 20px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      <Link href={backHref} className="gs-mobile-only" style={{ fontSize: "14px", color: colors.sub, textDecoration: "none", minHeight: "44px", alignItems: "center" }}>
        {backLabel}
      </Link>

      <Link href={ROUTES.home} style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
        <Image src="/logo.png" alt="" width={28} height={28} style={{ borderRadius: "6px", objectFit: "cover" }} />
        <span style={{ fontSize: "16px", fontWeight: 700, color: colors.ink }}>{title}</span>
      </Link>

      <DesktopNav />
      <div className="gs-mobile-only" style={{ width: `${rightSpace}px` }} />
    </header>
  );
}
