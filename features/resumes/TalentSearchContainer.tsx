"use client";

import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ResumeCard from "@/components/resume/ResumeCard";
import { CategoryDropdown } from "@/components/ui/CategoryDropdown";
import { EmptyState, InlineLoading, Toast } from "@/components/ui/Feedback";
import { SearchBar } from "@/components/ui/SearchBar";
import { colors, pageShell } from "@/components/ui/theme";
import { ResumeDetailModal } from "@/features/resumes/ResumeDetailModal";
import { useTalentSearch } from "@/features/resumes/useTalentSearch";
import { ROUTES } from "@/lib/constants";

/** 인재 찾기 컨테이너 */
export default function TalentSearchContainer() {
  const talent = useTalentSearch();

  return (
    <div style={pageShell()} className="gs-page-bottom">
      <Toast message={talent.toastMessage} zIndex={999} />
      {talent.selected && <ResumeDetailModal resume={talent.selected} talent={talent} />}

      <AppHeader />
      <SearchBar value={talent.searchQuery} onChange={talent.setSearchQuery} placeholder="이름, 직종, 지역 검색" />

      <div style={{ background: "var(--gs-surface)", padding: "12px 0", borderBottom: `1px solid ${colors.line}` }}>
        <div className="gs-container">
          <CategoryDropdown value={talent.category} onChange={talent.setCategory} size="sm" />
        </div>
      </div>

      <div className="gs-container" style={{ paddingBlock: "16px" }}>
        {talent.loading ? (
          <InlineLoading />
        ) : talent.resumes.length === 0 ? (
          <EmptyState
            icon="👷"
            text="등록된 인재가 없습니다"
            action={
              !talent.isEmployer && (
                <Link href={ROUTES.resumeWrite} style={{ display: "inline-block", marginTop: "16px", padding: "10px 24px", background: colors.brand, color: "var(--gs-surface)", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
                  이력서 등록하기
                </Link>
              )
            }
          />
        ) : (
          <div className="gs-card-grid">
            {talent.resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} onClick={() => talent.openResume(resume)} />
            ))}
          </div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
}
