import Link from "next/link";

type JobCardProps = {
  job: {
    id: string;
    title?: string;
    company?: string;
    region?: string;
    pay?: number;
    pay_type?: string;
    job_type?: string;
    start_date?: string;
    headcount?: number;
    detail_address?: string;
    is_urgent?: boolean;
  };
};

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
      <div style={{ background: "#fff", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: job.is_urgent ? "1.5px solid #FF6B00" : "1px solid #eee" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
              {job.is_urgent && <span style={{ background: "#FF6B00", color: "#fff", fontSize: "10px", borderRadius: "4px", padding: "2px 6px", fontWeight: 600 }}>긴급</span>}
              <span style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>{job.title}</span>
            </div>
            <div style={{ fontSize: "12px", color: "#999" }}>{job.company} · {job.region}</div>
          </div>

          <div style={{ textAlign: "right", marginLeft: "12px" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#FF6B00" }}>{job.pay?.toLocaleString()}원</div>
            <div style={{ fontSize: "11px", color: "#999" }}>{job.pay_type}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ background: "#fff3e0", color: "#FF6B00", fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>{job.job_type}</span>
          <span style={{ background: "#f5f5f5", color: "#666", fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>📅 {job.start_date}</span>
          <span style={{ background: "#f5f5f5", color: "#666", fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>👷 {job.headcount}명</span>
          {job.detail_address && <span style={{ background: "#f5f5f5", color: "#666", fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>📍 {job.detail_address}</span>}
        </div>
      </div>
    </Link>
  );
}
