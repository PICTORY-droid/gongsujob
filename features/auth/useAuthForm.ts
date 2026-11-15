"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, signInWithOAuth, signInWithPassword, signUpWithPassword, type OAuthProvider } from "@/services/auth.service";
import { getProfile } from "@/services/profile.service";
import { isProfileComplete } from "@/domain/profile";
import { safeRedirectPath } from "@/domain/redirect";
import { validateCredentials } from "@/domain/validation";
import { ROUTES } from "@/lib/constants";

export type AuthMode = "login" | "signup";

const AUTO_LOGIN_KEY = "autoLogin";
const MOBILE_UA = /iPhone|iPad|Android/i;

/** 로그인·회원가입 화면의 상태와 동작 (화면과 분리된 컨테이너 로직) */
export function useAuthForm(mode: AuthMode) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  useEffect(() => {
    // 브라우저에서만 알 수 있는 값이라 마운트 후 1회 반영한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(MOBILE_UA.test(navigator.userAgent));
  }, []);

  const rememberAutoLogin = () => {
    if (!isMobile) localStorage.setItem(AUTO_LOGIN_KEY, autoLogin ? "true" : "false");
  };

  const moveAfterLogin = async () => {
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = "/login?mode=login";
      return;
    }

    const profile = await getProfile(user.id);
    if (!isProfileComplete(profile)) {
      window.location.href = ROUTES.onboarding;
      return;
    }

    const redirectedFrom = new URLSearchParams(window.location.search).get("redirectedFrom");
    window.location.href = safeRedirectPath(redirectedFrom, ROUTES.home);
  };

  const submitEmail = async () => {
    const invalid = validateCredentials(email, password);
    if (invalid) {
      setError(invalid);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error: signInError } = await signInWithPassword(email, password);
        if (signInError) {
          setError("이메일 또는 비밀번호가 올바르지 않습니다.");
          return;
        }
        rememberAutoLogin();
        await moveAfterLogin();
        return;
      }

      const outcome = await signUpWithPassword(email, password);
      switch (outcome.kind) {
        case "error":
          setError("회원가입 실패: " + outcome.message);
          return;
        case "already_registered":
          setError("이미 가입된 이메일입니다. 로그인으로 이용해주세요.");
          return;
        case "signed_in":
          window.location.href = ROUTES.onboarding;
          return;
        case "email_confirmation_required":
          alert("회원가입이 완료되었습니다. 이메일 인증 후 로그인하면 첫 설정으로 이동합니다.");
          window.location.href = "/login?mode=login";
          return;
      }
    } catch {
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const signInWith = async (provider: OAuthProvider) => {
    rememberAutoLogin();
    await signInWithOAuth(provider, `${window.location.origin}/auth/callback`);
  };

  return {
    isLogin,
    isMobile,
    email,
    setEmail,
    password,
    setPassword,
    autoLogin,
    setAutoLogin,
    loading,
    error,
    submitEmail,
    signInWith,
  };
}
