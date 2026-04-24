"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase.from("jobs").select("*").eq("id", id).single();
      setJob(data);
      setLoading(false);
    };
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from("applications")
          .select("id").eq("job_id", id).eq("user_id", user.id).single();
        if (data) setApplied(true);
      }
    };
    fetchJob();
    getUser();
  }, [id]);

  const handleApply = async () => {
    if (!user) { window.location.href = "/login"; return; }
    if (applied) return;
    setApplying(true);
    try {
      const { error } = await supabase.from("applications").insert({
        job_id: id, user_id: user.id, status: "지원완료",
      });
      if (error) { setMessage("지원 실패: " + error.message); return; }
      setApplied(true);
      setMessage("지원이 완료됐습니다.");
    } catch { setMessage("오류가 발생했습니다."); }
    finally { setApplying(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
      <div style={{ fontSize: "14px", color: "#999" }}>불러오는 중...</div>
    </div>
  );

  if (!job) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>😅</div>
        <div style={{ fontSize: "15px", color: "#999" }}>공고를 찾을 수 없습니다</div>
        <Link href="/jobs" style={{ display: "inline-block", marginTop: "16px", padding: "10px 24px", background: "#FF6B00", color: "#fff", borderRadius: "10px", textDecoration: "none", fontSize: "14px" }}>목록으로</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Apple SD Gothic Neo', sans-serif", paddingBottom: "100px" }}>

      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/jobs" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← 목록</Link>
        <Link href="/" style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", textDecoration: "none" }}>현장공수잡</Link>
        <div style={{ width: "40px" }} />
      </header>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px" }}>

        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: job.is_urgent ? "1.5px solid #FF6B00" : "1px solid #eee" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            {job.is_urgent && <span style={{ background: "#FF6B00", color: "#fff", fontSize: "11px", borderRadius: "4px", padding: "3px 8px", fontWeight: 600 }}>긴급</span>}
            <span style={{ background: "#fff3e0", color: "#FF6B00", fontSize: "12px", borderRadius: "6px", padding: "3px 8px" }}>{job.job_type}</span>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a", marginBottom: "8px", lineHeight: 1.4 }}>{job.title}</h1>
          <div style={{ fontSize: "13px", color: "#999" }}>{job.company}</div>
        </div>

        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>근무 조건</div>
          {[
            { icon: "💰", label: "급여", value: `${job.pay?.toLocaleString()}원 (${job.pay_type})` },
            { icon: "📍", label: "지역", value: `${job.region}${job.detail_address ? " · " + job.detail_address : ""}` },
            { icon: "🔨", label: "직종", value: job.job_type },
            { icon: "👷", label: "모집인원", value: `${job.headcount}명` },
            { icon: "📅", label: "시작일", value: job.start_date },
            { icon: "📅", label: "종료일", value: job.end_date || "미정" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: i < 5 ? "1px solid #f5f5f5" : "none" }}>
              <span style={{ fontSize: "16px", marginRight: "10px" }}>{item.icon}</span>
              <span style={{ fontSize: "13px", color: "#999", width: "60px", flexShrink: 0 }}>{item.label}</span>
              <span style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>

        {job.description && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "12px" }}>상세 내용</div>
            <div style={{ fontSize: "14px", color: "#333", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{job.description}</div>
          </div>
        )}

        <div style={{ fontSize: "12px", color: "#bbb", textAlign: "center", marginBottom: "16px" }}>
          등록일: {new Date(job.created_at).toLocaleDateString("ko-KR")}
        </div>

        {message && (
          <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#276749", marginBottom: "16px" }}>
            {message}
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eee", padding: "12px 20px" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          <button onClick={handleApply} disabled={applying || applied}
            style={{ width: "100%", padding: "15px", background: applied ? "#ddd" : "#FF6B00", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: applied || applying ? "not-allowed" : "pointer" }}>
            {applied ? "지원 완료" : applying ? "지원 중..." : "지원하기"}
          </button>
        </div>
      </div>
    </div>
  );
}