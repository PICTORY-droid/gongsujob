"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
];

const USER_TYPES = [
  { value: "구직자", icon: "👷", label: "구직자", desc: "일자리를 찾고 있어요" },
  { value: "구인자", icon: "🏗️", label: "구인자", desc: "인력이 필요해요" },
];

const isProfileComplete = (profile: any) => {
  return Boolean(
    profile?.user_type &&
    profile?.name &&
    profile?.phone &&
    profile?.address
  );
};

export default function OnboardingPage() {
  const [userType, setUserType] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (isProfileComplete(profile)) {
        window.location.href = "/";
        return;
      }

      if (profile) {
        setUserType(profile.user_type || "");
        setName(profile.name || "");
        setPhone(profile.phone || "");
        setAddress(profile.address || "");
        setRegion(profile.region || "");
      } else {
        setName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
      }

      setChecking(false);
    };

    checkUser();
  }, []);

  const formatPhone = (value: string) => {
    const onlyNumber = value.replace(/[^0-9]/g, "").slice(0, 11);

    if (onlyNumber.length <= 3) return onlyNumber;
    if (onlyNumber.length <= 7) return `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3)}`;
    return `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3, 7)}-${onlyNumber.slice(7)}`;
  };

  const handleComplete = async () => {
    if (!userType) {
      setError("구인자 또는 구직자를 선택해주세요.");
      return;
    }

    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    if (!phone.trim()) {
      setError("휴대전화번호를 입력해주세요.");
      return;
    }

    if (phone.replace(/[^0-9]/g, "").length < 10) {
      setError("휴대전화번호를 올바르게 입력해주세요.");
      return;
    }

    if (!address.trim()) {
      setError("주소를 입력해주세요.");
      return;
    }

    if (!region) {
      setError("활동 지역을 선택해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        user_type: userType,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        region,
      });

      if (error) {
        setError("저장 실패: " + error.message);
        return;
      }

      window.location.href = "/";
    } catch {
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Apple SD Gothic Neo', sans-serif" }}>
        <div style={{ fontSize: "14px", color: "#999" }}>확인 중...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Apple SD Gothic Neo', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "32px 28px", width: "100%", maxWidth: "420px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <div style={{ width: "48px", height: "48px", background: "#FF6B00", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 10px" }}>⚙</div>
          <h1 style={{ fontSize: "21px", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>첫 설정이 필요합니다</h1>
          <p style={{ fontSize: "13px", color: "#999", marginTop: "6px", lineHeight: 1.5 }}>
            서비스 이용을 위해 기본 정보를 입력해주세요.
          </p>
        </div>

        <div style={{ marginBottom: "22px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "10px" }}>이용 유형 *</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {USER_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setUserType(t.value)}
                style={{ padding: "14px", border: `2px solid ${userType === t.value ? "#FF6B00" : "#eee"}`, borderRadius: "12px", background: userType === t.value ? "#fff8f5" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}
              >
                <span style={{ fontSize: "28px" }}>{t.icon}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#1a1a1a" }}>{t.label}</div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#999", marginBottom: "6px" }}>이름 *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              style={{ width: "100%", padding: "12px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#999", marginBottom: "6px" }}>휴대전화번호 *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="010-0000-0000"
              inputMode="tel"
              autoComplete="tel"
              style={{ width: "100%", padding: "12px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#999", marginBottom: "6px" }}>주소 *</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="예, 경남 김해시 주촌면"
              autoComplete="street-address"
              style={{ width: "100%", padding: "12px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>활동 지역 *</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                style={{ padding: "10px 6px", border: `1.5px solid ${region === r ? "#FF6B00" : "#eee"}`, borderRadius: "8px", background: region === r ? "#fff8f5" : "#fff", fontSize: "14px", fontWeight: region === r ? 700 : 400, color: region === r ? "#FF6B00" : "#333", cursor: "pointer" }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: "#fff3f3", border: "1px solid #ffd0d0", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#e53e3e", marginBottom: "14px" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleComplete}
          disabled={loading}
          style={{ width: "100%", padding: "14px", background: loading ? "#ddd" : "#FF6B00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "저장 중..." : "설정 완료"}
        </button>
      </div>
    </div>
  );
}
