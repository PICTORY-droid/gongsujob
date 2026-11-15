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
    <div style={pageShell()}>
      <Toast message={talent.toastMessage} zIndex={999} />
      {talent.selected && <ResumeDetailModal resume={talent.selected} talent={talent} />}

      <AppHeader />
      <SearchBar value={talent.searchQuery} onChange={talent.setSearchQuery} placeholder="이름, 직종, 지역 검색" />

      <div style={{ background: "#fff", padding: "12px 20px", borderBottom: `1px solid ${colors.line}` }}>
        <CategoryDropdown value={talent.category} onChange={talent.setCategory} />
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px 20px" }}>
        {talent.loading ? (
          <InlineLoading />
        ) : talent.resumes.length === 0 ? (
          <EmptyState
            icon="👷"
            text="등록된 인재가 없습니다"
            action={
              !talent.isEmployer && (
                <Link href={ROUTES.resumeWrite} style={{ display: "inline-block", marginTop: "16px", padding: "10px 24px", background: colors.brand, color: "#fff", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
                  이력서 등록하기
                </Link>
              )
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
