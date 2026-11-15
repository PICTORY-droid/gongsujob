import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Avatar } from "@/components/ui/Avatar";
import { card, colors } from "@/components/ui/theme";
import { getAvatarInitial } from "@/domain/profile";
import { ROUTES } from "@/lib/constants";
import type { ApplicationWithJob, Job, Profile } from "@/types/domain";

/** 내정보 화면 표시 컴포넌트 (상태 없음) */

export function ProfileSummary({ user, profile, employer }: { user: User | null; profile: Profile | null; employer: boolean }) {
  return (
    <div style={{ ...card, padding: "24px 20px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
      <Avatar src={profile?.avatar_url} fallback={getAvatarInitial(profile?.name, user?.email)} size={64} fontSize={24} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "18px", fontWeight: 700, color: colors.ink }}>{profile?.name || "이름 없음"}</div>
        <div style={{ fontSize: "13px", color: colors.muted, marginTop: "2px" }}>{user?.email}</div>
        <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
          <span style={{ background: employer ? colors.brandTint : colors.infoBg, color: employer ? colors.brand : colors.info, fontSize: "11px", borderRadius: "6px", padding: "3px 8px", fontWeight: 600 }}>{employer ? "🏗️ 구인자 (소장님)" : "👷 구직자"}</span>
          {profile?.phone && <span style={{ background: colors.lineSoft, color: colors.sub, fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>📞 {profile.phone}</span>}
        </div>
      </div>
    </div>
  );
}

export function PrivacyNotice({ employer }: { employer: boolean }) {
  return (
    <div style={{ background: employer ? colors.brandSoft : colors.infoBg, border: `1px solid ${employer ? colors.brandBorder : colors.infoBorder}`, borderRadius: "16px", padding: "16px 18px", marginBottom: "12px" }}>
      <div style={{ fontSize: "14px", fontWeight: 800, color: colors.ink, marginBottom: "6px" }}>{employer ? "🔐 인재 연락처 보호 안내" : "🔐 내 연락처 공개 안내"}</div>
      <div style={{ fontSize: "13px", color: colors.sub, lineHeight: 1.6 }}>
        {employer ? (
          "구직자의 연락처는 바로 공개되지 않습니다. 구인자는 포지션 제안을 보낼 수 있고, 구직자가 제안을 수락한 경우에만 연락처를 확인할 수 있습니다."
        ) : (
          <>
            제안을 수락한 경우에만 구인자에게 연락처가 공개됩니다.
            <br />
            수락 전에는 연락처가 공개되지 않습니다.
          </>
        )}
      </div>
    </div>
  );
}

type MenuItem = { icon: string; label: string; desc: string; href?: string; action?: "offers" };

const EMPLOYER_MENUS: MenuItem[] = [
  { icon: "📋", label: "공고 등록", desc: "새 구인 공고 올리기", href: ROUTES.jobWrite },
  { icon: "🏗️", label: "전체 공고 보기", desc: "등록된 모든 공고", href: ROUTES.jobs },
  { icon: "👷", label: "인재 찾기", desc: "등록된 근로자 보기", href: ROUTES.resumes },
  { icon: "💼", label: "포지션 제안 관리", desc: "보낸 제안 이력 확인", action: "offers" },
];

const SEEKER_MENUS: MenuItem[] = [
  { icon: "📝", label: "이력서 작성·수정", desc: "내 이력서 관리", href: ROUTES.resumeWrite },
  { icon: "📋", label: "공고 보기", desc: "채용 공고 둘러보기", href: ROUTES.jobs },
  { icon: "💼", label: "포지션 제안 관리", desc: "받은 제안 확인", action: "offers" },
];

const menuRow = { display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", borderTop: `1px solid ${colors.lineSoft}` } as const;

function MenuRowContent({ item }: { item: MenuItem }) {
  return (
    <>
      <span style={{ fontSize: "22px" }}>{item.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "14px", color: colors.ink, fontWeight: 600 }}>{item.label}</div>
        <div style={{ fontSize: "12px", color: colors.muted, marginTop: "1px" }}>{item.desc}</div>
      </div>
      <span style={{ color: "var(--gs-muted)", fontSize: "18px" }}>›</span>
    </>
  );
}

export function QuickMenu({ employer, onOpenOffers }: { employer: boolean; onOpenOffers: () => void }) {
  const menus = employer ? EMPLOYER_MENUS : SEEKER_MENUS;
  return (
    <nav aria-label="빠른 메뉴" style={{ ...card, marginBottom: "12px", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 8px", fontSize: "12px", color: colors.muted, fontWeight: 600 }}>빠른 메뉴</div>
      {menus.map((item) =>
        item.action === "offers" ? (
          <button key={item.label} type="button" onClick={onOpenOffers} style={{ ...menuRow, width: "100%", background: "none", border: "none", borderTop: menuRow.borderTop, cursor: "pointer", textAlign: "left" }}>
            <MenuRowContent item={item} />
          </button>
        ) : (
          <Link key={item.label} href={item.href ?? ROUTES.home} style={{ ...menuRow, textDecoration: "none" }}>
            <MenuRowContent item={item} />
          </Link>
        ),
      )}
    </nav>
  );
}

export function MyJobsSection({ jobs, onDelete }: { jobs: Job[]; onDelete: (jobId: string) => void }) {
  if (jobs.length === 0) return null;
  return (
    <section style={{ ...card, padding: "20px", marginBottom: "12px" }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: colors.ink, marginBottom: "12px" }}>내가 등록한 공고 ({jobs.length})</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {jobs.map((job) => (
          <div key={job.id} style={{ border: `1px solid ${colors.line}`, borderRadius: "10px", padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Link href={`/jobs/${job.id}`} style={{ flex: 1, textDecoration: "none" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: colors.ink }}>{job.title}</div>
                <div style={{ fontSize: "12px", color: colors.muted, marginTop: "2px" }}>
                  {job.region} · {job.job_type} · {job.pay?.toLocaleString()}원/{job.pay_type}
                </div>
              </Link>
              <button type="button" onClick={() => onDelete(job.id)} style={{ fontSize: "12px", color: colors.danger, border: `1px solid ${colors.dangerBorder}`, borderRadius: "6px", padding: "4px 8px", background: "var(--gs-surface)", cursor: "pointer", marginLeft: "8px", flexShrink: 0 }}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ApplicationsSection({ applications }: { applications: ApplicationWithJob[] }) {
  return (
    <section style={{ ...card, padding: "20px", marginBottom: "12px" }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: colors.ink, marginBottom: "12px" }}>
        지원 현황 {applications.length > 0 && <span style={{ color: colors.brand }}>({applications.length})</span>}
      </div>
      {applications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: colors.muted, fontSize: "13px" }}>
          아직 지원한 공고가 없습니다
          <br />
          <Link href={ROUTES.jobs} style={{ color: colors.brand, textDecoration: "none", fontWeight: 600, marginTop: "8px", display: "inline-block" }}>
            공고 보러 가기 →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {applications.map((app) => (
            <div key={app.id} style={{ border: `1px solid ${colors.line}`, borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: colors.ink }}>{app.jobs?.title || "공고 없음"}</div>
                <div style={{ fontSize: "12px", color: colors.muted, marginTop: "2px" }}>
                  {app.jobs?.region} · {app.jobs?.pay?.toLocaleString()}원/{app.jobs?.pay_type}
                </div>
              </div>
              <span style={{ background: colors.successBg, color: colors.success, fontSize: "11px", borderRadius: "6px", padding: "3px 8px", fontWeight: 600, flexShrink: 0, marginLeft: "8px" }}>{app.status}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function AccountSection({ onLogout }: { onLogout: () => void }) {
  return (
    <section style={{ ...card, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 8px", fontSize: "12px", color: colors.muted, fontWeight: 600 }}>계정</div>
      <button type="button" onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", background: "none", border: "none", borderTop: `1px solid ${colors.lineSoft}`, cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: "22px" }}>🚪</span>
        <span style={{ fontSize: "14px", color: colors.danger, fontWeight: 500 }}>로그아웃</span>
      </button>
    </section>
  );
}
