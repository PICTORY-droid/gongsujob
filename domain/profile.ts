import { EMPLOYER } from "@/lib/constants";
import type { ProfileCompletionFields, UserType } from "@/types/domain";

/** 온보딩 완료 여부: 이용 유형·이름·연락처·주소가 모두 있어야 서비스 이용 가능. (기존 3곳 중복 → 단일화) */
export function isProfileComplete(profile: Partial<ProfileCompletionFields> | null | undefined): boolean {
  return Boolean(profile?.user_type && profile?.name && profile?.phone && profile?.address);
}

export function isEmployer(userType: UserType | string | null | undefined): boolean {
  return userType === EMPLOYER;
}

/** 프로필 아바타에 표시할 이니셜 */
export function getAvatarInitial(name: string | null | undefined, email: string | null | undefined): string {
  return name?.charAt(0) || email?.charAt(0).toUpperCase() || "U";
}
