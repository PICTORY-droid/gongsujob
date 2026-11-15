import Image from "next/image";
import Link from "next/link";
import type { useAuthForm } from "@/features/auth/useAuthForm";
import { ROUTES } from "@/lib/constants";

type AuthFormProps = {
  form: ReturnType<typeof useAuthForm>;
};

/** 로그인·회원가입 화면 (표시 전용). 상태와 동작은 useAuthForm이 담당한다. */
export default function AuthForm({ form }: AuthFormProps) {
  const {
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
  } = form;

  return (
    <div style={{ minHeight: "100vh", background: "var(--gs-page)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "var(--gs-font)" }}>
      <div style={{ background: "var(--gs-surface)", borderRadius: "var(--gs-radius-lg)", padding: "32px 28px", width: "100%", maxWidth: "400px", boxShadow: "var(--gs-shadow-md)" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Image src="/logo.png" alt="" width={52} height={52} priority style={{ display: "block", margin: "0 auto 10px", borderRadius: "14px", objectFit: "cover" }} />
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--gs-ink)" }}>현장공수잡</div>
          <div style={{ fontSize: "13px", color: "var(--gs-muted)", marginTop: "4px" }}>
            {isLogin ? "기존 계정으로 로그인하세요" : "새 계정을 만들고 첫 설정을 진행하세요"}
          </div>
        </div>

        <div style={{ marginBottom: "22px", textAlign: "center" }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--gs-ink)", marginBottom: "6px" }}>
            {isLogin ? "로그인" : "회원가입"}
          </div>
          <div style={{ fontSize: "13px", color: "var(--gs-muted)", lineHeight: 1.5 }}>
            {isLogin ? (
              <>소셜 계정은 기존 계정이면 로그인,<br />첫 이용은 가입 후 첫 설정으로 이어집니다.</>
            ) : (
              <>이메일 회원가입 후 첫 설정을 완료해야<br />서비스를 이용할 수 있습니다.</>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
          <button type="button" onClick={() => signInWith("google")}
            style={{ width: "100%", padding: "12px", border: "1px solid var(--gs-disabled)", borderRadius: "10px", background: "var(--gs-surface)", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://www.google.com/favicon.ico" width={18} height={18} alt="" />
            구글로 계속하기
          </button>

          <button type="button" onClick={() => signInWith("kakao")}
            style={{ width: "100%", padding: "12px", border: "none", borderRadius: "10px", background: "#FEE500", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>💬</span>
            카카오로 계속하기
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--gs-line)" }} />
          <span style={{ fontSize: "12px", color: "var(--gs-muted)" }}>또는 이메일로</span>
          <div style={{ flex: 1, height: "1px", background: "var(--gs-line)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            autoComplete="email"
            style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--gs-line)", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete={isLogin ? "current-password" : "new-password"}
            onKeyDown={(e) => e.key === "Enter" && submitEmail()}
            style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--gs-line)", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {!isMobile && isLogin && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <input
              type="checkbox"
              id="autoLogin"
              checked={autoLogin}
              onChange={(e) => setAutoLogin(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "var(--gs-brand)", cursor: "pointer" }}
            />
            <label htmlFor="autoLogin" style={{ fontSize: "13px", color: "var(--gs-text)", cursor: "pointer" }}>
              자동로그인
            </label>
          </div>
        )}

        {error && (
          <div style={{ background: "var(--gs-danger-bg)", border: "1px solid var(--gs-danger-border)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "var(--gs-danger)", marginBottom: "14px" }}>
            {error}
          </div>
        )}

        <button
          type="button" onClick={submitEmail}
          disabled={loading}
          style={{ width: "100%", padding: "13px", background: loading ? "var(--gs-disabled)" : "var(--gs-brand)", color: "var(--gs-surface)", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
        </button>

        <div style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: "var(--gs-sub)" }}>
          {isLogin ? (
            <>
              계정이 없으신가요?{" "}
              <Link href={ROUTES.signupForm} style={{ color: "var(--gs-brand)", fontWeight: 700, textDecoration: "none" }}>
                회원가입
              </Link>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{" "}
              <Link href={ROUTES.loginForm} style={{ color: "var(--gs-brand)", fontWeight: 700, textDecoration: "none" }}>
                로그인
              </Link>
            </>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "18px", fontSize: "12px", color: "var(--gs-muted)", lineHeight: 1.5 }}>
          {isLogin ? "로그인" : "회원가입"} 시 <a href="/terms" style={{ color: "var(--gs-brand)" }}>이용약관</a> 및 <a href="/privacy" style={{ color: "var(--gs-brand)" }}>개인정보처리방침</a>에 동의합니다.
        </div>
      </div>
    </div>
  );
}
