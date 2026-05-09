"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function VerifyEmployerPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profile);
      setLoading(false);
    };

    init();
  }, []);

  const handleSendVerification = async () => {
    if (!user?.email) {
      setMessage("이메일 정보를 찾을 수 없습니다.");
      return;
    }

    setSending(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      setMessage("인증 코드 발송 실패: " + error.message);
    } else {
      setSent(true);
      setMessage("인증 코드를 보냈습니다. 이메일에서 6자리 코드를 확인한 뒤 아래에 입력해주세요.");
    }

    setSending(false);
  };

  const handleVerifyCode = async () => {
    if (!user?.email) {
      setMessage("이메일 정보를 찾을 수 없습니다.");
      return;
    }

    if (!otp.trim()) {
      setMessage("인증 코드를 입력해주세요.");
      return;
    }

    setVerifying(true);
    setMessage("");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: user.email,
      token: otp.trim(),
      type: "email",
    });

    if (verifyError) {
      setMessage("인증 실패: " + verifyError.message);
      setVerifying(false);
      return;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { error: insertError } = await supabase
      .from("employer_verifications")
      .insert({
        employer_user_id: user.id,
        verified_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        verification_method: "email_otp",
      });

    if (insertError) {
      setMessage("인증 저장 실패: " + insertError.message);
      setVerifying(false);
      return;
    }

    setMessage("이메일 인증이 완료되었습니다. 30일 동안 인재 연락처를 열람할 수 있습니다.");

    setTimeout(() => {
      window.location.href = "/resumes";
    }, 1500);

    setVerifying(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <div style={{ fontSize: "14px", color: "#999" }}>불러오는 중...</div>
      </div>
    );
  }

  if (profile?.user_type !== "구인자") {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "24px", fontFamily: "'Apple SD Gothic Neo', sans-serif" }}>
        <div style={{ maxWidth: "440px", margin: "80px auto", background: "#fff", borderRadius: "16px", padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🚫</div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a1a", marginBottom: "8px" }}>구인자 전용 인증입니다</div>
          <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, marginBottom: "20px" }}>
            인재 연락처 열람 인증은 구인자 계정에서만 사용할 수 있습니다.
          </div>
          <Link href="/" style={{ display: "inline-block", padding: "12px 18px", borderRadius: "10px", background: "#FF6B00", color: "#fff", textDecoration: "none", fontSize: "14px", fontWeight: 700 }}>
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "24px", fontFamily: "'Apple SD Gothic Neo', sans-serif" }}>
      <div style={{ maxWidth: "440px", margin: "60px auto", background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <Link href="/resumes" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← 인재 찾기로</Link>

        <div style={{ fontSize: "36px", marginTop: "24px", marginBottom: "12px" }}>🔐</div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1a1a", margin: "0 0 8px" }}>
          이메일 코드 인증
        </h1>
        <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.7, marginBottom: "18px" }}>
          구직자 연락처 보호를 위해 구인자는 한 달에 한 번 이메일 인증 후 연락처를 열람할 수 있습니다.
        </p>

        <div style={{ background: "#fff8f5", border: "1px solid #ffd9bf", borderRadius: "12px", padding: "14px", marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>인증 이메일</div>
          <div style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: 700 }}>{user?.email}</div>
        </div>

        {message && (
          <div style={{ background: message.includes("실패") ? "#fff3f3" : "#f0fff4", border: "1px solid " + (message.includes("실패") ? "#ffd0d0" : "#9ae6b4"), borderRadius: "10px", padding: "12px", fontSize: "13px", color: message.includes("실패") ? "#e53e3e" : "#276749", lineHeight: 1.5, marginBottom: "14px" }}>
            {message}
          </div>
        )}

        <button
          onClick={handleSendVerification}
          disabled={sending}
          style={{ width: "100%", padding: "14px", border: "none", borderRadius: "12px", background: sending ? "#ddd" : "#FF6B00", color: "#fff", fontSize: "15px", fontWeight: 800, cursor: sending ? "not-allowed" : "pointer", marginBottom: sent ? "12px" : "0" }}
        >
          {sending ? "코드 발송 중..." : sent ? "인증 코드 다시 보내기" : "이메일 인증 코드 보내기"}
        </button>

        {sent && (
          <>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="이메일로 받은 6자리 코드"
              inputMode="numeric"
              style={{ width: "100%", padding: "13px 14px", border: "1px solid #eee", borderRadius: "12px", fontSize: "15px", outline: "none", boxSizing: "border-box", marginBottom: "10px" }}
            />

            <button
              onClick={handleVerifyCode}
              disabled={verifying}
              style={{ width: "100%", padding: "14px", border: "none", borderRadius: "12px", background: verifying ? "#ddd" : "#1a1a1a", color: "#fff", fontSize: "15px", fontWeight: 800, cursor: verifying ? "not-allowed" : "pointer" }}
            >
              {verifying ? "인증 확인 중..." : "인증 확인"}
            </button>
          </>
        )}

        <div style={{ fontSize: "12px", color: "#999", lineHeight: 1.6, marginTop: "14px" }}>
          이 인증은 실명 본인확인이 아니라 가입 이메일 소유 확인입니다. 포트폴리오 환경의 무료 인증 방식입니다.
        </div>
      </div>
    </div>
  );
}
