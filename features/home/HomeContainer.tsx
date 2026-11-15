"use client";

import { useState } from "react";
import Link from "next/link";
import HomeHeader from "@/components/layout/HomeHeader";
import AppFooter from "@/components/layout/AppFooter";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import JobSummaryCard from "@/components/job/JobSummaryCard";
import { ResumeCardBody } from "@/components/resume/ResumeCard";
import { CategoryDropdown } from "@/components/ui/CategoryDropdown";
import { EmptyState, InlineLoading } from "@/components/ui/Feedback";
import { colors, fontFamily, listCard } from "@/components/ui/theme";
import { LoginRequiredModal, SectionHeading, plainButton } from "@/features/home/HomeSections";
import { HomeBanner } from "@/features/home/HomeBanner";
import { ActionCards, CategoryMenu, FeatureMenu, QuickSearch } from "@/features/home/HomeMenus";
import { getActionCards, getBannerSlides, getFeatureSection } from "@/features/home/home-menus";
import { toViewerRole } from "@/lib/navigation";
import { useSession } from "@/hooks/useSession";
import { useJobList, useResumeList } from "@/hooks/useListings";
import { signOut } from "@/services/auth.service";
import { ALL_CATEGORY, PUBLIC_ROUTES, ROUTES } from "@/lib/constants";
import type { Job, PublicResume } from "@/types/domain";

const PREVIEW_COUNT = 3;

/** 홈 컨테이너: 세션·목록 데이터와 화면 이동 규칙을 조립한다. */
export default function HomeContainer() {
  const { user, profile, isEmployer, loading: sessionLoading } = useSession({ subscribe: true });
  const [category, setCategory] = useState<string>(ALL_CATEGORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const { jobs, loading } = useJobList(category, { preview: true });
  const { resumes } = useResumeList(category);

  const role = toViewerRole(Boolean(user), isEmployer);
  const feature = getFeatureSection(role);
  // 홈 미리보기는 그대로 두고, 검색·직종 선택은 전체 목록 화면으로 보낸다
  const listRoute = isEmployer ? ROUTES.resumes : ROUTES.jobs;

  const goTo = (href: string) => {
    window.location.href = href;
  };

  /** 비로그인 사용자가 보호된 화면으로 가려 하면 로그인 안내 모달 */
  const moveProtected = (href: string) => {
    if (!user && !PUBLIC_ROUTES.includes(href)) {
      setLoginModalOpen(true);
      return;
    }
    goTo(href);
  };

  const openList = (params: Record<string, string | null>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value && query.set(key, value));
    const qs = query.toString();
    moveProtected(qs ? `${listRoute}?${qs}` : listRoute);
  };

  const handleLogout = async () => {
    await signOut();
    goTo(ROUTES.home);
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.page, fontFamily }}>
      {loginModalOpen && <LoginRequiredModal onClose={() => setLoginModalOpen(false)} onLogin={() => goTo(ROUTES.login)} />}

      <HomeHeader user={user} profile={profile} onLogout={handleLogout} ready={!sessionLoading} />
      <h1 className="gs-sr-only">현장공수잡 — 현장·기술·물류·이사·식당·공장 일용직 구인구직</h1>
      {/* 로그인·이용 유형을 확인하기 전에는 역할별 화면 대신 자리만 잡아 둔다 (화면이 바뀌며 깜빡이는 현상 방지) */}
      {sessionLoading ? (
        <HomeSkeleton />
      ) : (
        <>
      <HomeBanner key={role} slides={getBannerSlides(role)} onNavigate={moveProtected} />
      <QuickSearch
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={() => openList({ q: searchQuery.trim() || null })}
        placeholder={isEmployer ? "직종·지역으로 인재 검색" : "직종·지역·현장명으로 일자리 검색"}
      />
      <CategoryMenu
        title={isEmployer ? "어떤 인력이 필요하세요?" : "어떤 일을 찾으세요?"}
        subtitle={isEmployer ? "분야를 고르면 해당 인재만 모아 보여드립니다" : "분야를 고르면 해당 일자리만 모아 보여드립니다"}
        onSelect={(jobType) => openList({ category: jobType })}
      />
      <ActionCards cards={getActionCards(role)} onSelect={moveProtected} />

      <section className="gs-container" style={{ paddingBottom: "40px" }}>
        {!user ? (
          <GuestPreview
            jobs={jobs}
            resumes={resumes}
            loading={loading}
            onOpen={moveProtected}
          />
        ) : (
          <>
            <SectionHeading
              title={isEmployer ? "등록된 인재" : "오늘의 공고"}
              count={isEmployer ? resumes.length : jobs.length}
              action={isEmployer ? "전체 인재 →" : "전체보기 →"}
              onAction={() => moveProtected(isEmployer ? ROUTES.resumes : ROUTES.jobs)}
              extra={<CategoryDropdown value={category} onChange={setCategory} size="sm" />}
            />
            <MemberFeed employer={isEmployer} jobs={jobs} resumes={resumes} loading={loading} />
          </>
        )}
      </section>

      <FeatureMenu title={feature.title} subtitle={feature.subtitle} items={feature.items} onSelect={moveProtected} />
        </>
      )}

      <AppFooter />
      <MobileBottomNav onRequireLogin={() => setLoginModalOpen(true)} />
    </div>
  );
}

/** 로그인 확인 중 자리 표시 (배너·검색·분야 메뉴 높이만큼) */
function HomeSkeleton() {
  const block = (height: string) => ({ height, borderRadius: "var(--gs-radius-lg)", background: "linear-gradient(90deg, var(--gs-line-soft), #ffffff, var(--gs-line-soft))", backgroundSize: "200% 100%" });
  return (
    <div className="gs-container gs-skeleton" aria-busy="true" aria-label="불러오는 중" style={{ paddingBlock: "clamp(16px, 3vw, 28px)", display: "grid", gap: "16px" }}>
      <div style={block("clamp(240px, 30vw, 340px)")} />
      <div style={block("58px")} />
      <div style={block("clamp(260px, 22vw, 300px)")} />
    </div>
  );
}

type FeedProps = {
  jobs: Job[];
  resumes: PublicResume[];
  loading: boolean;
};

/** 비로그인: 공고·인재 미리보기 각 3건 */
function GuestPreview({ jobs, resumes, loading, onOpen }: FeedProps & { onOpen: (href: string) => void }) {
  return (
    <div className="gs-split">
      <div>
        <SectionHeading title="공고 미리보기" count={jobs.length} action="전체보기 →" onAction={() => onOpen(ROUTES.jobs)} />
        {loading ? (
          <InlineLoading padding="32px" />
        ) : jobs.length === 0 ? (
          <EmptyState icon="📋" text="등록된 공고가 없습니다" boxed padding="32px 20px" iconSize="28px" textSize="14px" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {jobs.slice(0, PREVIEW_COUNT).map((job) => (
              <button key={job.id} type="button" onClick={() => onOpen(`/jobs/${job.id}`)} style={plainButton}>
                <JobSummaryCard job={job} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHeading title="인재 미리보기" count={resumes.length} action="전체 인재 →" onAction={() => onOpen(ROUTES.resumes)} />
        {resumes.length === 0 ? (
          <EmptyState icon="👷" text="등록된 인재가 없습니다" boxed padding="32px 20px" iconSize="28px" textSize="14px" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {resumes.slice(0, PREVIEW_COUNT).map((resume) => (
              <button key={resume.id} type="button" onClick={() => onOpen(ROUTES.resumes)} style={{ ...listCard, width: "100%", textAlign: "left", cursor: "pointer" }}>
                <ResumeCardBody resume={resume} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 로그인: 구인자는 인재 목록, 구직자는 공고 목록 */
function MemberFeed({ employer, jobs, resumes, loading }: FeedProps & { employer: boolean }) {
  if (loading) return <InlineLoading />;

  const empty = employer ? resumes.length === 0 : jobs.length === 0;
  if (empty) {
    return (
      <EmptyState
        icon={employer ? "👷" : "📋"}
        text={employer ? "등록된 인재가 없습니다" : "등록된 공고가 없습니다"}
        padding="40px 20px"
        iconSize="32px"
        textSize="14px"
      />
    );
  }

  return (
    <div className="gs-card-grid">
      {employer
        ? resumes.map((resume) => (
            <Link key={resume.id} href={ROUTES.resumes} style={{ ...listCard, textDecoration: "none" }}>
              <ResumeCardBody resume={resume} />
            </Link>
          ))
        : jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
              <JobSummaryCard job={job} />
            </Link>
          ))}
    </div>
  );
}
