import { isValidPhone } from "@/domain/format";

/**
 * 폼 검증 (순수 함수). 실패 시 사용자에게 보여줄 메시지, 통과 시 null.
 * 메시지 문구는 기존 화면과 동일하게 유지했다.
 */

export type JobFormValues = {
  title: string;
  company: string;
  region: string;
  detail_address: string;
  job_type: string;
  pay: string;
  pay_type: string;
  headcount: string;
  start_date: string;
  end_date: string;
  completion_date: string;
  description: string;
  is_urgent: boolean;
};

export function validateJobForm(form: JobFormValues): string | null {
  if (!form.title || !form.region || !form.job_type || !form.pay || !form.start_date) {
    return "필수 항목을 모두 입력해주세요.";
  }
  return null;
}

export type ResumeFormValues = {
  name: string;
  birth: string;
  phone: string;
  email: string;
  address: string;
  job_type: string;
  career_years: string;
  skills: string;
  certifications: string;
  experience: string;
  education: string;
  is_public: boolean;
};

export function validateResumeForm(form: ResumeFormValues): string | null {
  if (!form.name || !form.job_type) return "이름과 직종은 필수입니다.";
  return null;
}

export type OnboardingValues = {
  userType: string;
  name: string;
  phone: string;
  address: string;
  region: string;
};

export function validateOnboarding(values: OnboardingValues): string | null {
  if (!values.userType) return "구인자 또는 구직자를 선택해주세요.";
  if (!values.name.trim()) return "이름을 입력해주세요.";
  if (!values.phone.trim()) return "휴대전화번호를 입력해주세요.";
  if (!isValidPhone(values.phone)) return "휴대전화번호를 올바르게 입력해주세요.";
  if (!values.address.trim()) return "주소를 입력해주세요.";
  if (!values.region) return "활동 지역을 선택해주세요.";
  return null;
}

export type OfferFormValues = {
  title: string;
  job_type: string;
  location: string;
  start_date: string;
  pay: string;
  work_conditions: string;
  message: string;
  job_id: string;
};

export function validateOfferForm(form: OfferFormValues): string | null {
  if (!form.title || !form.job_type || !form.location || !form.start_date || !form.pay || !form.message) {
    return "필수 항목을 입력해주세요.";
  }
  return null;
}

export function validateCredentials(email: string, password: string): string | null {
  if (!email.trim() || !password.trim()) return "이메일과 비밀번호를 입력해주세요.";
  return null;
}

/** 메시지 텍스트가 실패/경고 성격인지 (알림 박스 색상 결정용) */
export function isErrorMessage(message: string, keywords: readonly string[] = ["실패", "입력", "필수", "오류"]): boolean {
  return keywords.some((keyword) => message.includes(keyword));
}
