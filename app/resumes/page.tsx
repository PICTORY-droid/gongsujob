"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const JOB_CATEGORIES = ["전체", "철근", "형틀", "방수", "도장", "미장", "전기", "배관", "용접", "타일", "조적", "기타"];

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchResumes();
  }, [selectedCategory]);

  const fetchResumes = async () => {
    setLoading(true);
    let query = supabase
      .from("resumes")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (selectedCategory !== "전체") {
      query = query.eq("job_type", selectedCategory);
    }

    const { data, error } = await query;
    if (!error && data) setResumes(data);
    setLoading(false);
  };

  const filtered = resumes.filter(r =>
    r.name?.includes(searchQuery) || r.job_type?.includes(searchQuery) || r.address?.includes(searchQuery)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Apple SD Gothic Neo', sans-serif", paddingBottom: "80px" }}>

      {/* 헤더 */}
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← 홈</Link>
        <Link href="/" style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", textDecoration: "none" }}>현장공수잡</Link>
        <div style={{ width: "40px" }} />
      </header>

      {/* 검색 */}
      <div style={{ background: "#fff", padding: "12px 20px", borderBottom: "1px solid #eee" }}>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="이름, 직종, 지역 검색"
          style={{ width: "100%", padding: "10px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* 직종 필터 */}
      <div style={{ background: "#fff", padding: "12px 20px", borderBottom: "1px solid #eee" }}>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {JOB_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{ padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", border: selectedCategory === cat ? "none" : "1px solid #ddd", background: selectedCategory === cat ? "#FF6B00" : "#fff", color: selectedCategory === cat ? "#fff" : "#555", flexShrink: 0 }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 인재 목록 */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999", fontSize: "14px" }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>👷</div>
            <div style={{ fontSize: "15px", color: "#999" }}>등록된 인재가 없습니다</div>
            <Link href="/resume/write" style={{ display: "inline-block", marginTop: "16px", padding: "10px 24px", background: "#FF6B00", color: "#fff", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>이력서 등록하기</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map(resume => (
              <div key={resume.id} style={{ background: "#fff", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: resume.photo_url ? "transparent" : "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                    {resume.photo_url
                      ? <img src={resume.photo_url} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: "20px", color: "#fff", fontWeight: 700 }}>{resume.name?.charAt(0) || "👷"}</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>{resume.name}</div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
                      경력 {resume.career_years || 0}년 · {resume.address || "지역 미입력"}
                    </div>
                  </div>
                  <div style={{ background: "#fff3e0", color: "#FF6B00", fontSize: "12px", borderRadius: "6px", padding: "4px 10px", fontWeight: 600 }}>
                    {resume.job_type || "직종 미입력"}
                  </div>
                </div>
                {resume.skills && (
                  <div style={{ fontSize: "12px", color: "#666", background: "#f8f9fa", borderRadius: "8px", padding: "8px 12px" }}>
                    🛠 {resume.skills}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
            <span style={{ fontSize: "10px", color: i === 2 ? "#FF6B00" : "#999", fontWeight: i === 2 ? 600 : 400 }}>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}