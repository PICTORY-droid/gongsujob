"use client";

import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import JobCard from "@/components/job/JobCard";
import { CategoryDropdown } from "@/components/ui/CategoryDropdown";
import { EmptyState, InlineLoading } from "@/components/ui/Feedback";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchBar } from "@/components/ui/SearchBar";
import { colors, pageShell } from "@/components/ui/theme";
import { useSession } from "@/hooks/useSession";
import { useJobList } from "@/hooks/useListings";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { EMPTY_JOB_FILTER, applyJobFilter, availableRegions } from "@/domain/job-list";
import { ALL_CATEGORY, REGIONS } from "@/lib/constants";

/** 공고 목록 컨테이너: 직종(서버 조회) + 검색·지역·급구·찜(화면 내 필터) */
type JobListContainerProps = { initialCategory?: string; initialQuery?: string; initialSavedOnly?: boolean };

export default function JobListContainer({ initialCategory = ALL_CATEGORY, initialQuery = "", initialSavedOnly = false }: JobListContainerProps) {
  const { user } = useSession({ requireAuth: true });
  const [category, setCategory] = useState<string>(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState<string | null>(null);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(initialSavedOnly);
  const { jobs, loading } = useJobList(category, { enabled: Boolean(user) });
  const { savedIds, isSaved, toggle } = useSavedJobs();

  const filtered = applyJobFilter(jobs, { ...EMPTY_JOB_FILTER, query, region, urgentOnly, savedOnly, savedIds });
  const regions = availableRegions(jobs, REGIONS);
  const hasFilter = Boolean(query || region || urgentOnly || savedOnly);

  const resetFilters = () => {
    setQuery("");
    setRegion(null);
    setUrgentOnly(false);
    setSavedOnly(false);
  };

  const emptyText = savedOnly ? "찜한 공고가 없습니다. 하트를 눌러 저장해 보세요" : hasFilter ? "조건에 맞는 공고가 없습니다" : "등록된 공고가 없습니다";

  return (
    <div style={pageShell()} className="gs-page-bottom">
      <AppHeader />
      <SearchBar value={query} onChange={setQuery} placeholder="공고명, 지역, 직종, 업체 검색" />

      <div style={{ background: colors.surface, padding: "12px 0", borderBottom: `1px solid ${colors.line}` }}>
        <div className="gs-container" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* 드롭다운 메뉴가 잘리지 않도록 가로 스크롤 영역 밖에 둔다 */}
          <CategoryDropdown value={category} onChange={setCategory} size="sm" />
          <div className="gs-chip-row" role="group" aria-label="공고 필터" style={{ flex: 1, minWidth: 0 }}>
            <FilterChip label="급구만" active={urgentOnly} onClick={() => setUrgentOnly((v) => !v)} />
            <FilterChip label="찜한 공고" count={savedIds.length} active={savedOnly} onClick={() => setSavedOnly((v) => !v)} />
            {regions.map((name) => (
              <FilterChip key={name} label={name} active={region === name} onClick={() => setRegion((current) => (current === name ? null : name))} />
            ))}
          </div>
        </div>
      </div>

      <div className="gs-container" style={{ paddingBlock: "16px" }}>
        {!loading && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <p style={{ margin: 0, fontSize: "13px", color: colors.sub }} aria-live="polite">
              공고 <strong style={{ color: colors.ink }}>{filtered.length}</strong>건
            </p>
            {hasFilter && (
              <button type="button" onClick={resetFilters} style={{ border: "none", background: "transparent", color: colors.blue, fontSize: "13px", fontWeight: 600, cursor: "pointer", minHeight: "36px" }}>
                필터 초기화
              </button>
            )}
          </div>
        )}

        {loading ? (
          <InlineLoading />
        ) : filtered.length === 0 ? (
          <EmptyState icon={savedOnly ? "🤍" : "📋"} text={emptyText} />
        ) : (
          <div className="gs-card-grid">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} saved={isSaved(job.id)} onToggleSave={() => toggle(job.id)} />
            ))}
          </div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
}
