"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function VerifyEmployerPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

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

    const redirectTo = `${window.location.origin}/auth/callback?next=/verify-employer/complete`;

    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: false,
      },
    });

    if (error) {
      setMessage("인증 메일 발송 실패: " + error.message);
    } else {
      setMessage("인증 메일을 보냈습니다. 메일함에서 인증 링크를 클릭해주세요.");
    }

    setSending(false);
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
          이메일 인증
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
          style={{ width: "100%", padding: "14px", border: "none", borderRadius: "12px", background: sending ? "#ddd" : "#FF6B00", color: "#fff", fontSize: "15px", fontWeight: 800, cursor: sending ? "not-allowed" : "pointer" }}
        >
          {sending ? "메일 발송 중..." : "이메일 인증 메일 보내기"}
        </button>

        <div style={{ fontSize: "12px", color: "#999", lineHeight: 1.6, marginTop: "14px" }}>
          이 인증은 실명 본인확인이 아니라 가입 이메일 소유 확인입니다. 포트폴리오 환경의 무료 인증 방식입니다.
        </div>
      </div>
    </div>
  );
}
