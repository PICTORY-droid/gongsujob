"use client";

import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import JobCard from "@/components/job/JobCard";
import { CategoryDropdown } from "@/components/ui/CategoryDropdown";
import { EmptyState, InlineLoading } from "@/components/ui/Feedback";
import { SearchBar } from "@/components/ui/SearchBar";
import { colors, pageShell } from "@/components/ui/theme";
import { useSession } from "@/hooks/useSession";
import { useJobList } from "@/hooks/useListings";
import { filterJobs } from "@/domain/search";
import { ALL_CATEGORY } from "@/lib/constants";

/** 공고 목록 컨테이너: 직종 필터 + 검색 */
export default function JobListContainer() {
  const { user } = useSession({ requireAuth: true });
  const [category, setCategory] = useState<string>(ALL_CATEGORY);
  const [searchQuery, setSearchQuery] = useState("");
  const { jobs, loading } = useJobList(category, { enabled: Boolean(user) });

  const filtered = filterJobs(jobs, searchQuery);

  return (
    <div style={pageShell()}>
      <AppHeader />
      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="직종 또는 지역 검색" />

      <div style={{ background: "#fff", padding: "12px 20px", borderBottom: `1px solid ${colors.line}` }}>
        <CategoryDropdown value={category} onChange={setCategory} />
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px 20px" }}>
        {loading ? (
          <InlineLoading />
        ) : filtered.length === 0 ? (
          <EmptyState icon="📋" text="등록된 공고가 없습니다" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
}
