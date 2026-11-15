"use client";

import { Notice } from "@/components/ui/Feedback";
import { colors, compactInputStyle } from "@/components/ui/theme";
import { getOfferStatusLabel } from "@/domain/offer";
import type { OfferFormValues } from "@/domain/validation";
import type { TalentSearch } from "@/features/resumes/useTalentSearch";
import type { PositionOffer } from "@/types/domain";

const smallLabel = { fontSize: "11px", color: colors.muted, display: "block", marginBottom: "5px" } as const;

const REQUIRED_FIELDS: { key: keyof OfferFormValues; label: string; placeholder: string; type?: string }[] = [
  { key: "title", label: "제안 제목 *", placeholder: "예, 세종 철근 현장 작업 제안드립니다" },
  { key: "job_type", label: "직종 *", placeholder: "예, 철근" },
  { key: "location", label: "현장 위치 *", placeholder: "예, 세종시 어진동" },
  { key: "start_date", label: "근무 시작일 *", placeholder: "예, 2026-05-15" },
  { key: "pay", label: "예상 일당 *", placeholder: "예, 170000", type: "number" },
];

/** 이미 보낸 제안의 진행 상태 */
export function OfferStatusPanel({ offer }: { offer: PositionOffer }) {
  const accepted = offer.status === "accepted";
  return (
    <div style={{ background: accepted ? colors.successBg : colors.brandSoft, border: "1px solid " + (accepted ? colors.successBorder : colors.brandBorder), borderRadius: "12px", padding: "12px", fontSize: "13px", color: colors.sub, lineHeight: 1.6 }}>
      <div style={{ color: accepted ? colors.success : colors.brand, fontWeight: 800, marginBottom: "4px" }}>이미 포지션 제안을 보냈습니다</div>
      <div>현재 상태: {getOfferStatusLabel(offer.status, "counterpart")}</div>
      <div>{accepted ? "구직자가 제안을 수락했습니다. 연락처를 확인할 수 있습니다." : "구직자의 응답을 기다리는 중입니다."}</div>
    </div>
  );
}

/** 포지션 제안 작성 폼 */
export function OfferComposer({ talent }: { talent: TalentSearch }) {
  const { offerForm, updateOfferField, myJobs } = talent;

  return (
    <div style={{ background: colors.page, borderRadius: "14px", padding: "16px", border: `1px solid ${colors.line}` }}>
      <div style={{ fontSize: "14px", fontWeight: 800, color: colors.ink, marginBottom: "6px" }}>포지션 제안 작성</div>
      <div style={{ fontSize: "12px", color: colors.sub, lineHeight: 1.5, marginBottom: "14px" }}>
        제안이 발송되면 구직자에게 앱 알림이 전달됩니다.
        <br />
        구직자가 수락하면 연락처 열람이 가능합니다.
      </div>

      {myJobs.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="offer-job" style={smallLabel}>
            관련 공고 선택
          </label>
          <select id="offer-job" value={offerForm.job_id} onChange={(event) => talent.selectJob(event.target.value)} style={compactInputStyle}>
            <option value="">직접 입력</option>
            {myJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {REQUIRED_FIELDS.map((field) => (
        <div key={field.key} style={{ marginBottom: "10px" }}>
          <label htmlFor={`offer-${field.key}`} style={smallLabel}>
            {field.label}
          </label>
          <input id={`offer-${field.key}`} type={field.type ?? "text"} value={offerForm[field.key]} onChange={(event) => updateOfferField(field.key, event.target.value)} placeholder={field.placeholder} style={compactInputStyle} />
        </div>
      ))}

      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="offer-conditions" style={smallLabel}>
          근무 조건
        </label>
        <textarea id="offer-conditions" value={offerForm.work_conditions} onChange={(event) => updateOfferField("work_conditions", event.target.value)} placeholder="예, 아침 간식 제공, 점심 제공, 음료 제공" rows={3} style={{ ...compactInputStyle, resize: "vertical" }} />
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label htmlFor="offer-message" style={smallLabel}>
          제안 메시지 *
        </label>
        <textarea id="offer-message" value={offerForm.message} onChange={(event) => updateOfferField("message", event.target.value)} placeholder="이력서를 보고 현장 조건과 잘 맞아 보여 제안드립니다." rows={4} style={{ ...compactInputStyle, resize: "vertical" }} />
      </div>

      {talent.offerMessage && <Notice message={talent.offerMessage.text} tone={talent.offerMessage.tone} style={{ borderRadius: "10px", padding: "10px", fontSize: "12px", marginBottom: "10px" }} />}

      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" onClick={() => talent.setComposerOpen(false)} style={{ flex: 1, padding: "12px", background: "#fff", border: "1px solid #ddd", borderRadius: "10px", fontSize: "13px", color: colors.sub, cursor: "pointer", fontWeight: 700 }}>
          취소
        </button>
        <button type="button" onClick={talent.sendOffer} disabled={talent.sending} style={{ flex: 2, padding: "12px", background: talent.sending ? "#ddd" : colors.brand, border: "none", borderRadius: "10px", fontSize: "13px", color: "#fff", cursor: talent.sending ? "not-allowed" : "pointer", fontWeight: 800 }}>
          {talent.sending ? "발송 중..." : "제안 보내기"}
        </button>
      </div>
    </div>
  );
}
