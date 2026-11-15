"use client";

import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { colors } from "@/components/ui/theme";
import { OfferComposer, OfferStatusPanel } from "@/features/resumes/OfferComposer";
import { isOfferActive } from "@/domain/offer";
import type { TalentSearch } from "@/features/resumes/useTalentSearch";
import type { PublicResume, ResumeContact } from "@/types/domain";

const infoRow = { background: colors.page, borderRadius: "10px", padding: "12px 14px" } as const;

function InfoRow({ label, children, preWrap = false }: { label: string; children: ReactNode; preWrap?: boolean }) {
  return (
    <div style={infoRow}>
      <div style={{ fontSize: "11px", color: colors.muted, marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "14px", color: colors.ink, whiteSpace: preWrap ? "pre-wrap" : undefined }}>{children}</div>
    </div>
  );
}

function ContactBlock({ allowed, contact }: { allowed: boolean; contact: ResumeContact | null }) {
  return (
    <div style={{ background: colors.brandTint, borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
      <div style={{ fontSize: "12px", color: colors.brand, fontWeight: 700, marginBottom: "10px" }}>📞 연락처</div>
      {allowed ? (
        <>
          {contact?.phone && (
            <a href={`tel:${contact.phone}`} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: colors.ink, fontWeight: 600 }}>{contact.phone}</span>
              <span style={{ fontSize: "11px", background: colors.brand, color: "#fff", borderRadius: "4px", padding: "2px 6px" }}>전화</span>
            </a>
          )}
          {contact?.email && <div style={{ fontSize: "13px", color: colors.sub }}>{contact.email}</div>}
          {!contact?.phone && !contact?.email && <div style={{ fontSize: "13px", color: colors.sub }}>연락처 미입력</div>}
        </>
      ) : (
        <>
          <div style={{ fontSize: "13px", color: colors.sub, marginBottom: "6px" }}>전화번호: 제안 수락 후 공개</div>
          <div style={{ fontSize: "13px", color: colors.sub }}>이메일: 제안 수락 후 공개</div>
        </>
      )}
    </div>
  );
}

/** 인재 상세 모달 (구인자 전용): 프로필 · 연락처 · 경력 · 포지션 제안 */
export function ResumeDetailModal({ resume, talent }: { resume: PublicResume; talent: TalentSearch }) {
  return (
    <Modal onClose={talent.closeResume} zIndex={200} panelStyle={{ maxWidth: "480px", maxHeight: "76vh", padding: "28px 24px 32px" }} labelledBy="resume-detail-name">
      <div style={{ width: "40px", height: "4px", background: colors.line, borderRadius: "2px", margin: "0 auto 20px" }} />

      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
        <Avatar src={resume.photo_url} fallback={resume.name?.charAt(0) || "👷"} size={60} fontSize={24} />
        <div>
          <div id="resume-detail-name" style={{ fontSize: "18px", fontWeight: 700, color: colors.ink }}>
            {resume.name}
          </div>
          <div style={{ fontSize: "13px", color: colors.muted, marginTop: "2px" }}>
            {resume.job_type} · 경력 {resume.career_years || 0}년
          </div>
        </div>
      </div>

      <div style={{ background: colors.brandSoft, border: `1px solid ${colors.brandBorder}`, borderRadius: "12px", padding: "14px", marginBottom: "12px" }}>
        <div style={{ fontSize: "12px", color: colors.brand, fontWeight: 800, marginBottom: "6px" }}>🔐 개인정보 보호 안내</div>
        <div style={{ fontSize: "12px", color: colors.sub, lineHeight: 1.5 }}>
          구직자의 연락처는 바로 공개되지 않습니다.
          <br />
          구직자가 포지션 제안을 수락하면 연락처 열람이 가능합니다.
        </div>
      </div>

      <ContactBlock allowed={talent.contactAllowed} contact={talent.contact} />

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {resume.address && <InfoRow label="거주 지역">📍 {resume.address}</InfoRow>}
        {resume.skills && <InfoRow label="보유 기술">🛠 {resume.skills}</InfoRow>}
        {resume.certifications && <InfoRow label="자격증">📜 {resume.certifications}</InfoRow>}
        {resume.experience && (
          <InfoRow label="경력 사항" preWrap>
            {resume.experience}
          </InfoRow>
        )}
      </div>

      {!talent.contactAllowed && (
        <div style={{ marginTop: "16px" }}>
          {talent.sent ? (
            <div style={{ background: colors.successBg, border: `1px solid ${colors.successBorder}`, borderRadius: "12px", padding: "12px", fontSize: "13px", color: colors.success, lineHeight: 1.5, fontWeight: 600 }}>
              포지션 제안을 보냈습니다. 구직자가 수락하면 연락처를 확인할 수 있습니다.
            </div>
          ) : isOfferActive(talent.existingOffer) && talent.existingOffer ? (
            <OfferStatusPanel offer={talent.existingOffer} />
          ) : !talent.composerOpen ? (
            <button type="button" onClick={() => talent.setComposerOpen(true)} style={{ width: "100%", padding: "14px", background: colors.brand, border: "none", borderRadius: "12px", fontSize: "14px", color: "#fff", cursor: "pointer", fontWeight: 800 }}>
              포지션 제안하기
            </button>
          ) : (
            <OfferComposer talent={talent} />
          )}
        </div>
      )}

      <button type="button" onClick={talent.closeResume} style={{ marginTop: "12px", width: "100%", padding: "14px", background: colors.lineSoft, border: "none", borderRadius: "12px", fontSize: "14px", color: colors.sub, cursor: "pointer", fontWeight: 600 }}>
        닫기
      </button>
    </Modal>
  );
}
