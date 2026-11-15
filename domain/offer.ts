import type { OfferMessage, OfferStatus, PositionOffer } from "@/types/domain";

/** 보는 사람 관점: 구직자 본인(self) / 상대방(counterpart) 에 따라 수락·거절 문구가 다르다. */
export type OfferViewpoint = "self" | "counterpart";

const LABELS: Record<OfferStatus, { self: string; counterpart: string }> = {
  pending: { self: "제안 대기", counterpart: "제안 대기" },
  question: { self: "새 메세지", counterpart: "새 메세지" },
  answered: { self: "새 메세지", counterpart: "새 메세지" },
  accepted: { self: "수락함", counterpart: "수락됨" },
  rejected: { self: "거절함", counterpart: "거절됨" },
  cancelled: { self: "취소됨", counterpart: "취소됨" },
};

export function getOfferStatusLabel(status: string | null | undefined, viewpoint: OfferViewpoint = "self"): string {
  if (status && status in LABELS) return LABELS[status as OfferStatus][viewpoint];
  return viewpoint === "counterpart" ? "제안 진행 중" : String(status ?? "");
}

export type StatusTone = { bg: string; color: string };

export function getOfferStatusTone(status: string | null | undefined): StatusTone {
  switch (status) {
    case "accepted":
      return { bg: "#f0fff4", color: "#276749" };
    case "rejected":
      return { bg: "#fff3f3", color: "#e53e3e" };
    case "question":
      return { bg: "#fff8f5", color: "#FF6B00" };
    case "answered":
      return { bg: "#f0f9ff", color: "#0ea5e9" };
    default:
      return { bg: "#f5f5f5", color: "#666" };
  }
}

/** 구직자가 수락·거절·질문할 수 있는 상태인지 */
export function canSeekerRespond(status: OfferStatus): boolean {
  return status === "pending" || status === "answered" || status === "question";
}

/** 구인자가 답변을 보낼 수 있는 상태인지 */
export function canEmployerReply(status: OfferStatus): boolean {
  return status !== "accepted" && status !== "rejected";
}

/** 이미 진행 중인 제안이 있어 새 제안을 막아야 하는지 */
export function isOfferActive(offer: Pick<PositionOffer, "status"> | null | undefined): boolean {
  return Boolean(offer && offer.status !== "rejected" && offer.status !== "cancelled");
}

export function isContactUnlocked(offer: Pick<PositionOffer, "status"> | null | undefined): boolean {
  return offer?.status === "accepted";
}

export function groupMessagesByOffer(messages: OfferMessage[]): Record<string, OfferMessage[]> {
  return messages.reduce<Record<string, OfferMessage[]>>((acc, message) => {
    (acc[message.offer_id] ||= []).push(message);
    return acc;
  }, {});
}

export function hasMessageFrom(messages: OfferMessage[], userId: string): boolean {
  return messages.some((message) => message.sender_user_id === userId);
}
