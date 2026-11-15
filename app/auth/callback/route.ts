import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabase } from "@/lib/supabase/server";
import { isProfileComplete } from "@/domain/profile";
import { ROUTES } from "@/lib/constants";

/** OAuth 콜백: 세션 교환 후 프로필 완성 여부에 따라 홈 또는 온보딩으로 보낸다. */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createRouteHandlerSupabase();
    const {
      data: { session },
    } = await supabase.auth.exchangeCodeForSession(code);

    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type,name,phone,address")
        .eq("id", session.user.id)
        .maybeSingle();

      return NextResponse.redirect(`${origin}${isProfileComplete(profile) ? ROUTES.home : ROUTES.onboarding}`);
    }
  }

  return NextResponse.redirect(`${origin}${ROUTES.login}`);
}
