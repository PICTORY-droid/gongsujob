"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
];
const AGE_RANGES = ["20대", "30대", "40대", "50대", "60대 이상"];

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setName(data.name || "");
        setRegion(data.region || "");
        setAgeRange(data.age_range || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setLoading(false);
    };
    getProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${user.id}.${fileExt}`;
      const { error } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (error) { setMessage("사진 업로드 실패: " + error.message); return; }
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      setMessage("사진이 업로드됐습니다. 저장 버튼을 눌러주세요.");
    } catch { setMessage("업로드 오류가 발생했습니다."); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true); setMessage("");
    try {
      const { error } = await supabase.from("profiles").update({
        name, region, age_range: ageRange, avatar_url: avatarUrl, updated_at: new Date().toISOString(),
      }).eq("id", user.id);
      if (error) { setMessage("저장 실패: " + error.message); return; }
      setMessage("✅ 저장됐습니다.");
    } catch { setMessage("오류가 발생했습니다."); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    if (!confirm("정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.")) return;
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
      <div style={{ fontSize: "14px", color: "#999" }}>불러오는 중...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Apple SD Gothic Neo', sans-serif", paddingBottom: "80px" }}>

      {/* 헤더 */}
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← 홈</Link>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>내 정보</span>
        <button onClick={handleSave} disabled={saving}
          style={{ background: saving ? "#ddd" : "#FF6B00", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 16px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "저장 중..." : "저장"}
        </button>
      </header>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px" }}>

        {/* 프로필 사진 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: "12px" }}>
            <div onClick={() => fileInputRef.current?.click()}
              style={{ width: "88px", height: "88px", borderRadius: "50%", background: avatarUrl ? "transparent" : "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", border: "2px solid #eee" }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "32px", color: "#fff", fontWeight: 700 }}>{name?.charAt(0) || "U"}</span>
              )}
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, background: "#FF6B00", borderRadius: "50%", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #fff" }}
              onClick={() => fileInputRef.current?.click()}>
              <span style={{ fontSize: "12px" }}>📷</span>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
          {uploading && <div style={{ fontSize: "12px", color: "#FF6B00" }}>업로드 중...</div>}
          <div style={{ fontSize: "12px", color: "#999" }}>사진을 클릭해서 변경하세요</div>
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#aaa", background: "#f5f5f5", borderRadius: "6px", padding: "4px 10px", display: "inline-block" }}>
            {profile?.user_type || ""}
          </div>
        </div>

        {/* 기본 정보 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>기본 정보</div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>닉네임</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="닉네임 입력"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>이메일</label>
            <div style={{ padding: "11px 14px", background: "#f5f5f5", borderRadius: "10px", fontSize: "14px", color: "#999" }}>{user?.email || "-"}</div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "8px" }}>지역</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
              {REGIONS.map((r) => (
                <button key={r} onClick={() => setRegion(r)}
                  style={{ padding: "8px 4px", border: `1.5px solid ${region === r ? "#FF6B00" : "#eee"}`, borderRadius: "8px", background: region === r ? "#fff8f5" : "#fff", fontSize: "13px", fontWeight: region === r ? 700 : 400, color: region === r ? "#FF6B00" : "#333", cursor: "pointer" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "8px" }}>연령대</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {AGE_RANGES.map((a) => (
                <button key={a} onClick={() => setAgeRange(a)}
                  style={{ padding: "8px 14px", border: `1.5px solid ${ageRange === a ? "#FF6B00" : "#eee"}`, borderRadius: "8px", background: ageRange === a ? "#fff8f5" : "#fff", fontSize: "13px", fontWeight: ageRange === a ? 700 : 400, color: ageRange === a ? "#FF6B00" : "#333", cursor: "pointer" }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 메시지 */}
        {message && (
          <div style={{ background: message.includes("✅") ? "#f0fff4" : "#fff3f3", border: `1px solid ${message.includes("✅") ? "#9ae6b4" : "#ffd0d0"}`, borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: message.includes("✅") ? "#276749" : "#e53e3e", marginBottom: "16px" }}>
            {message}
          </div>
        )}

        {/* 내 활동 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "14px" }}>내 활동</div>
          {[
            { icon: "📝", label: "내 이력서", href: "/resume/write" },
            { icon: "📋", label: "내가 올린 공고", href: "/jobs/my" },
            { icon: "✅", label: "지원한 공고", href: "/applications" },
          ].map((item, i) => (
            <Link key={i} href={item.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 2 ? "1px solid #f5f5f5" : "none", textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <span style={{ fontSize: "14px", color: "#333" }}>{item.label}</span>
              </div>
              <span style={{ color: "#ccc", fontSize: "16px" }}>→</span>
            </Link>
          ))}
        </div>

        {/* 로그아웃·탈퇴 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "8px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <button onClick={handleLogout}
            style={{ width: "100%", padding: "14px 0", background: "transparent", border: "none", fontSize: "14px", color: "#666", cursor: "pointer", textAlign: "left", borderBottom: "1px solid #f5f5f5" }}>
            로그아웃
          </button>
          <button onClick={handleDeleteAccount}
            style={{ width: "100%", padding: "14px 0", background: "transparent", border: "none", fontSize: "14px", color: "#e53e3e", cursor: "pointer", textAlign: "left" }}>
            회원 탈퇴
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