"use client";

import AppHeader from "@/components/layout/AppHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import NetPayCalculator from "@/components/job/NetPayCalculator";
import { colors } from "@/components/ui/theme";
import { ApplyBar, JobInfoCard, JobMapCard, JobWeatherCard } from "@/features/job-detail/JobDetailSections";
import { getJobAddress, useJobDetail } from "@/features/job-detail/useJobDetail";
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
  const { job } = detail;

  if (detail.loading) return <CenteredText text="불러오는 중..." />;
  if (!job) return <CenteredText text="공고를 찾을 수 없습니다." />;

  const address = getJobAddress(job);

  return (
    <div style={{ minHeight: "100vh", background: colors.page, paddingBottom: "120px" }}>
      <AppHeader backHref={ROUTES.jobs} backLabel="← 공고목록" rightSpace={60} />

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px 20px" }}>
        <JobInfoCard job={job} address={address} />
        <JobMapCard address={address} point={detail.mapPoint} staticMapUrl={detail.staticMapUrl} />
        <JobWeatherCard address={address} weather={detail.weather} loading={detail.weatherLoading} />
        <NetPayCalculator dailyPay={Number(job.pay)} />
      </div>

      {!detail.isEmployer && <ApplyBar applied={detail.applied} applying={detail.applying} message={detail.message} onApply={detail.apply} />}
      <MobileBottomNav />
    </div>
  );
}
