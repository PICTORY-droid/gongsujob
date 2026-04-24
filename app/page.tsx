"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const JOB_CATEGORIES = [
  "전체", "철근", "형틀", "방수", "도장", "미장", "전기", "배관", "용접", "타일", "조적", "기타"
];

const SAMPLE_JOBS = [
  { id: "1", title: "철근 기능공 3명 급구", company: "김○○ 소장", region: "경기 화성", job_type: "철근", pay: 280000, pay_type: "일당", is_urgent: true, start_date: "2026.04.25" },
  { id: "2", title: "형틀목공 팀 구합니다", company: "박○○ 소장", region: "서울 강동", job_type: "형틀", pay: 320000, pay_type: "일당", is_urgent: false, start_date: "2026.04.28" },
  { id: "3", title: "방수 기능공 모집", company: "이○○ 소장", region: "부산 해운대", job_type: "방수", pay: 260000, pay_type: "일당", is_urgent: false, start_date: "2026.05.01" },
  { id: "4", title: "도장공 경력자 모집", company: "최○○ 소장", region: "인천 남동", job_type: "도장", pay: 240000, pay_type: "일당", is_urgent: true, start_date: "2026.04.26" },
  { id: "5", title: "전기 기능공 2명", company: "정○○ 소장", region: "대구 달서", job_type: "전기", pay: 300000, pay_type: "일당", is_urgent: false, start_date: "2026.05.02" },
  { id: "6", title: "배관 설비 기사 구함", company: "강○○ 소장", region: "경남 창원", job_type: "배관", pay: 290000, pay_type: "일당", is_urgent: false, start_date: "2026.05.03" },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = SAMPLE_JOBS.filter(job => {
    const matchCat = selectedCategory === "전체" || job.job_type === selectedCategory;
    const matchSearch = job.title.includes(searchQuery) || job.region.includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" }}>

      {/* 헤더 */}
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "32px", height: "32px", background: "#FF6B00", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚙</div>
          <span style={{ fontWeight: 700, fontSize: "18px", color: "#1a1a1a" }}>현장공수잡</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/login" style={{ padding: "7px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", color: "#333", textDecoration: "none" }}>로그인</Link>
          <Link href="/register" style={{ padding: "7px 14px", background: "#FF6B00", borderRadius: "8px", fontSize: "13px", color: "#fff", textDecoration: "none", fontWeight: 600 }}>회원가입</Link>
        </div>
      </header>

      {/* 히어로 */}
      <section style={{ background: "linear-gradient(135deg, #FF6B00 0%, #ff8c00 100%)", padding: "40px 20px", color: "#fff", textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px", lineHeight: 1.4 }}>건설 현장 일자리,<br />지금 바로 찾으세요</h1>
        <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "24px" }}>전국 건설 현장 일용직 · 당일 지급 · 소장님 직접 등록</p>

        {/* 검색창 */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "6px 6px 6px 16px", display: "flex", gap: "8px", maxWidth: "480px", margin: "0 auto" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="직종 또는 지역 검색"
            style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", color: "#333", background: "transparent" }}
          />
          <button style={{ background: "#FF6B00", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
            검색
          </button>
        </div>
      </section>

      {/* 통계 */}
      <section style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "16px 20px", display: "flex", justifyContent: "center", gap: "32px" }}>
        {[
          { num: "1,247", label: "오늘 공고" },
          { num: "8,430", label: "등록 근로자" },
          { num: "312", label: "협력 현장" },
          { num: "당일", label: "일당 지급" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#FF6B00" }}>{s.num}</div>
            <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* 빠른 메뉴 */}
      <section style={{ padding: "20px", display: "flex", gap: "12px", maxWidth: "600px", margin: "0 auto" }}>
        <Link href="/resume/write" style={{ flex: 1, background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "16px", textAlign: "center", textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "28px", marginBottom: "6px" }}>📝</div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>이력서 등록</div>
          <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>일자리 매칭 받기</div>
        </Link>
        <Link href="/jobs/write" style={{ flex: 1, background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "16px", textAlign: "center", textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "28px", marginBottom: "6px" }}>🏗️</div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>공고 등록</div>
          <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>인력 바로 구하기</div>
        </Link>
        <Link href="/resumes" style={{ flex: 1, background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "16px", textAlign: "center", textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "28px", marginBottom: "6px" }}>👷</div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>인재 찾기</div>
          <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>등록된 근로자 보기</div>
        </Link>
      </section>

      {/* 직종 필터 */}
      <section style={{ padding: "0 20px 12px", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {JOB_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", border: selectedCategory === cat ? "none" : "1px solid #ddd",
                background: selectedCategory === cat ? "#FF6B00" : "#fff",
                color: selectedCategory === cat ? "#fff" : "#555",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 공고 목록 */}
      <section style={{ padding: "0 20px 80px", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>오늘의 공고 <span style={{ color: "#FF6B00" }}>{filtered.length}</span></span>
          <Link href="/jobs" style={{ fontSize: "12px", color: "#999", textDecoration: "none" }}>전체보기 →</Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map(job => (
            <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fff", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: job.is_urgent ? "1.5px solid #FF6B00" : "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      {job.is_urgent && <span style={{ background: "#FF6B00", color: "#fff", fontSize: "10px", borderRadius: "4px", padding: "2px 6px", fontWeight: 600 }}>긴급</span>}
                      <span style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>{job.title}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#999" }}>{job.company} · {job.region}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#FF6B00" }}>{job.pay.toLocaleString()}원</div>
                    <div style={{ fontSize: "11px", color: "#999" }}>{job.pay_type}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span style={{ background: "#fff3e0", color: "#FF6B00", fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>{job.job_type}</span>
                  <span style={{ background: "#f5f5f5", color: "#666", fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>📅 {job.start_date}</span>
                  <span style={{ background: "#f5f5f5", color: "#666", fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>📍 {job.region}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 하단 탭바 */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eee", display: "flex", padding: "8px 0" }}>
        {[
          { icon: "🏠", label: "홈", href: "/" },
          { icon: "📋", label: "공고", href: "/jobs" },
          { icon: "👷", label: "인재", href: "/resumes" },
          { icon: "📝", label: "이력서", href: "/resume/write" },
          { icon: "👤", label: "내정보", href: "/mypage" },
        ].map((tab, i) => (
          <Link key={i} href={tab.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textDecoration: "none" }}>
            <span style={{ fontSize: "20px" }}>{tab.icon}</span>
            <span style={{ fontSize: "10px", color: i === 0 ? "#FF6B00" : "#999", fontWeight: i === 0 ? 600 : 400 }}>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}