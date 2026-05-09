"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
];

const AGE_RANGES = ["20대", "30대", "40대", "50대", "60대 이상"];

const USER_TYPES = [
  { value: "구직자", icon: "👷", label: "구직자", desc: "일자리를 찾고 있어요" },
  { value: "구인자", icon: "🏗️", label: "구인자", desc: "인력이 필요해요" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [region, setRegion] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = userType === "구인자" ? 2 : 3;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) { window.location.href = "/"; }
    };
    checkUser();
  }, []);

  const handleComplete = async () => {
    if (!userType || !region || (userType === "구직자" && !ageRange)) {
      setError("모든 항목을 선택해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        user_type: userType,
        region,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "익명",
      });

      if (error) { setError("저장 실패: " + error.message); return; }
      window.location.href = "/";
    } catch {
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Apple SD Gothic Neo', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "32px 28px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

        <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
          {Array.from({ length: totalSteps }).map((_, index) => {
            const s = index + 1;
            return (
              <div key={s} style={{ flex: 1, height: "4px", borderRadius: "2px", background: s <= step ? "#FF6B00" : "#eee", transition: "background 0.3s" }} />
            );
          })}
        </div>

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>어떤 분이세요?</h2>
            <p style={{ fontSize: "13px", color: "#999", marginBottom: "24px" }}>서비스 이용 유형을 선택해주세요</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {USER_TYPES.map((t) => (
                <button key={t.value} onClick={() => setUserType(t.value)}
                  style={{ padding: "16px", border: `2px solid ${userType === t.value ? "#FF6B00" : "#eee"}`, borderRadius: "12px", background: userType === t.value ? "#fff8f5" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: "all 0.2s" }}>
                  <span style={{ fontSize: "32px" }}>{t.icon}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>{t.label}</div>
                    <div style={{ fontSize: "13px", color: "#999", marginTop: "2px" }}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => userType && setStep(2)} disabled={!userType}
              style={{ width: "100%", padding: "13px", background: userType ? "#FF6B00" : "#ddd", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: userType ? "pointer" : "not-allowed", marginTop: "24px" }}>
              다음
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>활동 지역이 어디예요?</h2>
            <p style={{ fontSize: "13px", color: "#999", marginBottom: "24px" }}>
              {userType === "구인자" ? "공고를 등록할 주요 지역을 선택해주세요" : "근처 공고를 먼저 알려드릴게요"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "24px" }}>
              {REGIONS.map((r) => (
                <button key={r} onClick={() => setRegion(r)}
                  style={{ padding: "10px 6px", border: `1.5px solid ${region === r ? "#FF6B00" : "#eee"}`, borderRadius: "8px", background: region === r ? "#fff8f5" : "#fff", fontSize: "14px", fontWeight: region === r ? 700 : 400, color: region === r ? "#FF6B00" : "#333", cursor: "pointer" }}>
                  {r}
                </button>
              ))}
            </div>
            {error && <div style={{ background: "#fff3f3", border: "1px solid #ffd0d0", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#e53e3e", marginBottom: "14px" }}>{error}</div>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setStep(1)}
                style={{ flex: 1, padding: "13px", background: "#f5f5f5", color: "#666", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                이전
              </button>
              {userType === "구인자" ? (
                <button onClick={handleComplete} disabled={loading || !region}
                  style={{ flex: 2, padding: "13px", background: region && !loading ? "#FF6B00" : "#ddd", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: region && !loading ? "pointer" : "not-allowed" }}>
                  {loading ? "저장 중..." : "시작하기 🎉"}
                </button>
              ) : (
                <button onClick={() => region && setStep(3)} disabled={!region}
                  style={{ flex: 2, padding: "13px", background: region ? "#FF6B00" : "#ddd", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: region ? "pointer" : "not-allowed" }}>
                  다음
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && userType === "구직자" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>연령대가 어떻게 되세요?</h2>
            <p style={{ fontSize: "13px", color: "#999", marginBottom: "24px" }}>맞춤 공고 알림을 위해 필요합니다</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {AGE_RANGES.map((a) => (
                <button key={a} onClick={() => setAgeRange(a)}
                  style={{ padding: "13px", border: `1.5px solid ${ageRange === a ? "#FF6B00" : "#eee"}`, borderRadius: "10px", background: ageRange === a ? "#fff8f5" : "#fff", fontSize: "15px", fontWeight: ageRange === a ? 700 : 400, color: ageRange === a ? "#FF6B00" : "#333", cursor: "pointer" }}>
                  {a}
                </button>
              ))}
            </div>
            {error && <div style={{ background: "#fff3f3", border: "1px solid #ffd0d0", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#e53e3e", marginBottom: "14px" }}>{error}</div>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setStep(2)}
                style={{ flex: 1, padding: "13px", background: "#f5f5f5", color: "#666", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                이전
              </button>
              <button onClick={handleComplete} disabled={loading || !ageRange}
                style={{ flex: 2, padding: "13px", background: ageRange && !loading ? "#FF6B00" : "#ddd", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: ageRange && !loading ? "pointer" : "not-allowed" }}>
                {loading ? "저장 중..." : "시작하기 🎉"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
