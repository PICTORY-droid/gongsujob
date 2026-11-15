import { describe, expect, it } from "vitest";
import {
  canEmployerReply,
  canSeekerRespond,
  getOfferStatusLabel,
  getOfferStatusTone,
  groupMessagesByOffer,
  hasMessageFrom,
  isContactUnlocked,
  isOfferActive,
} from "@/domain/offer";
import type { OfferMessage, OfferStatus } from "@/types/domain";

describe("제안 상태 표시", () => {
  it("본인/상대방 관점에 따라 수락·거절 문구가 다르다", () => {
    expect(getOfferStatusLabel("accepted", "self")).toBe("수락함");
    expect(getOfferStatusLabel("accepted", "counterpart")).toBe("수락됨");
    expect(getOfferStatusLabel("rejected", "counterpart")).toBe("거절됨");
  });

  it("질문·답변 상태는 모두 '새 메세지'", () => {
    expect(getOfferStatusLabel("question")).toBe("새 메세지");
    expect(getOfferStatusLabel("answered")).toBe("새 메세지");
  });

  it("알 수 없는 상태는 관점별 기본 문구", () => {
    expect(getOfferStatusLabel(undefined, "counterpart")).toBe("제안 진행 중");
    expect(getOfferStatusLabel("weird", "self")).toBe("weird");
  });

  it("상태별 색상 톤", () => {
    expect(getOfferStatusTone("accepted").color).toBe("#276749");
    expect(getOfferStatusTone("pending")).toEqual({ bg: "#f5f5f5", color: "#666" });
  });
});

describe("제안 흐름 규칙", () => {
  const all: OfferStatus[] = ["pending", "question", "answered", "accepted", "rejected", "cancelled"];

  it("구직자는 대기·질문·답변 상태에서만 응답 가능", () => {
    expect(all.filter(canSeekerRespond)).toEqual(["pending", "question", "answered"]);
  });

  it("구인자는 수락·거절된 제안에는 답변 불가", () => {
    expect(all.filter((s) => !canEmployerReply(s))).toEqual(["accepted", "rejected"]);
  });

  it("거절·취소된 제안은 진행 중이 아니므로 새 제안 가능", () => {
    expect(isOfferActive({ status: "pending" })).toBe(true);
    expect(isOfferActive({ status: "rejected" })).toBe(false);
    expect(isOfferActive({ status: "cancelled" })).toBe(false);
    expect(isOfferActive(null)).toBe(false);
  });

  it("연락처는 수락된 제안에서만 공개", () => {
    expect(isContactUnlocked({ status: "accepted" })).toBe(true);
    expect(isContactUnlocked({ status: "answered" })).toBe(false);
  });
});

describe("메시지 묶기", () => {
  const msg = (id: string, offer_id: string, sender_user_id: string): OfferMessage => ({ id, offer_id, sender_user_id, message: id, created_at: "" });

  it("제안 ID별로 순서를 유지하며 묶는다", () => {
    const grouped = groupMessagesByOffer([msg("1", "a", "s"), msg("2", "b", "e"), msg("3", "a", "e")]);
    expect(grouped.a.map((m) => m.id)).toEqual(["1", "3"]);
    expect(grouped.b).toHaveLength(1);
  });

  it("특정 사용자가 보낸 메시지가 있는지", () => {
    const list = [msg("1", "a", "seeker")];
    expect(hasMessageFrom(list, "seeker")).toBe(true);
    expect(hasMessageFrom(list, "employer")).toBe(false);
  });
});
