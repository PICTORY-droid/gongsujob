"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const JOB_CATEGORIES = ["전체", "철근", "형틀", "방수", "도장", "미장", "전기", "배관", "용접", "타일", "조적", "기타"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      fetchJobs();
    };
    checkAndFetch();
  }, [selectedCategory]);

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from("active_jobs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (selectedCategory !== "전체") {
      query = query.eq("job_type", selectedCategory);
    }
    const { data, error } = await query;
    if (!error && data) setJobs(data);
    setLoading(false);
  };

  const filtered = jobs.filter(job =>
    job.title?.includes(searchQuery) || job.region?.includes(searchQuery)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Apple SD Gothic Neo', sans-serif", paddingBottom: "80px" }}>

      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← 홈</Link>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
          <img src="/logo.png" alt="로고" style={{ width: "28px", height: "28px", borderRadius: "6px", objectFit: "cover" }} />
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>현장공수잡</span>
        </Link>
        <Link href="/jobs/write" style={{ background: "#FF6B00", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>+ 등록</Link>
      </header>

      <div style={{ background: "#fff", padding: "12px 20px", borderBottom: "1px solid #eee" }}>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="직종 또는 지역 검색"
          style={{ width: "100%", padding: "10px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ background: "#fff", padding: "12px 20px", borderBottom: "1px solid #eee" }}>
        <div style={{ position: "relative" }}>
          <button onClick={(e) => { e.stopPropagation(); setDropdownOpen(prev => !prev); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 16px", border: "1.5px solid #FF6B00", borderRadius: "10px", background: "#fff", fontSize: "14px", fontWeight: 600, color: "#FF6B00", cursor: "pointer" }}>
            {selectedCategory === "전체" ? "직종 선택" : selectedCategory}
            <span style={{ fontSize: "11px" }}>{dropdownOpen ? "▲" : "▼"}</span>
          </button>
          {dropdownOpen && (
            <div style={{ position: "absolute", top: "44px", left: 0, background: "#fff", border: "1px solid #eee", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 50, minWidth: "160px", overflow: "hidden" }}>
              {JOB_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setSelectedCategory(cat); setDropdownOpen(false); }}
                  style={{ display: "block", width: "100%", padding: "11px 18px", border: "none", background: selectedCategory === cat ? "#fff8f5" : "#fff", fontSize: "14px", fontWeight: selectedCategory === cat ? 700 : 400, color: selectedCategory === cat ? "#FF6B00" : "#333", cursor: "pointer", textAlign: "left" }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999", fontSize: "14px" }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
            <div style={{ fontSize: "15px", color: "#999" }}>등록된 공고가 없습니다</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
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
            ))}
          </div>
        )}
      </div>

      <nav className="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eee", display: "flex", padding: "8px 0" }}>
        {[
          { icon: "🏠", label: "홈", href: "/" },
          { icon: "📋", label: "공고", href: "/jobs" },
          { icon: "👷", label: "인재", href: "/resumes" },
          { icon: "📝", label: "이력서", href: "/resume/write" },
          { icon: "👤", label: "내정보", href: "/mypage" },
        ].map((tab, i) => (
          <Link key={i} href={tab.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textDecoration: "none" }}>
            <span style={{ fontSize: "20px" }}>{tab.icon}</span>
            <span style={{ fontSize: "10px", color: i === 1 ? "#FF6B00" : "#999", fontWeight: i === 1 ? 600 : 400 }}>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}