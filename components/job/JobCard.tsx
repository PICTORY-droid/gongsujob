import Link from "next/link";
import { SaveToggle } from "@/components/ui/FilterChip";
import { colors, listCard, tag } from "@/components/ui/theme";
import { getStartDayBadge, type StartDayBadge } from "@/domain/job-list";
import type { Job } from "@/types/domain";

type JobCardData = Pick<Job, "id" | "title" | "company" | "region" | "pay" | "pay_type" | "job_type" | "start_date" | "headcount" | "detail_address" | "is_urgent">;

type JobCardProps = {
  job: JobCardData;
  /** 찜 기능을 쓰는 화면에서만 넘긴다. 없으면 하트를 그리지 않는다. */
  saved?: boolean;
  onToggleSave?: () => void;
  /** 테스트에서 날짜를 고정하기 위한 기준 시각 */
  now?: Date;
};

const BADGE_STYLE: Record<NonNullable<StartDayBadge>["tone"], { background: string; color: string }> = {
  today: { background: colors.brand, color: "#fff" },
  soon: { background: colors.brandTint, color: colors.brandText },
  upcoming: { background: colors.blueSoft, color: colors.blue },
};

/** 공고 목록 카드: 일당을 가장 크게, 출근일·급구 여부를 한눈에 */
export default function JobCard({ job, saved, onToggleSave, now }: JobCardProps) {
  const badge = getStartDayBadge(job.start_date, now);

  return (
    <Link href={`/jobs/${job.id}`} style={{ textDecoration: "none", color: "inherit" }} aria-label={`${job.title}, ${job.region}, ${job.pay_type} ${job.pay?.toLocaleString()}원`}>
      <article className="gs-hover-lift gs-cq" style={{ ...listCard, height: "100%", boxSizing: "border-box", borderColor: job.is_urgent ? colors.brandBorder : colors.line }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "6px" }}>
              {job.is_urgent && <span style={{ ...badgeBase, background: colors.danger, color: "#fff" }}>급구</span>}
              {badge && <span style={{ ...badgeBase, ...BADGE_STYLE[badge.tone] }}>{badge.label}</span>}
            </div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: colors.ink, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</h3>
            <div style={{ fontSize: "13px", color: colors.muted, marginTop: "2px" }}>
              {[job.company, job.region].filter(Boolean).join(" · ")}
            </div>
          </div>
          {onToggleSave && <SaveToggle saved={Boolean(saved)} onToggle={onToggleSave} />}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", marginTop: "12px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={tag("brand")}>{job.job_type}</span>
            <span style={tag()}>{job.start_date}</span>
            {job.headcount ? <span style={tag()}>{job.headcount}명</span> : null}
            {job.detail_address && <span style={tag()}>{job.detail_address}</span>}
          </div>
          <PayBlock pay={job.pay} payType={job.pay_type} />
        </div>
      </article>
    </Link>
  );
}

const badgeBase = { fontSize: "11px", fontWeight: 700, borderRadius: "6px", padding: "3px 7px", lineHeight: 1.3 } as const;

export function PayBlock({ pay, payType }: { pay: number | null; payType: string | null }) {
  return (
    <div style={{ textAlign: "right", flexShrink: 0 }}>
      <div style={{ fontSize: "12px", color: colors.muted, fontWeight: 600 }}>{payType}</div>
      <div style={{ fontSize: "19px", fontWeight: 800, color: colors.brandText, letterSpacing: "-0.02em" }}>{pay?.toLocaleString()}원</div>
    </div>
  );
}
