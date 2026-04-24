"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(profile);

      const { data: jobs } = await supabase.from("jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setMyJobs(jobs || []);

      const { data: apps } = await supabase.from("applications").select("*, jobs(title, region, pay, pay_type)").eq("user_id", user.id).order("created_at", { ascending: false });
      setMyApplications(apps || []);

      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("이 공고를 삭제하시겠습니까?")) return;
    await supabase.from("jobs").delete().eq("id", jobId);
    setMyJobs(prev => prev.filter(j => j.id !== jobId));
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
      <div style={{ fontSize: "14px", color: "#999" }}>불러오는 중...</div>
    </div>
  );

  const isEmployer = profile?.role === "employer";

  const employerMenus = [
    { icon: "📋", label: "공고 등록", desc: "새 구인 공고 올리기", href: "/jobs/write" },
    { icon: "🏗️", label: "전체 공고 보기", desc: "등록된 모든 공고", href: "/jobs" },
    { icon: "👷", label: "인재 찾기", desc: "등록된 근로자 보기", href: "/resumes" },
  ];

  const seekerMenus = [
    { icon: "📝", label: "이력서 작성·수정", desc: "내 이력서 관리", href: "/resume/write" },
    { icon: "📋", label: "공고 보기", desc: "채용 공고 둘러보기", href: "/jobs" },
    { icon: "👷", label: "인재 찾기", desc: "다른 근로자 보기", href: "/resumes" },
  ];

  const menus = isEmployer ? employerMenus : seekerMenus;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Apple SD Gothic Neo', sans-serif", paddingBottom: "80px" }}>

      {/* 헤더 */}
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← 홈</Link>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>내 정보</span>
        <button onClick={handleLogout} style={{ fontSize: "13px", color: "#999", border: "none", background: "none", cursor: "pointer" }}>로그아웃</button>
      </header>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px" }}>

        {/* 프로필 카드 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px 20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "#fff", fontWeight: 700, overflow: "hidden", flexShrink: 0 }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : profile?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a1a" }}>{profile?.name || "이름 없음"}</div>
            <div style={{ fontSize: "13px", color: "#999", marginTop: "2px" }}>{user?.email}</div>
            <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
              <span style={{ background: isEmployer ? "#fff3e0" : "#f0f9ff", color: isEmployer ? "#FF6B00" : "#0ea5e9", fontSize: "11px", borderRadius: "6px", padding: "3px 8px", fontWeight: 600 }}>
                {isEmployer ? "🏗️ 구인자 (소장님)" : "👷 구직자"}
              </span>
              {profile?.phone && (
                <span style={{ background: "#f5f5f5", color: "#666", fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>
                  📞 {profile.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div style={{ background: "#fff", borderRadius: "16px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px 8px", fontSize: "12px", color: "#999", fontWeight: 600 }}>빠른 메뉴</div>
          {menus.map((item, i) => (
            <Link key={i} href={item.href} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", textDecoration: "none", borderTop: "1px solid #f5f5f5" }}>
              <span style={{ fontSize: "22px" }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>{item.desc}</div>
              </div>
              <span style={{ color: "#ccc", fontSize: "18px" }}>›</span>
            </Link>
          ))}
        </div>

        {/* 구인자: 내가 등록한 공고 */}
        {isEmployer && myJobs.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "12px" }}>내가 등록한 공고 ({myJobs.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {myJobs.map(job => (
                <div key={job.id} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Link href={`/jobs/${job.id}`} style={{ flex: 1, textDecoration: "none" }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{job.title}</div>
                      <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{job.region} · {job.job_type} · {job.pay?.toLocaleString()}원/{job.pay_type}</div>
                    </Link>
                    <button onClick={() => handleDeleteJob(job.id)} style={{ fontSize: "12px", color: "#e53e3e", border: "1px solid #ffd0d0", borderRadius: "6px", padding: "4px 8px", background: "#fff", cursor: "pointer", marginLeft: "8px", flexShrink: 0 }}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 구직자: 지원 현황 */}
        {!isEmployer && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "12px" }}>
              지원 현황 {myApplications.length > 0 && <span style={{ color: "#FF6B00" }}>({myApplications.length})</span>}
            </div>
            {myApplications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#999", fontSize: "13px" }}>
                아직 지원한 공고가 없습니다<br />
                <Link href="/jobs" style={{ color: "#FF6B00", textDecoration: "none", fontWeight: 600, marginTop: "8px", display: "inline-block" }}>공고 보러 가기 →</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {myApplications.map((app, i) => (
                  <div key={i} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{app.jobs?.title || "공고 없음"}</div>
                      <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{app.jobs?.region} · {app.jobs?.pay?.toLocaleString()}원/{app.jobs?.pay_type}</div>
                    </div>
                    <span style={{ background: "#f0fff4", color: "#276749", fontSize: "11px", borderRadius: "6px", padding: "3px 8px", fontWeight: 600, flexShrink: 0, marginLeft: "8px" }}>{app.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 계정 설정 */}
        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "14px 20px 8px", fontSize: "12px", color: "#999", fontWeight: 600 }}>계정</div>
          <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", background: "none", border: "none", borderTop: "1px solid #f5f5f5", cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: "22px" }}>🚪</span>
            <span style={{ fontSize: "14px", color: "#e53e3e", fontWeight: 500 }}>로그아웃</span>
          </button>
        </div>
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
            <span style={{ fontSize: "10px", color: i === 4 ? "#FF6B00" : "#999", fontWeight: i === 4 ? 600 : 400 }}>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}