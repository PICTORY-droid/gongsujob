"use client";

import { Notice } from "@/components/ui/Feedback";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { colors, compactInputStyle } from "@/components/ui/theme";
import { canEmployerReply, canSeekerRespond, getOfferStatusLabel, getOfferStatusTone, hasMessageFrom } from "@/domain/offer";
import { formatPay } from "@/domain/format";
import type { MyPageState } from "@/features/mypage/useMyPage";
import type { PositionOfferWithRelations } from "@/types/domain";

/** 포지션 제안 목록 · 상세 모달 (내정보) */

function StatusBadge({ status }: { status: string }) {
  const tone = getOfferStatusTone(status);
  return <span style={{ alignSelf: "flex-start", background: tone.bg, color: tone.color, fontSize: "11px", borderRadius: "6px", padding: "4px 8px", fontWeight: 700, whiteSpace: "nowrap" }}>{getOfferStatusLabel(status)}</span>;
}

function OfferHeadline({ offer, titleSize }: { offer: PositionOfferWithRelations; titleSize: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: titleSize, fontWeight: 800, color: colors.ink, lineHeight: 1.4 }}>{offer.title}</div>
        <div style={{ fontSize: "12px", color: colors.muted, marginTop: "3px" }}>
          {offer.job_type} · {offer.location} · {formatPay(offer.pay)}
        </div>
      </div>
      <StatusBadge status={offer.status} />
    </div>
  );
}

function OfferTarget({ offer }: { offer: PositionOfferWithRelations }) {
  if (!offer.resumes?.name) return null;
  return (
    <div style={{ fontSize: "12px", color: colors.sub }}>
      제안 대상: {offer.resumes.name} · {offer.resumes.job_type || "직종 미입력"} · {offer.resumes.address || "지역 미입력"}
    </div>
  );
}

export function OffersListModal({ page }: { page: MyPageState }) {
  const employer = page.isEmployer;
  return (
    <Modal onClose={page.closeOffers} labelledBy="offers-title" panelStyle={{ background: colors.page, padding: "18px" }}>
      <ModalHeader id="offers-title" title={employer ? "보낸 포지션 제안" : "받은 포지션 제안"} onClose={page.closeOffers} closeBg="#fff" />

      <div style={{ background: employer ? colors.brandSoft : colors.infoBg, border: "1px solid " + (employer ? colors.brandBorder : colors.infoBorder), borderRadius: "16px", padding: "16px 18px", marginBottom: "12px" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: colors.ink, marginBottom: "6px" }}>{employer ? "제안 이력 관리" : "제안 확인 안내"}</div>
        <div style={{ fontSize: "13px", color: colors.sub, lineHeight: 1.6 }}>
          {employer ? "보낸 포지션 제안의 진행 상태를 확인할 수 있습니다." : "받은 제안의 상태를 확인할 수 있습니다."}
          <br />
          {employer ? "구직자가 제안을 수락하면 연락처가 표시됩니다." : "제안을 수락한 경우에만 구인자에게 연락처가 공개됩니다."}
        </div>
      </div>

      {page.offers.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "36px 20px", textAlign: "center", color: colors.muted, fontSize: "13px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>{employer ? "아직 보낸 제안이 없습니다" : "아직 받은 제안이 없습니다"}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {page.offers.map((offer) => (
            <button key={offer.id} type="button" onClick={() => page.selectOffer(offer.id)} style={{ width: "100%", background: "#fff", border: `1px solid ${colors.line}`, borderRadius: "14px", padding: "14px", cursor: "pointer", textAlign: "left", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <OfferHeadline offer={offer} titleSize="14px" />
              {employer && <OfferTarget offer={offer} />}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

const primarySmall = { flex: 1, padding: "10px", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer" } as const;

export function OfferDetailModal({ page, offer }: { page: MyPageState; offer: PositionOfferWithRelations }) {
  const employer = page.isEmployer;
  const messages = page.messagesByOffer[offer.id] || [];
  const askedBefore = hasMessageFrom(messages, offer.seeker_user_id);
  const answeredBefore = hasMessageFrom(messages, offer.employer_user_id);
  const draft = page.drafts[offer.id] || "";

  return (
    <Modal onClose={page.closeOfferDetail} zIndex={320} backdrop="rgba(0,0,0,0.55)" labelledBy="offer-detail-title" panelStyle={{ boxShadow: "0 12px 40px rgba(0,0,0,0.28)" }}>
      <ModalHeader id="offer-detail-title" title={employer ? "보낸 제안 상세" : "받은 제안 상세"} onClose={page.closeOfferDetail} />

      {page.actionMessage && <Notice message={page.actionMessage.text} tone={page.actionMessage.tone} />}

      <div style={{ marginBottom: "4px" }}>
        <OfferHeadline offer={offer} titleSize="16px" />
      </div>
      {employer && (
        <div style={{ marginBottom: "10px" }}>
          <OfferTarget offer={offer} />
        </div>
      )}

      <div style={{ background: colors.page, borderRadius: "12px", padding: "12px 14px", fontSize: "12px", color: colors.sub, lineHeight: 1.7, marginBottom: "12px" }}>
        <div>시작일: {offer.start_date}</div>
        {offer.work_conditions && <div style={{ whiteSpace: "pre-wrap" }}>근무 조건: {offer.work_conditions}</div>}
        <div style={{ whiteSpace: "pre-wrap" }}>제안 메시지: {offer.message}</div>
      </div>

      {messages.length > 0 && (
        <div style={{ border: `1px solid ${colors.line}`, borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }}>
          <div style={{ background: "#fafafa", padding: "9px 12px", fontSize: "11px", color: colors.muted, fontWeight: 700 }}>질문 및 답변</div>
          {messages.map((message) => (
            <div key={message.id} style={{ padding: "10px 12px", borderTop: `1px solid ${colors.lineSoft}` }}>
              <div style={{ fontSize: "12px", color: colors.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{message.message}</div>
            </div>
          ))}
        </div>
      )}

      {!employer && canSeekerRespond(offer.status) && (
        <div>
          <div style={{ fontSize: "12px", color: colors.sub, lineHeight: 1.5, marginBottom: "10px" }}>제안을 수락하면 구인자에게 연락처가 공개됩니다. 수락 전에는 연락처가 공개되지 않습니다.</div>
          <textarea aria-label="질문 입력" value={draft} onChange={(event) => page.setDraft(offer.id, event.target.value)} placeholder={askedBefore ? "추가로 궁금한 점을 입력할 수 있습니다" : "궁금한 점을 구인자에게 질문할 수 있습니다"} rows={3} style={{ ...compactInputStyle, resize: "vertical", marginBottom: "8px" }} />
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" onClick={() => page.respond(offer, "accepted")} style={{ ...primarySmall, background: colors.brand, color: "#fff" }}>
              수락
            </button>
            <button type="button" onClick={() => page.respond(offer, "rejected")} style={{ ...primarySmall, background: "#fff", color: colors.danger, border: `1px solid ${colors.dangerBorder}`, fontWeight: 700 }}>
              거절
            </button>
            <button type="button" onClick={() => page.sendMessage(offer)} style={{ ...primarySmall, background: colors.ink, color: "#fff" }}>
              {askedBefore ? "추가 질문" : "질문"}
            </button>
          </div>
        </div>
      )}

      {!employer && offer.status === "accepted" && (
        <div style={{ background: colors.successBg, border: `1px solid ${colors.successBorder}`, borderRadius: "10px", padding: "10px", fontSize: "12px", color: colors.success, lineHeight: 1.5 }}>제안을 수락했습니다. 이제 해당 구인자가 연락처를 확인할 수 있습니다.</div>
      )}

      {employer && offer.status === "accepted" && (
        <div style={{ background: colors.successBg, border: `1px solid ${colors.successBorder}`, borderRadius: "10px", padding: "10px", fontSize: "12px", color: colors.success, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 800, marginBottom: "4px" }}>구직자가 제안을 수락했습니다</div>
          <div>전화번호: {page.selectedContact?.phone || "연락처 미입력"}</div>
          <div>이메일: {page.selectedContact?.email || "이메일 미입력"}</div>
        </div>
      )}

      {employer && canEmployerReply(offer.status) && (
        <div>
          <textarea aria-label="답변 입력" value={draft} onChange={(event) => page.setDraft(offer.id, event.target.value)} placeholder={answeredBefore ? "추가 답변을 입력할 수 있습니다" : "구직자 질문에 답변하거나 추가 안내를 보낼 수 있습니다"} rows={3} style={{ ...compactInputStyle, resize: "vertical", marginBottom: "8px" }} />
          <button type="button" onClick={() => page.sendMessage(offer)} style={{ ...primarySmall, width: "100%", background: colors.ink, color: "#fff" }}>
            {answeredBefore ? "추가 답변" : "답변 보내기"}
          </button>
        </div>
      )}
    </Modal>
  );
}
