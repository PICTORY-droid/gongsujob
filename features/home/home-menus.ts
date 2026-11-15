import { ROUTES } from "@/lib/constants";
import type { HeaderTab } from "@/components/layout/HomeHeader";

/** 홈 화면 메뉴 구성 (로그인 상태·이용 유형별). 화면 코드에서 분리한 순수 데이터 */

export type ActionCard = { icon: string; label: string; desc: string; href: string };

const CARD = {
  resumeWrite: { icon: "📝", label: "이력서 등록", desc: "일자리 매칭 받기", href: ROUTES.resumeWrite },
  jobs: { icon: "📋", label: "공고 보기", desc: "현장 일자리 찾기", href: ROUTES.jobs },
  jobWrite: { icon: "🏗️", label: "공고 등록", desc: "인력 바로 구하기", href: ROUTES.jobWrite },
  resumes: { icon: "👷", label: "인재 찾기", desc: "등록된 근로자 보기", href: ROUTES.resumes },
} satisfies Record<string, ActionCard>;

export function getActionCards(loggedIn: boolean, employer: boolean): ActionCard[] {
  if (!loggedIn) return [CARD.resumeWrite, CARD.jobs, CARD.jobWrite, CARD.resumes];
  return employer ? [CARD.jobWrite, CARD.resumes] : [CARD.resumeWrite, CARD.jobs];
}

export function getDesktopTabs(employer: boolean): HeaderTab[] {
  return employer
    ? [
        { label: "공고 등록", href: ROUTES.jobWrite },
        { label: "인재 찾기", href: ROUTES.resumes },
        { label: "문의하기", href: ROUTES.contact },
        { label: "내정보", href: ROUTES.mypage },
      ]
    : [
        { label: "공고 보기", href: ROUTES.jobs },
        { label: "이력서 등록", href: ROUTES.resumeWrite },
        { label: "문의하기", href: ROUTES.contact },
        { label: "내정보", href: ROUTES.mypage },
      ];
}

export const SERVICE_HIGHLIGHTS = [
  { num: "공고", label: "등록·조회" },
  { num: "이력서", label: "공개 설정" },
  { num: "제안", label: "수락·거절" },
  { num: "연락처", label: "수락 후 공개" },
] as const;
