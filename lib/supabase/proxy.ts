import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";
import { getPublicEnv } from "@/lib/config/env";

/**
 * Proxy(구 Middleware) 전용: 요청 쿠키를 읽고, 갱신된 세션 쿠키를 응답에 실어 보낸다.
 * getResponse()는 쿠키 갱신 이후의 최신 응답 객체를 돌려준다.
 */
export function createProxySupabase(
  request: NextRequest,
  createNext: () => NextResponse,
): { supabase: SupabaseClient; getResponse: () => NextResponse } {
  const env = getPublicEnv();
  let response = createNext();

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = createNext();
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  return { supabase, getResponse: () => response };
}
