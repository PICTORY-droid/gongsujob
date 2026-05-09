"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MobileBottomNav from "@/components/MobileBottomNav";

const JOB_CATEGORIES = ["전체", "철근", "형틀", "방수", "도장", "미장", "전기", "배관", "용접", "타일", "조적", "기타"];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.from("profiles").select("*").eq("id", session.user.id).single()
          .then(({ data }) => setProfile(data));
      } else {
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchResumes();
  }, [selectedCategory]);

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from("active_jobs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6);
    if (selectedCategory !== "전체") {
      query = query.eq("job_type", selectedCategory);
    }
    const { data, error } = await query;
    if (!error && data) setJobs(data);
    setLoading(false);
  };

  const fetchResumes = async () => {
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
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  };

  const isEmployer = profile?.user_type === "구인자";

  const filteredJobs = jobs.filter(job =>
    job.title?.includes(searchQuery) || job.region?.includes(searchQuery)
  );

  const filteredResumes = resumes.filter(resume =>
    resume.name?.includes(searchQuery) ||
    resume.job_type?.includes(searchQuery) ||
    resume.address?.includes(searchQuery) ||
    resume.skills?.includes(searchQuery)
  );

  const filtered = isEmployer ? filteredResumes : filteredJobs;

  const actionCards = isEmployer
    ? [
        { icon: "🏗️", label: "공고 등록", desc: "인력 바로 구하기", href: "/jobs/write" },
        { icon: "👷", label: "인재 찾기", desc: "등록된 근로자 보기", href: "/resumes" },
      ]
    : [
        { icon: "📝", label: "이력서 등록", desc: "일자리 매칭 받기", href: "/resume/write" },
        { icon: "📋", label: "공고 보기", desc: "현장 일자리 찾기", href: "/jobs" },
      ];

  const bottomTabs = isEmployer
    ? [
        { icon: "🏠", label: "홈", href: "/" },
        { icon: "🏗️", label: "공고등록", href: "/jobs/write" },
        { icon: "👷", label: "인재", href: "/resumes" },
        { icon: "💬", label: "문의", href: "/contact" },
        { icon: "👤", label: "내정보", href: "/mypage" },
      ]
    : [
        { icon: "🏠", label: "홈", href: "/" },
        { icon: "📋", label: "공고", href: "/jobs" },
        { icon: "📝", label: "이력서", href: "/resume/write" },
        { icon: "💬", label: "문의", href: "/contact" },
        { icon: "👤", label: "내정보", href: "/mypage" },
      ];

  const desktopTabs = isEmployer
    ? [
        { label: "공고 등록", href: "/jobs/write" },
        { label: "인재 찾기", href: "/resumes" },
        { label: "문의하기", href: "/contact" },
        { label: "내정보", href: "/mypage" },
      ]
    : [
        { label: "공고 보기", href: "/jobs" },
        { label: "이력서 등록", href: "/resume/write" },
        { label: "문의하기", href: "/contact" },
        { label: "내정보", href: "/mypage" },
      ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Apple SD Gothic Neo', 'Pretendard', sans-serif" }}>
      <style>{`
        .desktop-header-nav {
          display: none;
        }

        @media (min-width: 769px) {
          .desktop-header-nav {
            display: flex;
          }
        }
      `}</style>

      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src="/logo.png" alt="로고" style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover" }} />
          <span style={{ fontWeight: 700, fontSize: "18px", color: "#1a1a1a" }}>현장공수잡</span>
        </div>

        {user && (
          <nav className="desktop-header-nav" style={{ alignItems: "center", gap: "18px", marginLeft: "auto", marginRight: "18px" }}>
            {desktopTabs.map((tab, i) => (
              <Link key={i} href={tab.href} style={{ fontSize: "14px", color: "#333", textDecoration: "none", fontWeight: 600 }}>
                {tab.label}
              </Link>
            ))}
          </nav>
        )}

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {user ? (
            <>
              <Link href="/mypage" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
                <div style={{ width: "32px", height: "32px", background: "#FF6B00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: 700, overflow: "hidden" }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"
                  }
                </div>
                <span style={{ fontSize: "13px", color: "#333", fontWeight: 600 }}>{profile?.name || "내정보"}</span>
              </Link>
              <button onClick={handleLogout} style={{ padding: "7px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", color: "#666", background: "#fff", cursor: "pointer" }}>로그아웃</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ padding: "7px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", color: "#333", textDecoration: "none" }}>로그인</Link>
              <Link href="/login" style={{ padding: "7px 14px", background: "#FF6B00", borderRadius: "8px", fontSize: "13px", color: "#fff", textDecoration: "none", fontWeight: 600 }}>회원가입</Link>
            </>
          )}
        </div>
      </header>

      <section style={{ background: "linear-gradient(135deg, #FF6B00 0%, #ff8c00 100%)", padding: "40px 20px", color: "#fff", textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px", lineHeight: 1.4 }}>
          {isEmployer ? <>건설 현장 인력,<br />지금 바로 구하세요</> : <>건설 현장 일자리,<br />지금 바로 찾으세요</>}
        </h1>
        <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "24px" }}>
          {isEmployer ? "직종별 인재 확인 · 현장 공고 등록 · 근로자 매칭" : "전국 건설 현장 일용직 · 당일 지급 · 소장님 직접 등록"}
        </p>
        <div style={{ background: "#fff", borderRadius: "12px", padding: "6px 6px 6px 16px", display: "flex", gap: "8px", maxWidth: "480px", margin: "0 auto" }}>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="직종 또는 지역 검색"
            style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", color: "#333", background: "transparent" }} />
          <button style={{ background: "#FF6B00", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>검색</button>
        </div>
      </section>

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

      <section style={{ padding: "20px", display: "flex", gap: "12px", maxWidth: "600px", margin: "0 auto" }}>
        {actionCards.map((item, i) => (
          <Link key={i} href={item.href} style={{ flex: 1, background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "16px", textAlign: "center", textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>{item.icon}</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>{item.label}</div>
            <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>{item.desc}</div>
          </Link>
        ))}
      </section>

      <section style={{ padding: "0 20px 80px", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
              {isEmployer ? "등록된 인재" : "오늘의 공고"} <span style={{ color: "#FF6B00" }}>{filtered.length}</span>
            </span>
            <div style={{ position: "relative" }}>
              <button onClick={(e) => { e.stopPropagation(); setDropdownOpen(prev => !prev); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", border: "1.5px solid #FF6B00", borderRadius: "8px", background: "#fff", fontSize: "12px", fontWeight: 600, color: "#FF6B00", cursor: "pointer" }}>
                {selectedCategory === "전체" ? "직종 선택" : selectedCategory}
                <span style={{ fontSize: "10px" }}>{dropdownOpen ? "▲" : "▼"}</span>
              </button>
              {dropdownOpen && (
                <div style={{ position: "absolute", top: "34px", left: 0, background: "#fff", border: "1px solid #eee", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 50, minWidth: "160px", overflow: "hidden" }}>
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
          <Link href={isEmployer ? "/resumes" : "/jobs"} style={{ fontSize: "12px", color: "#999", textDecoration: "none" }}>
            {isEmployer ? "전체 인재 →" : "전체보기 →"}
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999", fontSize: "14px" }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>{isEmployer ? "👷" : "📋"}</div>
            <div style={{ fontSize: "14px", color: "#999" }}>
              {isEmployer ? "등록된 인재가 없습니다" : "등록된 공고가 없습니다"}
            </div>
          </div>
        ) : isEmployer ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredResumes.map(resume => (
              <Link key={resume.id} href="/resumes"
                style={{ background: "#fff", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #eee", textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: resume.skills ? "10px" : "0" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: resume.photo_url ? "transparent" : "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                    {resume.photo_url
                      ? <img src={resume.photo_url} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: "20px", color: "#fff", fontWeight: 700 }}>{resume.name?.charAt(0) || "👷"}</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>{resume.name || "이름 미입력"}</div>
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
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredJobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#fff", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ flex: 1 }}>
                      {job.is_urgent && <span style={{ background: "#ffebee", color: "#e53935", fontSize: "10px", borderRadius: "4px", padding: "2px 6px", marginRight: "6px" }}>긴급</span>}
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>{job.title}</div>
                      <div style={{ fontSize: "12px", color: "#999" }}>{job.company} · {job.region}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#FF6B00" }}>{job.pay?.toLocaleString()}원</div>
                      <div style={{ fontSize: "11px", color: "#999" }}>{job.pay_type}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ background: "#fff3e0", color: "#FF6B00", fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>{job.job_type}</span>
                    <span style={{ background: "#f5f5f5", color: "#666", fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>📅 {job.start_date}</span>
                    <span style={{ background: "#f5f5f5", color: "#666", fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>📍 {job.region}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <MobileBottomNav />
    </div>
  );
}
