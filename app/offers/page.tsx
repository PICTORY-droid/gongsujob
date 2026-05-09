"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function OffersPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [messages, setMessages] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

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

      const isEmployer = profile?.user_type === "구인자";

      let query = supabase
        .from("position_offers")
        .select("*, resumes(name, phone, email, address, job_type), jobs(title, region, pay, pay_type)")
        .order("created_at", { ascending: false });

      query = isEmployer
        ? query.eq("employer_user_id", user.id)
        : query.eq("seeker_user_id", user.id);

      const { data: offersData } = await query;
      const offerList = offersData || [];

      setOffers(offerList);

      const offerIds = offerList.map((offer: any) => offer.id);

      if (offerIds.length > 0) {
        const { data: messageData } = await supabase
          .from("position_offer_messages")
          .select("*")
          .in("offer_id", offerIds)
          .order("created_at", { ascending: true });

        const grouped: Record<string, any[]> = {};

        (messageData || []).forEach((message: any) => {
          if (!grouped[message.offer_id]) grouped[message.offer_id] = [];
          grouped[message.offer_id].push(message);
        });

        setMessages(grouped);
      }

      setLoading(false);
    };

    init();
  }, []);

  const statusLabel = (status: string) => {
    if (status === "pending") return "제안 대기";
    if (status === "question") return "질문 도착";
    if (status === "answered") return "답변 완료";
    if (status === "accepted") return "수락됨";
    if (status === "rejected") return "거절됨";
    if (status === "cancelled") return "취소됨";
    return status;
  };

  const statusColor = (status: string) => {
    if (status === "accepted") return { bg: "#f0fff4", color: "#276749" };
    if (status === "rejected") return { bg: "#fff3f3", color: "#e53e3e" };
    if (status === "question") return { bg: "#fff8f5", color: "#FF6B00" };
    if (status === "answered") return { bg: "#f0f9ff", color: "#0ea5e9" };
    return { bg: "#f5f5f5", color: "#666" };
  };

  const formatPay = (pay?: number) => {
    if (!pay) return "협의";
    return `${Number(pay).toLocaleString()}원`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <div style={{ fontSize: "14px", color: "#999" }}>불러오는 중...</div>
      </div>
    );
  }

  const isEmployer = profile?.user_type === "구인자";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Apple SD Gothic Neo', sans-serif", paddingBottom: "80px" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/mypage" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← 내정보</Link>
        <span style={{ fontSize: "16px", fontWeight: 800, color: "#1a1a1a" }}>
          {isEmployer ? "보낸 포지션 제안" : "받은 포지션 제안"}
        </span>
        <div style={{ width: "52px" }} />
      </header>

      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "20px" }}>
        <div style={{ background: isEmployer ? "#fff8f5" : "#f0f9ff", border: "1px solid " + (isEmployer ? "#ffd9bf" : "#bae6fd"), borderRadius: "16px", padding: "16px 18px", marginBottom: "14px" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#1a1a1a", marginBottom: "6px" }}>
            {isEmployer ? "제안 이력 관리" : "제안 확인 안내"}
          </div>
          <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
            {isEmployer
              ? "보낸 포지션 제안의 진행 상태를 확인할 수 있습니다. 구직자가 제안을 수락하면 연락처가 표시됩니다."
              : "받은 제안의 상태를 확인할 수 있습니다. 제안을 수락한 경우에만 구인자에게 연락처가 공개됩니다."}
          </div>
        </div>

        {offers.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "48px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
            <div style={{ fontSize: "15px", color: "#999" }}>
              {isEmployer ? "아직 보낸 포지션 제안이 없습니다" : "아직 받은 포지션 제안이 없습니다"}
            </div>
            {isEmployer && (
              <Link href="/resumes" style={{ display: "inline-block", marginTop: "16px", padding: "11px 18px", background: "#FF6B00", color: "#fff", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 700 }}>
                인재 찾기
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {offers.map((offer) => {
              const statusStyle = statusColor(offer.status);
              const offerMessages = messages[offer.id] || [];

              return (
                <div key={offer.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#1a1a1a", lineHeight: 1.4 }}>{offer.title}</div>
                      <div style={{ fontSize: "12px", color: "#999", marginTop: "3px" }}>
                        {offer.job_type} · {offer.location} · {formatPay(offer.pay)}
                      </div>
                    </div>
                    <span style={{ alignSelf: "flex-start", background: statusStyle.bg, color: statusStyle.color, fontSize: "11px", borderRadius: "6px", padding: "4px 8px", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {statusLabel(offer.status)}
                    </span>
                  </div>

                  {isEmployer && offer.resumes?.name && (
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                      제안 대상: {offer.resumes.name} · {offer.resumes.job_type || "직종 미입력"} · {offer.resumes.address || "지역 미입력"}
                    </div>
                  )}

                  <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", color: "#666", lineHeight: 1.6, marginBottom: "10px" }}>
                    <div>시작일: {offer.start_date}</div>
                    {offer.work_conditions && <div style={{ whiteSpace: "pre-wrap" }}>근무 조건: {offer.work_conditions}</div>}
                    <div style={{ whiteSpace: "pre-wrap" }}>제안 메시지: {offer.message}</div>
                  </div>

                  {offerMessages.length > 0 && (
                    <div style={{ border: "1px solid #eee", borderRadius: "10px", overflow: "hidden", marginBottom: "10px" }}>
                      <div style={{ background: "#fafafa", padding: "8px 10px", fontSize: "11px", color: "#999", fontWeight: 700 }}>질문 및 답변</div>
                      {offerMessages.map((message) => (
                        <div key={message.id} style={{ padding: "9px 10px", borderTop: "1px solid #f5f5f5" }}>
                          <div style={{ fontSize: "12px", color: "#333", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{message.message}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isEmployer && offer.status === "accepted" && (
                    <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "10px", padding: "10px", fontSize: "12px", color: "#276749", lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 800, marginBottom: "4px" }}>구직자가 제안을 수락했습니다</div>
                      <div>전화번호: {offer.resumes?.phone || "연락처 미입력"}</div>
                      <div>이메일: {offer.resumes?.email || "이메일 미입력"}</div>
                    </div>
                  )}

                  {!isEmployer && offer.status === "accepted" && (
                    <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "10px", padding: "10px", fontSize: "12px", color: "#276749", lineHeight: 1.5 }}>
                      제안을 수락했습니다. 이제 해당 구인자가 연락처를 확인할 수 있습니다.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
