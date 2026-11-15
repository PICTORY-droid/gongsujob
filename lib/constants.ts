/** 화면 전반에서 공유하는 고정 목록. 여러 페이지에 복사돼 있던 값을 한곳으로 모았다. */

/** 세부 직종 목록은 lib/job-taxonomy.ts(분야별 분류)에서 만든다 */
export { JOB_TYPES } from "@/lib/job-taxonomy";

export const ALL_CATEGORY = "전체";


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
  loginForm: "/login?mode=login",
  signupForm: "/login?mode=signup",
  onboarding: "/onboarding",
  jobs: "/jobs",
  savedJobs: "/jobs/saved",
  jobWrite: "/jobs/write",
  resumes: "/resumes",
  resumeWrite: "/resume/write",
  mypage: "/mypage",
  manage: "/manage",
  contact: "/contact",
} as const;

/** 로그인 없이 접근 가능한 경로 */
export const PUBLIC_ROUTES: readonly string[] = [ROUTES.home, ROUTES.contact];

export const AVATAR_BUCKET = "avatars";

export const TOAST_DURATION_MS = 1800;
