"use client";

import { LoadingScreen, Notice } from "@/components/ui/Feedback";
import { ChipSelect, FieldLabel } from "@/components/ui/Form";
import { colors, fontFamily } from "@/components/ui/theme";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { REGIONS, USER_TYPE_OPTIONS } from "@/lib/constants";

const onboardingInput = { width: "100%", padding: "12px 14px", border: `1px solid ${colors.line}`, borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" } as const;

/** 첫 설정 컨테이너: 이용 유형 · 이름 · 연락처 · 주소 · 활동 지역 */
export default function OnboardingContainer() {
  const { values, setField, checking, saving, error, complete } = useOnboarding();

  if (checking) return <LoadingScreen text="확인 중..." />;

  return (
    <div style={{ minHeight: "100vh", background: colors.page, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "32px 28px", width: "100%", maxWidth: "420px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <div style={{ width: "48px", height: "48px", background: colors.brand, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 10px" }}>⚙</div>
          <h1 style={{ fontSize: "21px", fontWeight: 800, color: colors.ink, margin: 0 }}>첫 설정이 필요합니다</h1>
          <p style={{ fontSize: "13px", color: colors.muted, marginTop: "6px", lineHeight: 1.5 }}>서비스 이용을 위해 기본 정보를 입력해주세요.</p>
        </div>

        <div style={{ marginBottom: "22px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: colors.ink, marginBottom: "10px" }}>이용 유형 *</div>
          <div role="radiogroup" aria-label="이용 유형" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {USER_TYPE_OPTIONS.map((option) => {
              const selected = values.userType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setField("userType", option.value)}
                  style={{ padding: "14px", border: `2px solid ${selected ? colors.brand : colors.line}`, borderRadius: "12px", background: selected ? colors.brandSoft : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}
                >
                  <span style={{ fontSize: "28px" }}>{option.icon}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: colors.ink }}>{option.label}</div>
                    <div style={{ fontSize: "12px", color: colors.muted, marginTop: "2px" }}>{option.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px" }}>
          <div>
            <FieldLabel htmlFor="onboarding-name">이름 *</FieldLabel>
            <input id="onboarding-name" value={values.name} onChange={(event) => setField("name", event.target.value)} placeholder="이름을 입력하세요" autoComplete="name" style={onboardingInput} />
          </div>
          <div>
            <FieldLabel htmlFor="onboarding-phone">휴대전화번호 *</FieldLabel>
            <input id="onboarding-phone" value={values.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="010-0000-0000" inputMode="tel" autoComplete="tel" style={onboardingInput} />
          </div>
          <div>
            <FieldLabel htmlFor="onboarding-address">주소 *</FieldLabel>
            <input id="onboarding-address" value={values.address} onChange={(event) => setField("address", event.target.value)} placeholder="예, 서울 강서구 화곡동" autoComplete="street-address" style={onboardingInput} />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: colors.muted, marginBottom: "8px" }}>활동 지역 *</div>
          <ChipSelect ariaLabel="활동 지역" options={REGIONS} value={values.region} onChange={(region) => setField("region", region)} layout="grid3" />
        </div>

        {error && <Notice message={error} tone="error" style={{ borderRadius: "8px", padding: "10px 14px", marginBottom: "14px" }} />}

        <button
          type="button"
          onClick={complete}
          disabled={saving}
          style={{ width: "100%", padding: "14px", background: saving ? "#ddd" : colors.brand, color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 800, cursor: saving ? "not-allowed" : "pointer" }}
        >
          {saving ? "저장 중..." : "설정 완료"}
        </button>
      </div>
    </div>
  );
}
