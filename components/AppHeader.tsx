import Link from "next/link";

type AppHeaderProps = {
  backHref?: string;
  backLabel?: string;
  title?: string;
  rightSpace?: number;
};

export default function AppHeader({
  backHref = "/",
  backLabel = "← 홈",
  title = "현장공수잡",
  rightSpace = 40,
}: AppHeaderProps) {
  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      <Link href={backHref} style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>
        {backLabel}
      </Link>

      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
        <img src="/logo.png" alt="로고" style={{ width: "28px", height: "28px", borderRadius: "6px", objectFit: "cover" }} />
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>{title}</span>
      </Link>

      <div style={{ width: `${rightSpace}px` }} />
    </header>
  );
}
