import { ROUTES } from "@/lib/constants";
import type { ViewerRole } from "@/lib/navigation";

/**
 * 홈 화면 구성 데이터 (역할별). 화면 코드와 분리된 순수 데이터라 테스트·수정이 쉽다.
 * 아이콘은 이름(키)만 두고, 실제 그림은 표시 컴포넌트가 고른다.
 */

/* ───────── 배너 ───────── */

export type BannerArt = "today" | "privacy" | "netpay" | "documents" | "resume";

export type BannerSlide = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  art: BannerArt;
};

const SLIDE = {
  today: {
    key: "today",
    eyebrow: "급구 · 오늘 출근",
    title: "내일 아침 나갈 현장,\n오늘 밤에 정하세요",
    description: "출근일 배지로 오늘·내일 현장을 한눈에",
    cta: "일자리 보기",
    href: ROUTES.jobs,
    art: "today",
  },
  privacy: {
    key: "privacy",
    eyebrow: "개인정보 안심",
    title: "연락처는\n수락한 뒤에만 공개",
    description: "제안 → 수락 → 연락처 공개, 원치 않는 연락 없이",
    cta: "이용 방법 보기",
    href: ROUTES.resumes,
    art: "privacy",
  },
  netpay: {
    key: "netpay",
    eyebrow: "실수령액 계산기",
    title: "일당에서\n손에 쥐는 돈은 얼마?",
    description: "고용보험·소득세 공제 후 금액을 공고마다 바로",
    cta: "공고에서 계산하기",
    href: ROUTES.jobs,
    art: "netpay",
  },
  documents: {
    key: "documents",
    eyebrow: "구인자 현장관리",
    title: "노임대장 엑셀,\n근로계약서까지 한 번에",
    description: "확정된 인력 서류를 현장별로 바로 정리",
    cta: "현장관리 열기",
    href: ROUTES.manage,
    art: "documents",
  },
  resume: {
    key: "resume",
    eyebrow: "3분 이력서",
    title: "이력서 한 번이면\n제안이 먼저 옵니다",
    description: "직종·경력·안전교육 이수만 적으면 끝",
    cta: "이력서 등록",
    href: ROUTES.resumeWrite,
    art: "resume",
  },
} as const satisfies Record<string, BannerSlide>;

export function getBannerSlides(role: ViewerRole): BannerSlide[] {
  if (role === "employer") return [SLIDE.documents, SLIDE.privacy, SLIDE.today];
  if (role === "seeker") return [SLIDE.today, SLIDE.resume, SLIDE.netpay, SLIDE.privacy];
  return [SLIDE.today, SLIDE.privacy, SLIDE.netpay, SLIDE.documents];
}

/* ───────── 바로가기 카드 ───────── */

export type ActionIcon = "resume" | "jobs" | "post" | "talent" | "saved" | "manage";
export type ActionCard = { icon: ActionIcon; label: string; desc: string; href: string };

const CARD = {
  resumeWrite: { icon: "resume", label: "이력서 등록", desc: "제안 받기", href: ROUTES.resumeWrite },
  jobs: { icon: "jobs", label: "일자리 찾기", desc: "현장 공고 보기", href: ROUTES.jobs },
  saved: { icon: "saved", label: "찜한 공고", desc: "저장한 현장", href: ROUTES.savedJobs },
  jobWrite: { icon: "post", label: "공고 등록", desc: "인력 바로 구하기", href: ROUTES.jobWrite },
  resumes: { icon: "talent", label: "인재 찾기", desc: "등록된 근로자", href: ROUTES.resumes },
  manage: { icon: "manage", label: "현장관리", desc: "노임대장·계약서", href: ROUTES.manage },
} as const satisfies Record<string, ActionCard>;

export function getActionCards(role: ViewerRole): ActionCard[] {
  if (role === "employer") return [CARD.jobWrite, CARD.resumes, CARD.manage];
  if (role === "seeker") return [CARD.jobs, CARD.saved, CARD.resumeWrite];
  return [CARD.jobs, CARD.resumeWrite, CARD.jobWrite, CARD.resumes];
}

/* ───────── 실제로 동작하는 기능 안내 (각 항목은 해당 화면으로 연결) ─────────
 * 설명은 한 줄(최대 14자)로 쓴다 — PC 3열·태블릿 2열 칸에서 줄바꿈되지 않는 길이 (테스트로 보장) */

export type FeatureIcon = "verified" | "spreadsheet" | "contract" | "calculator" | "safety" | "privacy" | "saved" | "today";
export type FeatureItem = { icon: FeatureIcon; title: string; description: string; href: string };

const FEATURE = {
  workers: { icon: "verified", title: "확정 인력 미리 확인", description: "수락한 근로자 연락처 확인", href: ROUTES.manage },
  ledger: { icon: "spreadsheet", title: "노임대장 엑셀", description: "공제액·실지급액 자동 계산", href: ROUTES.manage },
  contract: { icon: "contract", title: "근로계약서 출력", description: "작성 후 인쇄·PDF 저장", href: ROUTES.manage },
  netpay: { icon: "calculator", title: "실수령액 계산", description: "공제 후 실제 받는 금액", href: ROUTES.jobs },
  safety: { icon: "safety", title: "안전교육 이수 확인", description: "이수 인재를 배지로 구분", href: ROUTES.resumes },
  privacy: { icon: "privacy", title: "연락처 보호", description: "수락 전에는 연락처 비공개", href: ROUTES.mypage },
  saved: { icon: "saved", title: "찜한 공고", description: "마음에 든 현장 저장", href: ROUTES.savedJobs },
  today: { icon: "today", title: "출근일 배지", description: "오늘·내일 출근 한눈에", href: ROUTES.jobs },
} as const satisfies Record<string, FeatureItem>;

export function getFeatureSection(role: ViewerRole): { title: string; subtitle: string; items: FeatureItem[] } {
  if (role === "seeker") {
    return { title: "구직자를 위한 기능", subtitle: "현장 찾기부터 실수령액 확인까지", items: [FEATURE.today, FEATURE.saved, FEATURE.netpay, FEATURE.privacy, FEATURE.safety] };
  }
  return {
    title: "현장관리 도구",
    subtitle: "인력 확정부터 서류 정리까지 한 곳에서",
    items: [FEATURE.workers, FEATURE.ledger, FEATURE.contract, FEATURE.netpay, FEATURE.safety, FEATURE.privacy],
  };
}
