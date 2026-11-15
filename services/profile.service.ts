import { getBrowserSupabase as db } from "@/lib/supabase/client";
import type { Profile, Result, UserType } from "@/types/domain";

/** 프로필 서비스 (profiles 테이블) */

const PROFILE_COLUMNS = "id,user_type,name,phone,address,region,avatar_url";

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await db().from("profiles").select(PROFILE_COLUMNS).eq("id", userId).maybeSingle();
  return (data as Profile | null) ?? null;
}

export type OnboardingPayload = {
  id: string;
  user_type: UserType;
  name: string;
  phone: string;
  address: string;
  region: string;
};

export async function upsertProfile(payload: OnboardingPayload): Promise<Result<null>> {
  const { error } = await db().from("profiles").upsert(payload);
  if (error) return { ok: false, error: "저장 실패: " + error.message };
  return { ok: true, data: null };
}

export async function updateAvatar(userId: string, avatarUrl: string): Promise<Result<null>> {
  const { error } = await db().from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: null };
}
