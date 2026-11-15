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
import { ActionCards, HomeHero, LoginRequiredModal, SectionHeading, ServiceHighlights, plainButton } from "@/features/home/HomeSections";
import { getActionCards, getDesktopTabs } from "@/features/home/home-menus";
import { useSession } from "@/hooks/useSession";
import { useJobList, useResumeList } from "@/hooks/useListings";
import { signOut } from "@/services/auth.service";
import { filterJobs, filterResumes } from "@/domain/search";
import { ALL_CATEGORY, PUBLIC_ROUTES, ROUTES } from "@/lib/constants";
import type { Job, PublicResume } from "@/types/domain";

const PREVIEW_COUNT = 3;

/** 홈 컨테이너: 세션·목록 데이터와 화면 이동 규칙을 조립한다. */
export default function HomeContainer() {
  const { user, profile, isEmployer } = useSession({ subscribe: true });
  const [category, setCategory] = useState<string>(ALL_CATEGORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const { jobs, loading } = useJobList(category, { preview: true });
  const { resumes } = useResumeList(category);

  const filteredJobs = filterJobs(jobs, searchQuery);
  const filteredResumes = filterResumes(resumes, searchQuery);

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

  const handleLogout = async () => {
    await signOut();
    goTo(ROUTES.home);
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.page, fontFamily }}>
      {loginModalOpen && <LoginRequiredModal onClose={() => setLoginModalOpen(false)} onLogin={() => goTo(ROUTES.login)} />}

      <HomeHeader user={user} profile={profile} desktopTabs={getDesktopTabs(isEmployer)} onLogout={handleLogout} />
      <HomeHero employer={isEmployer} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <ServiceHighlights />
      <ActionCards cards={getActionCards(Boolean(user), isEmployer)} onSelect={moveProtected} />

      <section className="gs-container" style={{ paddingBottom: "80px" }}>
        {!user ? (
          <GuestPreview
            jobs={filteredJobs}
            resumes={filteredResumes}
            loading={loading}
            onOpen={moveProtected}
          />
        ) : (
          <>
            <SectionHeading
              title={isEmployer ? "등록된 인재" : "오늘의 공고"}
              count={isEmployer ? filteredResumes.length : filteredJobs.length}
              action={isEmployer ? "전체 인재 →" : "전체보기 →"}
              onAction={() => moveProtected(isEmployer ? ROUTES.resumes : ROUTES.jobs)}
              extra={<CategoryDropdown value={category} onChange={setCategory} size="sm" />}
            />
            <MemberFeed employer={isEmployer} jobs={filteredJobs} resumes={filteredResumes} loading={loading} />
          </>
        )}
      </section>

      <AppFooter />
      <MobileBottomNav userLoggedIn={Boolean(user)} onRequireLogin={() => setLoginModalOpen(true)} />
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
