import Image from "next/image";
import Link from "next/link";
import { colors } from "@/components/ui/theme";
import { ROUTES } from "@/lib/constants";

type AppHeaderProps = {
  backHref?: string;
  backLabel?: string;
  title?: string;
  rightSpace?: number;
};

/** 하위 페이지 공통 헤더: 뒤로가기 · 로고 */
export default function AppHeader({ backHref = ROUTES.home, backLabel = "← 홈", title = "현장공수잡", rightSpace = 40 }: AppHeaderProps) {
  return (
    <header className="gs-header-inset" style={{ background: "var(--gs-surface)", borderBottom: `1px solid ${colors.line}`, padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      <Link href={backHref} style={{ fontSize: "13px", color: colors.sub, textDecoration: "none" }}>
        {backLabel}
      </Link>

      <Link href={ROUTES.home} style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
        <Image src="/logo.png" alt="로고" width={28} height={28} style={{ borderRadius: "6px", objectFit: "cover" }} />
        <span style={{ fontSize: "16px", fontWeight: 700, color: colors.ink }}>{title}</span>
      </Link>

      <div style={{ width: `${rightSpace}px` }} />
    </header>
  );
}
