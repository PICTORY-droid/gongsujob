/** 화면 전반에서 공유하는 고정 목록. 여러 페이지에 복사돼 있던 값을 한곳으로 모았다. */

export const JOB_TYPES = ["철근", "형틀", "방수", "도장", "미장", "전기", "배관", "용접", "타일", "조적", "기타"] as const;

export const ALL_CATEGORY = "전체";

export const JOB_CATEGORIES = [ALL_CATEGORY, ...JOB_TYPES] as const;

export const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
] as const;

export const PAY_TYPES = ["일당", "월급", "협의"] as const;

export const USER_TYPE_OPTIONS = [
  { value: "구직자", icon: "👷", label: "구직자", desc: "일자리를 찾고 있어요" },
  { value: "구인자", icon: "🏗️", label: "구인자", desc: "인력이 필요해요" },
] as const;

export const EMPLOYER = "구인자" as const;

export const ROUTES = {
  home: "/",
  login: "/login",
  onboarding: "/onboarding",
  jobs: "/jobs",
  jobWrite: "/jobs/write",
  resumes: "/resumes",
  resumeWrite: "/resume/write",
  mypage: "/mypage",
  contact: "/contact",
} as const;

/** 로그인 없이 접근 가능한 경로 */
export const PUBLIC_ROUTES: readonly string[] = [ROUTES.home, ROUTES.contact];

export const AVATAR_BUCKET = "avatars";

export const TOAST_DURATION_MS = 1800;
