"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  useEffect(() => {
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent));
  }, []);

  const isProfileComplete = (profile: any) => {
    return Boolean(
      profile?.user_type &&
      profile?.name &&
      profile?.phone &&
      profile?.address
    );
  };

  const moveAfterLogin = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login?mode=login";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type,name,phone,address")
      .eq("id", user.id)
      .maybeSingle();

    if (!isProfileComplete(profile)) {
      window.location.href = "/onboarding";
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const redirectedFrom = params.get("redirectedFrom");

    window.location.href = redirectedFrom || "/";
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setError("이메일 또는 비밀번호가 올바르지 않습니다.");
          return;
        }

        if (!isMobile) {
          localStorage.setItem("autoLogin", autoLogin ? "true" : "false");
        }

        await moveAfterLogin();
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setError("회원가입 실패: " + error.message);
        return;
      }

      if (data.session) {
        window.location.href = "/onboarding";
        return;
      }

      alert("회원가입이 완료되었습니다. 이메일 인증 후 로그인하면 첫 설정으로 이동합니다.");
      window.location.href = "/login?mode=login";
    } catch {
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!isMobile) {
      localStorage.setItem("autoLogin", autoLogin ? "true" : "false");
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleKakao = async () => {
    if (!isMobile) {
      localStorage.setItem("autoLogin", autoLogin ? "true" : "false");
    }

    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Apple SD Gothic Neo', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "32px 28px", width: "100%", maxWidth: "380px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "48px", height: "48px", background: "#FF6B00", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 10px" }}>⚙</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a" }}>현장공수잡</div>
          <div style={{ fontSize: "13px", color: "#999", marginTop: "4px" }}>
            {isLogin ? "기존 계정으로 로그인하세요" : "새 계정을 만들고 첫 설정을 진행하세요"}
          </div>
        </div>

        <div style={{ marginBottom: "22px", textAlign: "center" }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#1a1a1a", marginBottom: "6px" }}>
            {isLogin ? "로그인" : "회원가입"}
          </div>
          <div style={{ fontSize: "13px", color: "#999", lineHeight: 1.5 }}>
            {isLogin
              ? "로그인 후 서비스를 이용할 수 있습니다."
              : "가입 후 이름, 연락처, 주소를 입력해야 서비스를 이용할 수 있습니다."}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          <button onClick={handleGoogle}
            style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "10px", background: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <img src="https://www.google.com/favicon.ico" width={18} height={18} alt="google" />
            구글로 {isLogin ? "로그인" : "회원가입"}
          </button>

          <button onClick={handleKakao}
            style={{ width: "100%", padding: "12px", border: "none", borderRadius: "10px", background: "#FEE500", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>💬</span>
            카카오로 {isLogin ? "로그인" : "회원가입"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "#eee" }} />
          <span style={{ fontSize: "12px", color: "#999" }}>또는 이메일로</span>
          <div style={{ flex: 1, height: "1px", background: "#eee" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            autoComplete="email"
            style={{ width: "100%", padding: "12px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete={isLogin ? "current-password" : "new-password"}
            onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
            style={{ width: "100%", padding: "12px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {!isMobile && isLogin && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <input
              type="checkbox"
              id="autoLogin"
              checked={autoLogin}
              onChange={(e) => setAutoLogin(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "#FF6B00", cursor: "pointer" }}
            />
            <label htmlFor="autoLogin" style={{ fontSize: "13px", color: "#555", cursor: "pointer" }}>
              자동로그인
            </label>
          </div>
        )}

        {error && (
          <div style={{ background: "#fff3f3", border: "1px solid #ffd0d0", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#e53e3e", marginBottom: "14px" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleEmailAuth}
          disabled={loading}
          style={{ width: "100%", padding: "13px", background: loading ? "#ddd" : "#FF6B00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
        </button>

        <div style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: "#777" }}>
          {isLogin ? (
            <>
              계정이 없으신가요?{" "}
              <Link href="/login?mode=signup" style={{ color: "#FF6B00", fontWeight: 700, textDecoration: "none" }}>
                회원가입
              </Link>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{" "}
              <Link href="/login?mode=login" style={{ color: "#FF6B00", fontWeight: 700, textDecoration: "none" }}>
                로그인
              </Link>
            </>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "18px", fontSize: "12px", color: "#999", lineHeight: 1.5 }}>
          {isLogin ? "로그인" : "회원가입"} 시 <a href="/terms" style={{ color: "#FF6B00" }}>이용약관</a> 및 <a href="/privacy" style={{ color: "#FF6B00" }}>개인정보처리방침</a>에 동의합니다.
        </div>
      </div>
    </div>
  );
}
