import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/config/env";

/**
 * 브라우저용 Supabase 클라이언트 (싱글턴).
 * 화면 컴포넌트는 이 모듈을 직접 쓰지 않고 services/* 를 통해서만 데이터에 접근한다.
 */
let browserClient: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
  if (browserClient) return browserClient;
  const env = getPublicEnv();
  browserClient = createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return browserClient;
}
