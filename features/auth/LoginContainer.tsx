"use client";

import AuthForm from "@/components/auth/AuthForm";
import { useAuthForm, type AuthMode } from "@/features/auth/useAuthForm";

/** 로그인 화면 컨테이너: 상태 훅과 표시 컴포넌트를 연결 */
export default function LoginContainer({ mode }: { mode: AuthMode }) {
  const form = useAuthForm(mode);
  return <AuthForm form={form} />;
}
