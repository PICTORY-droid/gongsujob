import Link from "next/link";
import { colors, listCard, tag } from "@/components/ui/theme";
import type { Job } from "@/types/domain";

type JobCardData = Pick<Job, "id" | "title" | "company" | "region" | "pay" | "pay_type" | "job_type" | "start_date" | "headcount" | "detail_address" | "is_urgent">;

/** 공고 목록 카드 (공고 목록 화면) */
export default function JobCard({ job }: { job: JobCardData }) {
  return (
    <Link href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
      <div style={{ ...listCard, border: job.is_urgent ? `1.5px solid ${colors.brand}` : `1px solid ${colors.line}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
              {job.is_urgent && <span style={{ background: colors.brand, color: "#fff", fontSize: "10px", borderRadius: "4px", padding: "2px 6px", fontWeight: 600 }}>긴급</span>}
              <span style={{ fontSize: "15px", fontWeight: 600, color: colors.ink }}>{job.title}</span>
            </div>
            <div style={{ fontSize: "12px", color: colors.muted }}>
              {job.company} · {job.region}
            </div>
          </div>
          <PayBlock pay={job.pay} payType={job.pay_type} />
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <span style={tag("brand")}>{job.job_type}</span>
          <span style={tag()}>📅 {job.start_date}</span>
          <span style={tag()}>👷 {job.headcount}명</span>
          {job.detail_address && <span style={tag()}>📍 {job.detail_address}</span>}
        </div>
      </div>
    </Link>
  );
}

export function PayBlock({ pay, payType }: { pay: number | null; payType: string | null }) {
  return (
    <div style={{ textAlign: "right", marginLeft: "12px", flexShrink: 0 }}>
      <div style={{ fontSize: "16px", fontWeight: 700, color: colors.brand }}>{pay?.toLocaleString()}원</div>
      <div style={{ fontSize: "11px", color: colors.muted }}>{payType}</div>
    </div>
  );
}
