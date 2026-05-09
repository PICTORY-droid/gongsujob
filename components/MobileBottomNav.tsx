"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const bottomTabs = [
  { icon: "🏠", label: "홈", href: "/" },
  { icon: "📋", label: "공고", href: "/jobs" },
  { icon: "👷", label: "인재", href: "/resumes" },
  { icon: "📝", label: "이력서", href: "/resume/write" },
  { icon: "👤", label: "내정보", href: "/mypage" },
];

type MobileBottomNavProps = {
  userLoggedIn?: boolean;
  onRequireLogin?: () => void;
};

export default function MobileBottomNav({
  userLoggedIn = true,
  onRequireLogin,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eee", display: "flex", padding: "8px 0", zIndex: 80 }}>
      {bottomTabs.map((tab) => {
        const active = isActive(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={(e) => {
              const isProtected = tab.href !== "/" && tab.href !== "/contact";

              if (!userLoggedIn && isProtected) {
                e.preventDefault();
                onRequireLogin?.();
              }
            }}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textDecoration: "none" }}
          >
            <span style={{ fontSize: "20px" }}>{tab.icon}</span>
            <span style={{ fontSize: "10px", color: active ? "#FF6B00" : "#999", fontWeight: active ? 600 : 400 }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
