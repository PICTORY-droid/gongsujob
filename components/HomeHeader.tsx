import Link from "next/link";

type HeaderTab = {
  label: string;
  href: string;
};

type HomeHeaderProps = {
  user: any;
  profile: any;
  desktopTabs: HeaderTab[];
  onLogout: () => void;
};

export default function HomeHeader({
  user,
  profile,
  desktopTabs,
  onLogout,
}: HomeHeaderProps) {
  return (
    <>
      <style>{`
        .home-header {
          background: #fff;
          border-bottom: 1px solid #eee;
          padding: 0 20px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          gap: 12px;
        }

        .home-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex-shrink: 1;
        }

        .home-brand-logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .home-brand-title {
          font-weight: 800;
          font-size: 18px;
          color: #1a1a1a;
          white-space: nowrap;
          letter-spacing: -0.4px;
        }

        .home-desktop-nav {
          display: none;
          align-items: center;
          gap: 18px;
          margin-left: auto;
          margin-right: 18px;
        }

        .home-desktop-nav a {
          font-size: 14px;
          color: #333;
          text-decoration: none;
          font-weight: 600;
          white-space: nowrap;
        }

        .home-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .home-header-link {
          height: 34px;
          padding: 0 14px;
          border: 1px solid #ddd;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: #333;
          text-decoration: none;
          white-space: nowrap;
          line-height: 1;
          box-sizing: border-box;
          background: #fff;
        }

        .home-header-link-muted {
          height: 34px;
          padding: 0 8px;
          border: none;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: #666;
          text-decoration: none;
          white-space: nowrap;
          line-height: 1;
          box-sizing: border-box;
          background: transparent;
        }

        .home-header-link-primary {
          height: 34px;
          padding: 0 14px;
          border: none;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: #fff;
          text-decoration: none;
          font-weight: 700;
          white-space: nowrap;
          line-height: 1;
          box-sizing: border-box;
          background: #FF6B00;
        }

        .home-profile-link {
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          min-width: 0;
        }

        .home-profile-avatar {
          width: 32px;
          height: 32px;
          background: #FF6B00;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          overflow: hidden;
          flex-shrink: 0;
        }

        .home-profile-name {
          font-size: 13px;
          color: #333;
          font-weight: 600;
          white-space: nowrap;
        }

        .home-logout-button {
          height: 34px;
          padding: 0 14px;
          border: 1px solid #ddd;
          border-radius: 9px;
          font-size: 13px;
          color: #666;
          background: #fff;
          cursor: pointer;
          white-space: nowrap;
        }

        @media (min-width: 769px) {
          .home-desktop-nav {
            display: flex;
          }
        }

        @media (max-width: 480px) {
          .home-header {
            height: 56px;
            padding: 0 12px;
            gap: 8px;
          }

          .home-brand {
            gap: 6px;
            flex: 1;
          }

          .home-brand-logo {
            width: 26px;
            height: 26px;
          }

          .home-brand-title {
            font-size: 15px;
            line-height: 1;
          }

          .home-header-actions {
            gap: 4px;
          }

          .home-header-link-muted {
            height: 32px;
            padding: 0 6px;
            font-size: 12px;
          }

          .home-header-link {
            height: 32px;
            padding: 0 10px;
            font-size: 12px;
          }

          .home-header-link-primary {
            display: none;
          }

          .home-profile-name {
            display: none;
          }

          .home-logout-button {
            height: 32px;
            padding: 0 10px;
            font-size: 12px;
          }
        }

        @media (max-width: 340px) {
          .home-brand-title {
            font-size: 14px;
          }

          .home-header-link {
            padding: 0 8px;
          }
        }
      `}</style>

      <header className="home-header">
        <div className="home-brand">
          <img src="/logo.png" alt="로고" className="home-brand-logo" />
          <span className="home-brand-title">현장공수잡</span>
        </div>

        {user && (
          <nav className="home-desktop-nav">
            {desktopTabs.map((tab, i) => (
              <Link key={i} href={tab.href}>
                {tab.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="home-header-actions">
          {user ? (
            <>
              <Link href="/mypage" className="home-profile-link">
                <div className="home-profile-avatar">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="프로필"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    profile?.name?.charAt(0) ||
                    user.email?.charAt(0).toUpperCase() ||
                    "U"
                  )}
                </div>
                <span className="home-profile-name">{profile?.name || "내정보"}</span>
              </Link>
              <button onClick={onLogout} className="home-logout-button">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/contact" className="home-header-link-muted">
                문의
              </Link>
              <Link href="/login" className="home-header-link">
                로그인
              </Link>
              <Link href="/login" className="home-header-link-primary">
                회원가입
              </Link>
            </>
          )}
        </div>
      </header>
    </>
  );
}
