import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase as db } from "@/lib/supabase/client";

/** 인증 서비스: Supabase Auth 호출을 화면에서 분리한다. */

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await db().auth.getUser();
  return user;
}

export async function signOut(): Promise<void> {
  await db().auth.signOut();
}

export async function signInWithPassword(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await db().auth.signInWithPassword({ email, password });
  return { error: error ? error.message : null };
}

export type SignUpOutcome =
  | { kind: "error"; message: string }
  | { kind: "already_registered" }
  | { kind: "signed_in" }
  | { kind: "email_confirmation_required" };

export async function signUpWithPassword(email: string, password: string): Promise<SignUpOutcome> {
  const { data, error } = await db().auth.signUp({ email, password });
  if (error) return { kind: "error", message: error.message };

  // Supabase는 이미 가입된 이메일에 대해 identities가 빈 사용자 객체를 돌려준다.
  const alreadyRegistered = data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;
  if (alreadyRegistered) return { kind: "already_registered" };
  if (data.session) return { kind: "signed_in" };
  return { kind: "email_confirmation_required" };
}

export type OAuthProvider = "google" | "kakao";

export async function signInWithOAuth(provider: OAuthProvider, redirectTo: string): Promise<void> {
  await db().auth.signInWithOAuth({ provider, options: { redirectTo } });
}

/** 로그인 상태 변경 구독. 반환된 함수로 구독 해제 */
export function onAuthUserChange(callback: (user: User | null) => void): () => void {
  const {
    data: { subscription },
  } = db().auth.onAuthStateChange((_event, session) => callback(session?.user ?? null));
  return () => subscription.unsubscribe();
}
