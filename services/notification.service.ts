import { getBrowserSupabase as db } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants";
import type { NewNotification, NotificationType } from "@/types/domain";

/** 알림 서비스 (notifications 테이블). 알림 문구 템플릿을 한곳에서 관리한다. */

const TEMPLATES: Record<NotificationType, string> = {
  position_offer: "새 포지션 제안이 도착했습니다",
  position_offer_accepted: "포지션 제안이 수락되었습니다",
  position_offer_rejected: "포지션 제안이 거절되었습니다",
  position_offer_question: "포지션 제안에 질문이 도착했습니다",
  position_offer_answer: "포지션 제안 질문에 답변이 도착했습니다",
};

export function buildNotification(userId: string, type: NotificationType, message: string): NewNotification {
  return { user_id: userId, type, title: TEMPLATES[type], message, link_url: ROUTES.mypage };
}

/** 알림 실패는 본 작업(제안·수락 등)을 막지 않는다. 결과만 돌려준다. */
export async function sendNotification(notification: NewNotification): Promise<boolean> {
  const { error } = await db().from("notifications").insert(notification);
  return !error;
}
