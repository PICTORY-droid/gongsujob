"use client";

import AppHeader from "@/components/layout/AppHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import NetPayCalculator from "@/components/job/NetPayCalculator";
import { colors } from "@/components/ui/theme";
import { ApplyBar, JobInfoCard, JobMapCard, JobWeatherCard } from "@/features/job-detail/JobDetailSections";
import { getJobAddress, useJobDetail } from "@/features/job-detail/useJobDetail";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { ROUTES } from "@/lib/constants";

function CenteredText({ text }: { text: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: colors.muted }}>{text}</div>
    </div>
  );
}

/** 공고 상세 컨테이너 */
export default function JobDetailContainer({ jobId }: { jobId: string }) {
  const detail = useJobDetail(jobId);
  const { isSaved, toggle } = useSavedJobs();
  const { job } = detail;

  if (detail.loading) return <CenteredText text="불러오는 중..." />;
  if (!job) return <CenteredText text="공고를 찾을 수 없습니다." />;

  const address = getJobAddress(job);

  return (
    <div style={{ minHeight: "100vh", background: colors.page, paddingBottom: "120px" }}>
      <AppHeader backHref={ROUTES.jobs} backLabel="← 공고목록" rightSpace={60} />

      {/* 폰: 한 줄로 쌓임 / PC: 왼쪽 공고 정보·계산기, 오른쪽 지도·날씨(스크롤 시 고정) */}
      <div className="gs-container gs-split gs-split--detail" style={{ paddingBlock: "16px", gap: "0 28px" }}>
        <div>
          <JobInfoCard job={job} address={address} saved={isSaved(job.id)} onToggleSave={() => toggle(job.id)} />
          <NetPayCalculator dailyPay={Number(job.pay)} />
        </div>
        <div className="gs-sticky-pc">
          <JobMapCard address={address} point={detail.mapPoint} staticMapUrl={detail.staticMapUrl} />
          <JobWeatherCard address={address} weather={detail.weather} loading={detail.weatherLoading} />
        </div>
      </div>

      {!detail.isEmployer && <ApplyBar applied={detail.applied} applying={detail.applying} message={detail.message} onApply={detail.apply} />}
      <MobileBottomNav />
    </div>
  );
}
