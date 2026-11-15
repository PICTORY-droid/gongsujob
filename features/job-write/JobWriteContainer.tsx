"use client";

import AppHeader from "@/components/layout/AppHeader";
import { Notice } from "@/components/ui/Feedback";
import { ChipSelect, FieldLabel, FormSection, TextAreaField, TextField } from "@/components/ui/Form";
import { card, colors, pageShell, primaryButton } from "@/components/ui/theme";
import { useJobForm } from "@/features/job-write/useJobForm";
import { JOB_TYPES, PAY_TYPES, REGIONS, ROUTES } from "@/lib/constants";

/** 공고 등록 컨테이너: 섹션별 폼 표시 + useJobForm 연결 */
export default function JobWriteContainer() {
  const { form, setField, handleChange, submit, submitting, message } = useJobForm();

  return (
    <div style={pageShell("40px")}>
      <AppHeader backHref={ROUTES.jobs} backLabel="← 공고목록" rightSpace={60} />

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px" }}>
        <label style={{ ...card, padding: "16px 20px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: colors.ink }}>긴급 공고</div>
            <div style={{ fontSize: "12px", color: colors.muted, marginTop: "2px" }}>긴급 배지가 표시됩니다</div>
          </div>
          <input type="checkbox" name="is_urgent" checked={form.is_urgent} onChange={handleChange} style={{ width: "20px", height: "20px", accentColor: colors.brand, cursor: "pointer" }} />
        </label>

        <FormSection title="기본 정보">
          <TextField label="공고 제목 *" name="title" value={form.title} onChange={handleChange} placeholder="예) 철근 기능공 3명 급구" />
          <TextField label="업체명/소장명" name="company" value={form.company} onChange={handleChange} placeholder="예) 김○○ 소장" />
          <div style={{ marginBottom: "14px" }}>
            <FieldLabel gap="8px">지역 *</FieldLabel>
            <ChipSelect ariaLabel="지역" options={REGIONS} value={form.region} onChange={(region) => setField("region", region)} layout="grid4" />
          </div>
          <TextField label="상세 주소" name="detail_address" value={form.detail_address} onChange={handleChange} placeholder="예) 화성시 동탄 ○○아파트 신축현장" />
          <div>
            <FieldLabel gap="8px">직종 *</FieldLabel>
            <ChipSelect ariaLabel="직종" options={JOB_TYPES} value={form.job_type} onChange={(jobType) => setField("job_type", jobType)} />
          </div>
        </FormSection>

        <FormSection title="급여 정보">
          <div style={{ marginBottom: "14px" }}>
            <FieldLabel gap="8px">급여 형태</FieldLabel>
            <ChipSelect ariaLabel="급여 형태" options={PAY_TYPES} value={form.pay_type} onChange={(payType) => setField("pay_type", payType)} layout="row" />
          </div>
          <TextField label="급여 (원) *" name="pay" type="number" min="0" value={form.pay} onChange={handleChange} placeholder="예) 280000" />
          <TextField label="모집 인원" name="headcount" type="number" min="1" value={form.headcount} onChange={handleChange} marginBottom="0" />
        </FormSection>

        <FormSection title="근무 일정">
          <TextField label="시작일 *" name="start_date" type="date" value={form.start_date} onChange={handleChange} />
          <TextField label="종료일 (미정이면 비워두세요)" name="end_date" type="date" value={form.end_date} onChange={handleChange} />
          <TextField
            label="현장완공일"
            name="completion_date"
            type="date"
            value={form.completion_date}
            onChange={handleChange}
            marginBottom="0"
            hint={<div style={{ fontSize: "11px", color: colors.brand, marginTop: "6px", padding: "8px 12px", background: colors.brandSoft, borderRadius: "8px" }}>⚠️ 현장완공일 기준 15일이 지나면 해당 공고는 자동 삭제됩니다.</div>}
          />
        </FormSection>

        <FormSection title="상세 내용" marginBottom="20px">
          <TextAreaField name="description" value={form.description} onChange={handleChange} placeholder="근무 조건, 우대 사항, 현장 위치 등을 자유롭게 입력하세요" rows={5} aria-label="상세 내용" />
        </FormSection>

        {message && <Notice message={message.text} tone={message.tone} style={{ borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }} />}

        <button type="button" onClick={submit} disabled={submitting} style={primaryButton(submitting)}>
          {submitting ? "등록 중..." : "공고 등록하기"}
        </button>
      </div>
    </div>
  );
}
