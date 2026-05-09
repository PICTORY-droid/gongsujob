"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";
import AppHeader from "@/components/AppHeader";

const JOB_TYPES = ["철근", "형틀", "방수", "도장", "미장", "전기", "배관", "용접", "타일", "조적", "기타"];
const REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];

export default function ResumeWritePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [hasSafetyCert, setHasSafetyCert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    birth: "",
    phone: "",
    email: "",
    address: "",
    job_type: "",
    career_years: "0",
    skills: "",
    certifications: "",
    experience: "",
    education: "",
    is_public: true,
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);

      const { data } = await supabase.from("resumes").select("*").eq("user_id", user.id).single();
      if (data) {
        setForm({
          name: data.name || "",
          birth: data.birth || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          job_type: data.job_type || "",
          career_years: String(data.career_years || "0"),
          skills: data.skills || "",
          certifications: data.certifications || "",
          experience: data.experience || "",
          education: data.education || "",
          is_public: data.is_public ?? true,
        });
        setPhotoUrl(data.photo_url || "");
        setHasSafetyCert(data.has_safety_cert ?? false);
      } else {
        const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
        if (profile?.name) setForm(prev => ({ ...prev, name: profile.name }));
      }
      setFetching(false);
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/resume_photo.${fileExt}`;
      const { error } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (error) { setMessage("사진 업로드 실패: " + error.message); return; }
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setPhotoUrl(data.publicUrl);

      await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);

      setMessage("사진 업로드 완료. 내정보 프로필에도 반영됩니다. 저장 버튼을 눌러주세요.");
    } catch { setMessage("업로드 오류가 발생했습니다."); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.job_type) { setMessage("이름과 직종은 필수입니다."); return; }
    setLoading(true); setMessage("");
    try {
      const resumeData = {
        user_id: user.id,
        name: form.name,
        birth: form.birth,
        phone: form.phone,
        email: form.email,
        address: form.address,
        job_type: form.job_type,
        career_years: parseInt(form.career_years) || 0,
        skills: form.skills,
        certifications: form.certifications,
        experience: form.experience,
        education: form.education,
        photo_url: photoUrl,
        is_public: form.is_public,
        has_safety_cert: hasSafetyCert,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase.from("resumes").select("id").eq("user_id", user.id).single();
      if (existing) {
        await supabase.from("resumes").update(resumeData).eq("user_id", user.id);
      } else {
        await supabase.from("resumes").insert(resumeData);
      }
      setMessage("✅ 이력서가 저장됐습니다.");
      setTimeout(() => { window.location.href = "/mypage"; }, 1500);
    } catch { setMessage("오류가 발생했습니다."); }
    finally { setLoading(false); }
  };

  if (fetching) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
      <div style={{ fontSize: "14px", color: "#999" }}>불러오는 중...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Apple SD Gothic Neo', sans-serif", paddingBottom: "80px" }}>

      {/* 헤더 */}
      <AppHeader backHref="/mypage" backLabel="← 내정보" rightSpace={60} />

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px" }}>

        {/* 증명사진 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div onClick={() => fileInputRef.current?.click()}
            style={{ width: "72px", height: "88px", borderRadius: "8px", background: photoUrl ? "transparent" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", border: "1px solid #eee", flexShrink: 0 }}>
            {photoUrl
              ? <img src={photoUrl} alt="증명사진" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: "28px" }}>📷</span>
            }
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>증명사진</div>
            <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>사진을 클릭해서 업로드하세요</div>
            {uploading && <div style={{ fontSize: "12px", color: "#FF6B00" }}>업로드 중...</div>}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#999" }}>이력서 공개</span>
              <input type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange}
                style={{ width: "16px", height: "16px", accentColor: "#FF6B00", cursor: "pointer" }} />
            </div>
          </div>
        </div>

        {/* 안전보건교육 이수증 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "16px 20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={hasSafetyCert}
              onChange={(e) => setHasSafetyCert(e.target.checked)}
              style={{ width: "22px", height: "22px", accentColor: "#FF6B00", flexShrink: 0, cursor: "pointer" }}
            />
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>
                🦺 건설기초 안전보건교육 이수증 보유
              </div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "3px" }}>
                이수증 미소지 시 현장 출입 불가 — 체크하면 소장님 신뢰도가 높아져요
              </div>
            </div>
          </label>
          {hasSafetyCert && (
            <div style={{ marginTop: "10px", padding: "8px 12px", background: "#f0fff4", borderRadius: "8px", border: "1px solid #9ae6b4", fontSize: "12px", color: "#276749", fontWeight: 600 }}>
              ✅ 이수증 보유 — 인재 목록에서 배지가 표시됩니다
            </div>
          )}
        </div>

        {/* 기본 정보 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>기본 정보</div>
          {[
            { label: "이름 *", name: "name", placeholder: "홍길동" },
            { label: "생년월일", name: "birth", placeholder: "예) 1985-03-15", type: "date" },
            { label: "연락처", name: "phone", placeholder: "010-0000-0000" },
            { label: "이메일", name: "email", placeholder: "example@email.com" },
          ].map(field => (
            <div key={field.name} style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>{field.label}</label>
              <input name={field.name} value={(form as any)[field.name]} onChange={handleChange}
                placeholder={field.placeholder} type={field.type || "text"}
                style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "8px" }}>활동 지역</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
              {REGIONS.map(r => (
                <button key={r} onClick={() => setForm(prev => ({ ...prev, address: r }))}
                  style={{ padding: "8px 4px", border: `1.5px solid ${form.address === r ? "#FF6B00" : "#eee"}`, borderRadius: "8px", background: form.address === r ? "#fff8f5" : "#fff", fontSize: "13px", fontWeight: form.address === r ? 700 : 400, color: form.address === r ? "#FF6B00" : "#333", cursor: "pointer" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 직종 및 경력 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>직종 및 경력</div>

          <div style={{ marginBottom: "14px" }}>
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

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>경력 (년)</label>
            <input name="career_years" value={form.career_years} onChange={handleChange}
              type="number" min="0" placeholder="0"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>보유 기술</label>
            <input name="skills" value={form.skills} onChange={handleChange}
              placeholder="예) 철근 배근, 거푸집 설치, 용접"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>자격증</label>
            <input name="certifications" value={form.certifications} onChange={handleChange}
              placeholder="예) 철근기능사, 건축산업기사"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* 경력 사항 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>경력 사항</div>
          <textarea name="experience" value={form.experience} onChange={handleChange}
            placeholder="근무한 현장, 기간, 담당 업무 등을 자유롭게 입력하세요"
            rows={4}
            style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.6 }} />
        </div>

        {/* 학력 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>학력</div>
          <input name="education" value={form.education} onChange={handleChange}
            placeholder="예) ○○고등학교 졸업"
            style={{ width: "100%", padding: "11px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>

        {message && (
          <div style={{ background: message.includes("✅") ? "#f0fff4" : "#fff3f3", border: `1px solid ${message.includes("✅") ? "#9ae6b4" : "#ffd0d0"}`, borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: message.includes("✅") ? "#276749" : "#e53e3e", marginBottom: "16px" }}>
            {message}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "15px", background: loading ? "#ddd" : "#FF6B00", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "저장 중..." : "이력서 저장하기"}
        </button>
      </div>

      {/* 하단 탭바 */}
      <MobileBottomNav />
    </div>
  );
}
