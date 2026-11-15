import type { Metadata } from "next";
import LoginContainer from "@/features/auth/LoginContainer";

export const metadata: Metadata = {
  title: "로그인 · 회원가입 | 현장공수잡",
};

type LoginPageProps = {
  searchParams: Promise<{ mode?: string }>;
};

/** /login?mode=login|signup — 모드는 서버에서 읽어 넘긴다(클라이언트 effect 제거) */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { mode } = await searchParams;
  return <LoginContainer mode={mode === "signup" ? "signup" : "login"} />;
}
