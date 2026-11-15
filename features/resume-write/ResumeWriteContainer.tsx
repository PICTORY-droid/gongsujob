"use client";

import { useRef } from "react";
import AppHeader from "@/components/layout/AppHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { LoadingScreen, Notice } from "@/components/ui/Feedback";
import { ChipSelect, FieldLabel, FormSection, TextAreaField, TextField } from "@/components/ui/Form";
import { card, colors, pageShell, primaryButton } from "@/components/ui/theme";
import { useResumeForm } from "@/features/resume-write/useResumeForm";
import { JOB_TYPES, REGIONS, ROUTES } from "@/lib/constants";

const BASIC_FIELDS = [
  { label: "이름 *", name: "name", placeholder: "홍길동" },
  { label: "생년월일", name: "birth", placeholder: "예) 1985-03-15", type: "date" },
  { label: "연락처", name: "phone", placeholder: "010-0000-0000", type: "tel" },
  { label: "이메일", name: "email", placeholder: "example@email.com", type: "email" },
] as const;

/** 이력서 작성 컨테이너 */
export default function ResumeWriteContainer() {
  const resume = useResumeForm();
  const { form, handleChange, setField } = resume;
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (resume.fetching) return <LoadingScreen />;

  return (
    <div style={pageShell()}>
      <AppHeader backHref={ROUTES.mypage} backLabel="← 내정보" rightSpace={60} />

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px" }}>
        {/* 증명사진 · 공개 여부 */}
        <div style={{ ...card, padding: "20px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            type="button"
            aria-label="증명사진 업로드"
            onClick={() => fileInputRef.current?.click()}
            style={{ width: "72px", height: "88px", borderRadius: "8px", background: resume.photoUrl ? "transparent" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", border: `1px solid ${colors.line}`, flexShrink: 0, padding: 0 }}
          >
            {resume.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- 사용자 업로드 이미지(스토리지 URL)
              <img src={resume.photoUrl} alt="증명사진" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "28px" }}>📷</span>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={(event) => resume.uploadPhoto(event.target.files?.[0])} style={{ display: "none" }} />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: colors.ink, marginBottom: "4px" }}>증명사진</div>
            <div style={{ fontSize: "12px", color: colors.muted, marginBottom: "8px" }}>사진을 클릭해서 업로드하세요</div>
            {resume.uploading && <div style={{ fontSize: "12px", color: colors.brand }}>업로드 중...</div>}
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <span style={{ fontSize: "12px", color: colors.muted }}>이력서 공개</span>
              <input type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange} style={{ width: "16px", height: "16px", accentColor: colors.brand, cursor: "pointer" }} />
            </label>
          </div>
        </div>

        {/* 안전보건교육 이수증 */}
        <div style={{ ...card, padding: "16px 20px", marginBottom: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}>
            <input type="checkbox" checked={resume.hasSafetyCert} onChange={(event) => resume.setHasSafetyCert(event.target.checked)} style={{ width: "22px", height: "22px", accentColor: colors.brand, flexShrink: 0, cursor: "pointer" }} />
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: colors.ink }}>🦺 건설기초 안전보건교육 이수증 보유</div>
              <div style={{ fontSize: "12px", color: colors.muted, marginTop: "3px" }}>이수증 미소지 시 현장 출입 불가 — 체크하면 소장님 신뢰도가 높아져요</div>
            </div>
          </label>
          {resume.hasSafetyCert && (
            <div style={{ marginTop: "10px", padding: "8px 12px", background: colors.successBg, borderRadius: "8px", border: `1px solid ${colors.successBorder}`, fontSize: "12px", color: colors.success, fontWeight: 600 }}>
              ✅ 이수증 보유 — 인재 목록에서 배지가 표시됩니다
            </div>
          )}
        </div>

        <FormSection title="기본 정보">
          {BASIC_FIELDS.map((field) => (
            <TextField key={field.name} label={field.label} name={field.name} value={form[field.name]} onChange={handleChange} placeholder={field.placeholder} type={"type" in field ? field.type : "text"} />
          ))}
          <div style={{ marginBottom: "14px" }}>
            <FieldLabel gap="8px">활동 지역</FieldLabel>
            <ChipSelect ariaLabel="활동 지역" options={REGIONS} value={form.address} onChange={(region) => setField("address", region)} layout="grid4" />
          </div>
        </FormSection>

        <FormSection title="직종 및 경력">
          <div style={{ marginBottom: "14px" }}>
            <FieldLabel gap="8px">직종 *</FieldLabel>
            <ChipSelect ariaLabel="직종" options={JOB_TYPES} value={form.job_type} onChange={(jobType) => setField("job_type", jobType)} />
          </div>
          <TextField label="경력 (년)" name="career_years" type="number" min="0" value={form.career_years} onChange={handleChange} placeholder="0" />
          <TextField label="보유 기술" name="skills" value={form.skills} onChange={handleChange} placeholder="예) 철근 배근, 거푸집 설치, 용접" />
          <TextField label="자격증" name="certifications" value={form.certifications} onChange={handleChange} placeholder="예) 철근기능사, 건축산업기사" marginBottom="0" />
        </FormSection>

        <FormSection title="경력 사항">
          <TextAreaField name="experience" value={form.experience} onChange={handleChange} placeholder="근무한 현장, 기간, 담당 업무 등을 자유롭게 입력하세요" rows={4} aria-label="경력 사항" />
        </FormSection>

        <FormSection title="학력" marginBottom="20px">
          <TextField label="최종 학력" name="education" value={form.education} onChange={handleChange} placeholder="예) ○○고등학교 졸업" marginBottom="0" />
        </FormSection>

        {resume.message && <Notice message={resume.message.text} tone={resume.message.tone} style={{ borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }} />}

        <button type="button" onClick={resume.submit} disabled={resume.submitting} style={primaryButton(resume.submitting)}>
          {resume.submitting ? "저장 중..." : "이력서 저장하기"}
        </button>
      </div>

      <MobileBottomNav />
    </div>
  );
}
