"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function VerifyEmployerCompletePage() {
  const [status, setStatus] = useState("인증 처리 중입니다.");

  useEffect(() => {
    const completeVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setStatus("로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (profile?.user_type !== "구인자") {
        setStatus("구인자 계정만 인재 연락처 열람 인증을 완료할 수 있습니다.");
        return;
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const { error } = await supabase.from("employer_verifications").insert({
        employer_user_id: user.id,
        verified_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        verification_method: "email",
      });

      if (error) {
        setStatus("인증 저장 중 오류가 발생했습니다: " + error.message);
        return;
      }

      setStatus("이메일 인증이 완료되었습니다. 30일 동안 인재 연락처를 열람할 수 있습니다.");

      setTimeout(() => {
        window.location.href = "/resumes";
      }, 1600);
    };

    completeVerification();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "24px", fontFamily: "'Apple SD Gothic Neo', sans-serif" }}>
      <div style={{ maxWidth: "440px", margin: "80px auto", background: "#fff", borderRadius: "16px", padding: "24px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>✅</div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a1a", marginBottom: "10px" }}>인증 처리</div>
        <div style={{ fontSize: "14px", color: "#666", lineHeight: 1.7, marginBottom: "18px" }}>{status}</div>
        <Link href="/resumes" style={{ display: "inline-block", padding: "12px 18px", borderRadius: "10px", background: "#FF6B00", color: "#fff", textDecoration: "none", fontSize: "14px", fontWeight: 700 }}>
          인재 찾기로 이동
        </Link>
      </div>
    </div>
  );
}
