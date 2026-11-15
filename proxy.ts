import { NextResponse, type NextRequest } from "next/server";
import { createProxySupabase } from "@/lib/supabase/proxy";
import { isProfileComplete } from "@/domain/profile";
import { ROUTES } from "@/lib/constants";

/**
 * 서버 측 접근 제어 (Next.js 16 Proxy).
 * 1) 비로그인 → /login?redirectedFrom=원래경로
 * 2) 프로필 미완성 → /onboarding
 */
export async function proxy(request: NextRequest) {
  const { supabase, getResponse } = createProxySupabase(request, () => NextResponse.next({ request }));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ROUTES.login;
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type,name,phone,address")
    .eq("id", user.id)
    .maybeSingle();

  if (pathname !== ROUTES.onboarding && !isProfileComplete(profile)) {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = ROUTES.onboarding;
    onboardingUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(onboardingUrl);
  }

  return getResponse();
}

export const config = {
  matcher: ["/jobs/:path*", "/mypage", "/onboarding", "/resume/:path*", "/resumes/:path*"],
};
