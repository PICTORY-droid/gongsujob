import { getBrowserSupabase as db } from "@/lib/supabase/client";
import { groupMessagesByOffer } from "@/domain/offer";
import { buildNotification, sendNotification } from "@/services/notification.service";
import type {
  NewPositionOffer,
  OfferMessage,
  OfferStatus,
  PositionOffer,
  PositionOfferWithRelations,
  Result,
} from "@/types/domain";

/**
 * 포지션 제안 서비스 (position_offers, position_offer_messages, resume_contact_views).
 * "제안 상태 변경 + 메시지 저장 + 상대방 알림"처럼 여러 테이블에 걸친 흐름을 하나의 유스케이스 함수로 묶는다.
 */

/** 목록에는 연락처를 싣지 않는다(수락 전 연락처가 네트워크 응답에 섞이는 것 방지) */
const OFFER_WITH_RELATIONS = "*, resumes(name, address, job_type), jobs(title, region, pay, pay_type)";

export type OfferInbox = {
  offers: PositionOfferWithRelations[];
  messagesByOffer: Record<string, OfferMessage[]>;
};

/** 구인자는 보낸 제안, 구직자는 받은 제안 + 각 제안의 메시지 */
export async function listOffersForUser(userId: string, asEmployer: boolean): Promise<OfferInbox> {
  const base = db().from("position_offers").select(OFFER_WITH_RELATIONS).order("created_at", { ascending: false });
  const { data, error } = await (asEmployer ? base.eq("employer_user_id", userId) : base.eq("seeker_user_id", userId));

  if (error || !data) return { offers: [], messagesByOffer: {} };

  const offers = data as unknown as PositionOfferWithRelations[];
  if (offers.length === 0) return { offers, messagesByOffer: {} };

  const { data: messages } = await db()
    .from("position_offer_messages")
    .select("*")
    .in(
      "offer_id",
      offers.map((offer) => offer.id),
    )
    .order("created_at", { ascending: true });

  return { offers, messagesByOffer: groupMessagesByOffer((messages as OfferMessage[] | null) ?? []) };
}

/** 구인자가 특정 이력서에 보낸 가장 최근 제안 */
export async function getLatestOfferForResume(employerId: string, resumeId: string): Promise<PositionOffer | null> {
  const { data } = await db()
    .from("position_offers")
    .select("*")
    .eq("employer_user_id", employerId)
    .eq("resume_id", resumeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as PositionOffer | null) ?? null;
}

/** 연락처 열람 이력 기록 (수락된 제안에 한해) */
export async function recordContactView(employerId: string, resumeId: string): Promise<void> {
  await db().from("resume_contact_views").insert({ employer_user_id: employerId, resume_id: resumeId });
}

export async function createOffer(offer: NewPositionOffer): Promise<Result<PositionOffer>> {
  const { data, error } = await db().from("position_offers").insert(offer).select("*").single();
  if (error || !data) return { ok: false, error: "제안 발송 실패: " + (error?.message ?? "unknown") };

  await sendNotification(buildNotification(offer.seeker_user_id, "position_offer", offer.title));
  return { ok: true, data: data as PositionOffer };
}

async function setOfferStatus(offerId: string, status: OfferStatus) {
  return db().from("position_offers").update({ status, updated_at: new Date().toISOString() }).eq("id", offerId);
}

/** 구직자: 제안 수락/거절 → 구인자에게 알림 */
export async function respondToOffer(
  offer: Pick<PositionOffer, "id" | "employer_user_id">,
  status: "accepted" | "rejected",
): Promise<Result<null>> {
  const { error } = await setOfferStatus(offer.id, status);
  if (error) return { ok: false, error: "처리 실패: " + error.message };

  const accepted = status === "accepted";
  await sendNotification(
    buildNotification(
      offer.employer_user_id,
      accepted ? "position_offer_accepted" : "position_offer_rejected",
      accepted ? "구직자가 제안을 수락했습니다. 이제 연락처 확인이 가능합니다." : "구직자가 제안을 거절했습니다.",
    ),
  );
  return { ok: true, data: null };
}

/**
 * 제안에 메시지 전송.
 * - 구직자(question): 상태 → question, 구인자에게 알림
 * - 구인자(answer):   상태 → answered, 구직자에게 알림
 */
export async function sendOfferMessage(
  offer: Pick<PositionOffer, "id" | "employer_user_id" | "seeker_user_id">,
  senderId: string,
  text: string,
  kind: "question" | "answer",
): Promise<Result<OfferMessage>> {
  const failPrefix = kind === "question" ? "질문 전송 실패: " : "답변 전송 실패: ";

  const { data, error } = await db()
    .from("position_offer_messages")
    .insert({ offer_id: offer.id, sender_user_id: senderId, message: text })
    .select("*")
    .single();

  if (error || !data) return { ok: false, error: failPrefix + (error?.message ?? "unknown") };

  await setOfferStatus(offer.id, kind === "question" ? "question" : "answered");
  await sendNotification(
    kind === "question"
      ? buildNotification(offer.employer_user_id, "position_offer_question", text)
      : buildNotification(offer.seeker_user_id, "position_offer_answer", text),
  );

  return { ok: true, data: data as OfferMessage };
}
