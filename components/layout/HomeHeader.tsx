import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { Avatar } from "@/components/ui/Avatar";
import { getAvatarInitial } from "@/domain/profile";
import { ROUTES } from "@/lib/constants";
import type { Profile } from "@/types/domain";

type HomeHeaderProps = {
  user: User | null;
  profile: Profile | null;
  onLogout: () => void;
};

/** 홈 상단 헤더: PC 주 메뉴(DesktopNav) + 로그인 상태별 액션. 스타일은 반응형 미디어쿼리 때문에 CSS로 유지 */
export default function HomeHeader({
  user,
  profile,
  onLogout,
}: HomeHeaderProps) {
  return (
    <>
      <style>{`
        .home-header {
          background: var(--gs-surface);
          border-bottom: 1px solid var(--gs-line);
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
          color: var(--gs-ink);
          white-space: nowrap;
          letter-spacing: -0.4px;
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
          border: 1px solid var(--gs-disabled);
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: var(--gs-text);
          text-decoration: none;
          white-space: nowrap;
          line-height: 1;
          box-sizing: border-box;
          background: var(--gs-surface);
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
          color: var(--gs-surface);
          text-decoration: none;
          font-weight: 700;
          white-space: nowrap;
          line-height: 1;
          box-sizing: border-box;
          background: var(--gs-brand);
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
          background: var(--gs-brand);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gs-surface);
          font-size: 14px;
          font-weight: 700;
          overflow: hidden;
          flex-shrink: 0;
        }

        .home-profile-name {
          font-size: 13px;
          color: var(--gs-text);
          font-weight: 600;
          white-space: nowrap;
        }

        .home-logout-button {
          height: 34px;
          padding: 0 14px;
          border: 1px solid var(--gs-disabled);
          border-radius: 9px;
          font-size: 13px;
          color: var(--gs-sub);
          background: var(--gs-surface);
          cursor: pointer;
          white-space: nowrap;
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

      <header className="home-header gs-header-inset">
        <Link href={ROUTES.home} className="home-brand" style={{ textDecoration: "none" }}>
          <Image src="/logo.png" alt="" width={32} height={32} className="home-brand-logo" />
          <span className="home-brand-title">현장공수잡</span>
        </Link>

        <DesktopNav />

        <div className="home-header-actions">
          {user ? (
            <>
              <Link href={ROUTES.mypage} className="home-profile-link">
                <Avatar src={profile?.avatar_url} fallback={getAvatarInitial(profile?.name, user.email)} size={32} fontSize={14} />
                <span className="home-profile-name">{profile?.name || "내정보"}</span>
              </Link>
              <button type="button" onClick={onLogout} className="home-logout-button">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href={ROUTES.loginForm} className="home-header-link">
                로그인
              </Link>
              <Link href={ROUTES.signupForm} className="home-header-link-primary">
                회원가입
              </Link>
            </>
          )}
        </div>
      </header>
    </>
  );
}
