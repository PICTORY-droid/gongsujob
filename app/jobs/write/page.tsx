"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const JOB_TYPES = ["철근", "형틀", "방수", "도장", "미장", "전기", "배관", "용접", "타일", "조적", "기타"];
const REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const PAY_TYPES = ["일당", "월급", "협의"];

export default function JobWritePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    company: "",
    region: "",
    detail_address: "",
    job_type: "",
    pay: "",
    pay_type: "일당",
    headcount: "1",
    start_date: "",
    end_date: "",
    description: "",
    is_urgent: false,
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);
    };
    getUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.region || !form.job_type || !form.pay || !form.start_date) {
      setMessage("필수 항목을 모두 입력해주세요."); return;
    }
    setLoading(true); setMessage("");
    try {
      const { error } = await supabase.from("jobs").insert({
        user_id: user.id,
        title: form.title,
        company: form.company,
        region: form.region,
        detail_address: form.detail_address,
        job_type: form.job_type,
        pay: parseInt(form.pay.replace(/,/g, "")),
        pay_type: form.pay_type,
        headcount: parseInt(form.headcount),
        start_date: form.start_date,
        end_date: form.end_date || null,
        description: form.description,
        is_urgent: form.is_urgent,
        is_active: true,
        source: "직접등록",
      });
      if (error) { setMessage("등록 실패: " + error.message); return; }
      setMessage("✅ 공고가 등록됐습니다.");
      setTimeout(() => { window.location.href = "/jobs"; }, 1500);
    } catch { setMessage("오류가 발생했습니다."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Apple SD Gothic Neo', sans-serif", paddingBottom: "40px" }}>

      {/* 헤더 */}
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← 홈</Link>
        <Link href="/" style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", textDecoration: "none" }}>현장공수잡</Link>
        <button onClick={handleSubmit} disabled={loading}
          style={{ background: loading ? "#ddd" : "#FF6B00", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 16px", fontSize: "13px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "등록 중..." : "등록"}
        </button>
      </header>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px" }}>

        {/* 긴급 공고 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "16px 20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>긴급 공고</div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>긴급 배지가 표시됩니다</div>
          </div>
          <input type="checkbox" name="is_urgent" checked={form.is_urgent} onChange={handleChange}
            style={{ width: "20px", height: "20px", accentColor: "#FF6B00", cursor: "pointer" }} />
        </div>

        {/* 기본 정보 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>기본 정보</div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>공고 제목 *</label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="예) 철근 기능공 3명 급구"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>업체명/소장명</label>
            <input name="company" value={form.company} onChange={handleChange}
              placeholder="예) 김○○ 소장"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "8px" }}>지역 *</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
              {REGIONS.map(r => (
                <button key={r} onClick={() => setForm(prev => ({ ...prev, region: r }))}
                  style={{ padding: "8px 4px", border: `1.5px solid ${form.region === r ? "#FF6B00" : "#eee"}`, borderRadius: "8px", background: form.region === r ? "#fff8f5" : "#fff", fontSize: "13px", fontWeight: form.region === r ? 700 : 400, color: form.region === r ? "#FF6B00" : "#333", cursor: "pointer" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>상세 주소</label>
            <input name="detail_address" value={form.detail_address} onChange={handleChange}
              placeholder="예) 화성시 동탄 ○○아파트 신축현장"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "8px" }}>직종 *</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {JOB_TYPES.map(t => (
                <button key={t} onClick={() => setForm(prev => ({ ...prev, job_type: t }))}
                  style={{ padding: "8px 14px", border: `1.5px solid ${form.job_type === t ? "#FF6B00" : "#eee"}`, borderRadius: "8px", background: form.job_type === t ? "#fff8f5" : "#fff", fontSize: "13px", fontWeight: form.job_type === t ? 700 : 400, color: form.job_type === t ? "#FF6B00" : "#333", cursor: "pointer" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 급여 정보 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>급여 정보</div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "8px" }}>급여 형태</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {PAY_TYPES.map(p => (
                <button key={p} onClick={() => setForm(prev => ({ ...prev, pay_type: p }))}
                  style={{ flex: 1, padding: "10px", border: `1.5px solid ${form.pay_type === p ? "#FF6B00" : "#eee"}`, borderRadius: "8px", background: form.pay_type === p ? "#fff8f5" : "#fff", fontSize: "14px", fontWeight: form.pay_type === p ? 700 : 400, color: form.pay_type === p ? "#FF6B00" : "#333", cursor: "pointer" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>급여 (원) *</label>
            <input name="pay" value={form.pay} onChange={handleChange}
              placeholder="예) 280000"
              type="number"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>모집 인원</label>
            <input name="headcount" value={form.headcount} onChange={handleChange}
              type="number" min="1"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* 근무 일정 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>근무 일정</div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>시작일 *</label>
            <input name="start_date" value={form.start_date} onChange={handleChange}
              type="date"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>종료일 (미정이면 비워두세요)</label>
            <input name="end_date" value={form.end_date} onChange={handleChange}
              type="date"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* 상세 내용 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>상세 내용</div>
          <textarea name="description" value={form.description} onChange={handleChange}
            placeholder="근무 조건, 우대 사항, 현장 위치 등을 자유롭게 입력하세요"
            rows={5}
            style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.6 }} />
        </div>

        {message && (
          <div style={{ background: message.includes("✅") ? "#f0fff4" : "#fff3f3", border: `1px solid ${message.includes("✅") ? "#9ae6b4" : "#ffd0d0"}`, borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: message.includes("✅") ? "#276749" : "#e53e3e", marginBottom: "16px" }}>
            {message}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "15px", background: loading ? "#ddd" : "#FF6B00", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "등록 중..." : "공고 등록하기"}
        </button>
      </div>
    </div>
  );
}