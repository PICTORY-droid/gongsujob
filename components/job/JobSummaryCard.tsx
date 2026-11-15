import { colors, listCard, tag } from "@/components/ui/theme";
import { PayBlock } from "@/components/job/JobCard";
import type { Job } from "@/types/domain";

type JobSummaryData = Pick<Job, "id" | "title" | "company" | "region" | "pay" | "pay_type" | "job_type" | "start_date" | "is_urgent">;

/** 홈 화면용 공고 요약 카드 (내용만 담당, 클릭 동작은 감싸는 쪽에서 결정) */
export default function JobSummaryCard({ job }: { job: JobSummaryData }) {
  return (
    <div style={listCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div style={{ flex: 1 }}>
          {job.is_urgent && <span style={{ background: "var(--gs-danger-bg)", color: "var(--gs-danger)", fontSize: "10px", borderRadius: "4px", padding: "2px 6px", marginRight: "6px" }}>긴급</span>}
          <div style={{ fontSize: "15px", fontWeight: 700, color: colors.ink, marginBottom: "4px" }}>{job.title}</div>
          <div style={{ fontSize: "12px", color: colors.muted }}>
            {job.company} · {job.region}
          </div>
        </div>
        <PayBlock pay={job.pay} payType={job.pay_type} />
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <span style={tag("brand")}>{job.job_type}</span>
        <span style={tag()}>📅 {job.start_date}</span>
        <span style={tag()}>📍 {job.region}</span>
      </div>
    </div>
  );
}
