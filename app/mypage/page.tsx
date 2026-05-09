"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [positionOffers, setPositionOffers] = useState<any[]>([]);
  const [offerMessages, setOfferMessages] = useState<Record<string, any[]>>({});
  const [questionText, setQuestionText] = useState<Record<string, string>>({});
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState("");
  const [offerToast, setOfferToast] = useState("");
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profile);

      const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setMyJobs(jobs || []);

      const { data: apps } = await supabase
        .from("applications")
        .select("*, jobs(title, region, pay, pay_type)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setMyApplications(apps || []);

      await fetchPositionOffers(user.id, profile?.user_type);

      setLoading(false);
    };

    init();
  }, []);

  const fetchPositionOffers = async (userId: string, userType?: string) => {
    const isEmployer = userType === "구인자";

    let query = supabase
      .from("position_offers")
      .select("*, resumes(name, phone, email, address, job_type), jobs(title, region, pay, pay_type)")
      .order("created_at", { ascending: false });

    query = isEmployer
      ? query.eq("employer_user_id", userId)
      : query.eq("seeker_user_id", userId);

    const { data, error } = await query;

    if (error) {
      setPositionOffers([]);
      return;
    }

    const offers = data || [];
    setPositionOffers(offers);

    const offerIds = offers.map((offer: any) => offer.id);

    if (offerIds.length === 0) {
      setOfferMessages({});
      return;
    }

    const { data: messages } = await supabase
      .from("position_offer_messages")
      .select("*")
      .in("offer_id", offerIds)
      .order("created_at", { ascending: true });

    const grouped: Record<string, any[]> = {};

    (messages || []).forEach((message: any) => {
      if (!grouped[message.offer_id]) grouped[message.offer_id] = [];
      grouped[message.offer_id].push(message);
    });

    setOfferMessages(grouped);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("이 공고를 삭제하시겠습니까?")) return;

    await supabase.from("jobs").delete().eq("id", jobId);
    setMyJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const handleOfferStatus = async (offer: any, status: "accepted" | "rejected") => {
    if (!user) return;

    const { error } = await supabase
      .from("position_offers")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", offer.id);

    if (error) {
      setActionMessage("처리 실패: " + error.message);
      return;
    }

    const isAccepted = status === "accepted";

    await supabase.from("notifications").insert({
      user_id: offer.employer_user_id,
      type: isAccepted ? "position_offer_accepted" : "position_offer_rejected",
      title: isAccepted ? "포지션 제안이 수락되었습니다" : "포지션 제안이 거절되었습니다",
      message: isAccepted
        ? "구직자가 제안을 수락했습니다. 이제 연락처 확인이 가능합니다."
        : "구직자가 제안을 거절했습니다.",
      link_url: "/mypage",
    });

    setSelectedOffer((prev: any) => prev?.id === offer.id ? { ...prev, status } : prev);
    setActionMessage(isAccepted ? "제안을 수락했습니다." : "제안을 거절했습니다.");
    await fetchPositionOffers(user.id, profile?.user_type);
  };

  const handleSendQuestion = async (offer: any) => {
    if (!user) return;

    const text = (questionText[offer.id] || "").trim();

    if (!text) {
      setActionMessage("질문 내용을 입력해주세요.");
      return;
    }

    const { data: newMessage, error: messageError } = await supabase
      .from("position_offer_messages")
      .insert({
        offer_id: offer.id,
        sender_user_id: user.id,
        message: text,
      })
      .select("*")
      .single();

    if (messageError) {
      setActionMessage("질문 전송 실패: " + messageError.message);
      return;
    }

    await supabase
      .from("position_offers")
      .update({
        status: "question",
        updated_at: new Date().toISOString(),
      })
      .eq("id", offer.id);

    await supabase.from("notifications").insert({
      user_id: offer.employer_user_id,
      type: "position_offer_question",
      title: "포지션 제안에 질문이 도착했습니다",
      message: text,
      link_url: "/mypage",
    });

    if (newMessage) {
      setOfferMessages(prev => ({
        ...prev,
        [offer.id]: [...(prev[offer.id] || []), newMessage],
      }));
    }

    setSelectedOffer((prev: any) => prev?.id === offer.id ? { ...prev, status: "question" } : prev);
    setQuestionText(prev => ({ ...prev, [offer.id]: "" }));
    setActionMessage("");
    setOfferToast("질문을 보냈습니다.");
    setTimeout(() => setOfferToast(""), 1800);
    await fetchPositionOffers(user.id, profile?.user_type);
  };

  const handleSendAnswer = async (offer: any) => {
    if (!user) return;

    const text = (answerText[offer.id] || "").trim();

    if (!text) {
      setActionMessage("답변 내용을 입력해주세요.");
      return;
    }

    const { data: newAnswer, error: messageError } = await supabase
      .from("position_offer_messages")
      .insert({
        offer_id: offer.id,
        sender_user_id: user.id,
        message: text,
      })
      .select("*")
      .single();

    if (messageError) {
      setActionMessage("답변 전송 실패: " + messageError.message);
      return;
    }

    await supabase
      .from("position_offers")
      .update({
        status: "answered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", offer.id);

    await supabase.from("notifications").insert({
      user_id: offer.seeker_user_id,
      type: "position_offer_answer",
      title: "포지션 제안 질문에 답변이 도착했습니다",
      message: text,
      link_url: "/mypage",
    });

    if (newAnswer) {
      setOfferMessages(prev => ({
        ...prev,
        [offer.id]: [...(prev[offer.id] || []), newAnswer],
      }));
    }

    setSelectedOffer((prev: any) => prev?.id === offer.id ? { ...prev, status: "answered" } : prev);
    setAnswerText(prev => ({ ...prev, [offer.id]: "" }));
    setActionMessage("");
    setOfferToast("답변을 보냈습니다.");
    setTimeout(() => setOfferToast(""), 1800);
    await fetchPositionOffers(user.id, profile?.user_type);
  };

  const statusLabel = (status: string, isEmployerView = false) => {
    if (status === "pending") return "제안 대기";
    if (status === "question") return isEmployerView ? "질문 도착" : "답변 대기";
    if (status === "answered") return isEmployerView ? "답변 완료" : "답변 도착";
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

  const employerMenus = [
    { icon: "📋", label: "공고 등록", desc: "새 구인 공고 올리기", href: "/jobs/write" },
    { icon: "🏗️", label: "전체 공고 보기", desc: "등록된 모든 공고", href: "/jobs" },
    { icon: "👷", label: "인재 찾기", desc: "등록된 근로자 보기", href: "/resumes" },
    { icon: "💼", label: "포지션 제안 관리", desc: "보낸 제안 이력 확인", href: "__offers_modal__" },
  ];

  const seekerMenus = [
    { icon: "📝", label: "이력서 작성·수정", desc: "내 이력서 관리", href: "/resume/write" },
    { icon: "📋", label: "공고 보기", desc: "채용 공고 둘러보기", href: "/jobs" },
    { icon: "💼", label: "포지션 제안 관리", desc: "받은 제안 확인", href: "__offers_modal__" },
  ];

  const menus = isEmployer ? employerMenus : seekerMenus;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Apple SD Gothic Neo', sans-serif", paddingBottom: "80px" }}>
      {offerToast && (
        <div style={{ position: "fixed", top: "72px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.78)", color: "#fff", fontSize: "13px", padding: "10px 18px", borderRadius: "999px", zIndex: 500, whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}>
          {offerToast}
        </div>
      )}
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← 홈</Link>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>내 정보</span>
        <button onClick={handleLogout} style={{ fontSize: "13px", color: "#999", border: "none", background: "none", cursor: "pointer" }}>로그아웃</button>
      </header>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px" }}>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px 20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "#fff", fontWeight: 700, overflow: "hidden", flexShrink: 0 }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : profile?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a1a" }}>{profile?.name || "이름 없음"}</div>
            <div style={{ fontSize: "13px", color: "#999", marginTop: "2px" }}>{user?.email}</div>
            <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
              <span style={{ background: isEmployer ? "#fff3e0" : "#f0f9ff", color: isEmployer ? "#FF6B00" : "#0ea5e9", fontSize: "11px", borderRadius: "6px", padding: "3px 8px", fontWeight: 600 }}>
                {isEmployer ? "🏗️ 구인자 (소장님)" : "👷 구직자"}
              </span>
              {profile?.phone && (
                <span style={{ background: "#f5f5f5", color: "#666", fontSize: "11px", borderRadius: "6px", padding: "3px 8px" }}>
                  📞 {profile.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {isEmployer ? (
          <div style={{ background: "#fff8f5", border: "1px solid #ffd9bf", borderRadius: "16px", padding: "16px 18px", marginBottom: "12px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#1a1a1a", marginBottom: "6px" }}>
              🔐 인재 연락처 보호 안내
            </div>
            <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
              구직자의 연락처는 바로 공개되지 않습니다. 구인자는 포지션 제안을 보낼 수 있고, 구직자가 제안을 수락한 경우에만 연락처를 확인할 수 있습니다.
            </div>
          </div>
        ) : (
          <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "16px", padding: "16px 18px", marginBottom: "12px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#1a1a1a", marginBottom: "6px" }}>
              🔐 내 연락처 공개 안내
            </div>
            <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
              제안을 수락한 경우에만 구인자에게 연락처가 공개됩니다. 수락 전에는 연락처가 공개되지 않습니다.
            </div>
          </div>
        )}

        {actionMessage && (
          <div style={{ background: actionMessage.includes("실패") || actionMessage.includes("입력") ? "#fff3f3" : "#f0fff4", border: "1px solid " + (actionMessage.includes("실패") || actionMessage.includes("입력") ? "#ffd0d0" : "#9ae6b4"), borderRadius: "12px", padding: "12px 14px", fontSize: "13px", color: actionMessage.includes("실패") || actionMessage.includes("입력") ? "#e53e3e" : "#276749", marginBottom: "12px", lineHeight: 1.5 }}>
            {actionMessage}
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: "16px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px 8px", fontSize: "12px", color: "#999", fontWeight: 600 }}>빠른 메뉴</div>
          {menus.map((item, i) => (
            item.href === "__offers_modal__" ? (
              <button
                key={i}
                onClick={() => setShowOffersModal(true)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", background: "none", border: "none", borderTop: "1px solid #f5f5f5", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ fontSize: "22px" }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>{item.desc}</div>
                </div>
                <span style={{ color: "#ccc", fontSize: "18px" }}>›</span>
              </button>
            ) : (
              <Link key={i} href={item.href} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", textDecoration: "none", borderTop: "1px solid #f5f5f5" }}>
                <span style={{ fontSize: "22px" }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>{item.desc}</div>
                </div>
                <span style={{ color: "#ccc", fontSize: "18px" }}>›</span>
              </Link>
            )
          ))}
        </div>

        {showOffersModal && (
          <div
            onClick={() => {
              setShowOffersModal(false);
              setSelectedOffer(null);
            }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: "520px", maxHeight: "82vh", overflowY: "auto", background: "#f8f9fa", borderRadius: "20px", padding: "18px", boxShadow: "0 12px 40px rgba(0,0,0,0.25)" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ fontSize: "17px", fontWeight: 800, color: "#1a1a1a" }}>
                  {isEmployer ? "보낸 포지션 제안" : "받은 포지션 제안"}
                </div>
                <button
                  onClick={() => {
                    setShowOffersModal(false);
                    setSelectedOffer(null);
                  }}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "#fff", color: "#666", fontSize: "18px", cursor: "pointer" }}
                >
                  ×
                </button>
              </div>

              <div style={{ background: isEmployer ? "#fff8f5" : "#f0f9ff", border: "1px solid " + (isEmployer ? "#ffd9bf" : "#bae6fd"), borderRadius: "16px", padding: "16px 18px", marginBottom: "12px" }}>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#1a1a1a", marginBottom: "6px" }}>
                  {isEmployer ? "제안 이력 관리" : "제안 확인 안내"}
                </div>
                <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
                  {isEmployer
                    ? "보낸 포지션 제안의 진행 상태를 확인할 수 있습니다. 구직자가 제안을 수락하면 연락처가 표시됩니다."
                    : "받은 제안의 상태를 확인할 수 있습니다. 제안을 수락한 경우에만 구인자에게 연락처가 공개됩니다."}
                </div>
              </div>

              {positionOffers.length === 0 ? (
                <div style={{ background: "#fff", borderRadius: "16px", padding: "36px 20px", textAlign: "center", color: "#999", fontSize: "13px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  {isEmployer ? "아직 보낸 제안이 없습니다" : "아직 받은 제안이 없습니다"}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {positionOffers.map((offer) => {
                    const statusStyle = statusColor(offer.status);

                    return (
                      <button
                        key={offer.id}
                        onClick={() => setSelectedOffer(offer)}
                        style={{ width: "100%", background: "#fff", border: "1px solid #eee", borderRadius: "14px", padding: "14px", cursor: "pointer", textAlign: "left", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "14px", fontWeight: 800, color: "#1a1a1a", lineHeight: 1.4 }}>
                              {offer.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "#999", marginTop: "3px" }}>
                              {offer.job_type} · {offer.location} · {formatPay(offer.pay)}
                            </div>
                          </div>
                          <span style={{ alignSelf: "flex-start", background: statusStyle.bg, color: statusStyle.color, fontSize: "11px", borderRadius: "6px", padding: "4px 8px", fontWeight: 700, whiteSpace: "nowrap" }}>
                            {statusLabel(offer.status, isEmployer)}
                          </span>
                        </div>

                        {isEmployer && offer.resumes?.name && (
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            제안 대상: {offer.resumes.name} · {offer.resumes.job_type || "직종 미입력"} · {offer.resumes.address || "지역 미입력"}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedOffer && (() => {
          const offer = selectedOffer;
          const statusStyle = statusColor(offer.status);
          const messages = offerMessages[offer.id] || [];
          const hasAskedQuestion = messages.some((message: any) => message.sender_user_id === offer.seeker_user_id);
          const hasAnswered = messages.some((message: any) => message.sender_user_id === offer.employer_user_id);

          return (
            <div
              onClick={() => setSelectedOffer(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 320, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: "100%", maxWidth: "520px", maxHeight: "82vh", overflowY: "auto", background: "#fff", borderRadius: "20px", padding: "20px", boxShadow: "0 12px 40px rgba(0,0,0,0.28)" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div style={{ fontSize: "17px", fontWeight: 800, color: "#1a1a1a" }}>
                    {isEmployer ? "보낸 제안 상세" : "받은 제안 상세"}
                  </div>
                  <button
                    onClick={() => setSelectedOffer(null)}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "#f5f5f5", color: "#666", fontSize: "18px", cursor: "pointer" }}
                  >
                    ×
                  </button>
                </div>

                {actionMessage && (
                  <div style={{ background: actionMessage.includes("실패") || actionMessage.includes("입력") ? "#fff3f3" : "#f0fff4", border: "1px solid " + (actionMessage.includes("실패") || actionMessage.includes("입력") ? "#ffd0d0" : "#9ae6b4"), borderRadius: "12px", padding: "12px 14px", fontSize: "13px", color: actionMessage.includes("실패") || actionMessage.includes("입력") ? "#e53e3e" : "#276749", marginBottom: "12px", lineHeight: 1.5 }}>
                    {actionMessage}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#1a1a1a", lineHeight: 1.4 }}>
                      {offer.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                      {offer.job_type} · {offer.location} · {formatPay(offer.pay)}
                    </div>
                  </div>
                  <span style={{ alignSelf: "flex-start", background: statusStyle.bg, color: statusStyle.color, fontSize: "11px", borderRadius: "6px", padding: "4px 8px", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {statusLabel(offer.status, isEmployer)}
                  </span>
                </div>

                {isEmployer && offer.resumes?.name && (
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
                    제안 대상: {offer.resumes.name} · {offer.resumes.job_type || "직종 미입력"} · {offer.resumes.address || "지역 미입력"}
                  </div>
                )}

                <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "12px 14px", fontSize: "12px", color: "#666", lineHeight: 1.7, marginBottom: "12px" }}>
                  <div>시작일: {offer.start_date}</div>
                  {offer.work_conditions && <div style={{ whiteSpace: "pre-wrap" }}>근무 조건: {offer.work_conditions}</div>}
                  <div style={{ whiteSpace: "pre-wrap" }}>제안 메시지: {offer.message}</div>
                </div>

                {messages.length > 0 && (
                  <div style={{ border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }}>
                    <div style={{ background: "#fafafa", padding: "9px 12px", fontSize: "11px", color: "#999", fontWeight: 700 }}>질문 및 답변</div>
                    {messages.map((message) => (
                      <div key={message.id} style={{ padding: "10px 12px", borderTop: "1px solid #f5f5f5" }}>
                        <div style={{ fontSize: "12px", color: "#333", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{message.message}</div>
                      </div>
                    ))}
                  </div>
                )}

                {!isEmployer && (offer.status === "pending" || offer.status === "answered" || offer.status === "question") && (
                  <div>
                    <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.5, marginBottom: "10px" }}>
                      제안을 수락하면 구인자에게 연락처가 공개됩니다. 수락 전에는 연락처가 공개되지 않습니다.
                    </div>

                    <textarea
                      value={questionText[offer.id] || ""}
                      onChange={(e) => setQuestionText(prev => ({ ...prev, [offer.id]: e.target.value }))}
                      placeholder={hasAskedQuestion ? "추가로 궁금한 점을 입력할 수 있습니다" : "궁금한 점을 구인자에게 질문할 수 있습니다"}
                      rows={3}
                      style={{ width: "100%", padding: "10px", border: "1px solid #eee", borderRadius: "10px", fontSize: "13px", boxSizing: "border-box", resize: "vertical", marginBottom: "8px" }}
                    />

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleOfferStatus(offer, "accepted")} style={{ flex: 1, padding: "10px", background: "#FF6B00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}>
                        수락
                      </button>
                      <button onClick={() => handleOfferStatus(offer, "rejected")} style={{ flex: 1, padding: "10px", background: "#fff", color: "#e53e3e", border: "1px solid #ffd0d0", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                        거절
                      </button>
                      <button onClick={() => handleSendQuestion(offer)} style={{ flex: 1, padding: "10px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}>
                        {hasAskedQuestion ? "추가 질문" : "질문"}
                      </button>
                    </div>
                  </div>
                )}

                {!isEmployer && offer.status === "accepted" && (
                  <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "10px", padding: "10px", fontSize: "12px", color: "#276749", lineHeight: 1.5 }}>
                    제안을 수락했습니다. 이제 해당 구인자가 연락처를 확인할 수 있습니다.
                  </div>
                )}

                {isEmployer && offer.status === "accepted" && (
                  <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "10px", padding: "10px", fontSize: "12px", color: "#276749", lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 800, marginBottom: "4px" }}>구직자가 제안을 수락했습니다</div>
                    <div>전화번호: {offer.resumes?.phone || "연락처 미입력"}</div>
                    <div>이메일: {offer.resumes?.email || "이메일 미입력"}</div>
                  </div>
                )}

                {isEmployer && offer.status !== "accepted" && offer.status !== "rejected" && (
                  <div>
                    <textarea
                      value={answerText[offer.id] || ""}
                      onChange={(e) => setAnswerText(prev => ({ ...prev, [offer.id]: e.target.value }))}
                      placeholder={hasAnswered ? "추가 답변을 입력할 수 있습니다" : "구직자 질문에 답변하거나 추가 안내를 보낼 수 있습니다"}
                      rows={3}
                      style={{ width: "100%", padding: "10px", border: "1px solid #eee", borderRadius: "10px", fontSize: "13px", boxSizing: "border-box", resize: "vertical", marginBottom: "8px" }}
                    />
                    <button onClick={() => handleSendAnswer(offer)} style={{ width: "100%", padding: "10px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}>{hasAnswered ? "추가 답변" : "답변 보내기"}</button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {isEmployer && myJobs.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "12px" }}>내가 등록한 공고 ({myJobs.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {myJobs.map(job => (
                <div key={job.id} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Link href={`/jobs/${job.id}`} style={{ flex: 1, textDecoration: "none" }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{job.title}</div>
                      <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{job.region} · {job.job_type} · {job.pay?.toLocaleString()}원/{job.pay_type}</div>
                    </Link>
                    <button onClick={() => handleDeleteJob(job.id)} style={{ fontSize: "12px", color: "#e53e3e", border: "1px solid #ffd0d0", borderRadius: "6px", padding: "4px 8px", background: "#fff", cursor: "pointer", marginLeft: "8px", flexShrink: 0 }}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isEmployer && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "12px" }}>
              지원 현황 {myApplications.length > 0 && <span style={{ color: "#FF6B00" }}>({myApplications.length})</span>}
            </div>
            {myApplications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#999", fontSize: "13px" }}>
                아직 지원한 공고가 없습니다<br />
                <Link href="/jobs" style={{ color: "#FF6B00", textDecoration: "none", fontWeight: 600, marginTop: "8px", display: "inline-block" }}>공고 보러 가기 →</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {myApplications.map((app, i) => (
                  <div key={i} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{app.jobs?.title || "공고 없음"}</div>
                      <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{app.jobs?.region} · {app.jobs?.pay?.toLocaleString()}원/{app.jobs?.pay_type}</div>
                    </div>
                    <span style={{ background: "#f0fff4", color: "#276749", fontSize: "11px", borderRadius: "6px", padding: "3px 8px", fontWeight: 600, flexShrink: 0, marginLeft: "8px" }}>{app.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "14px 20px 8px", fontSize: "12px", color: "#999", fontWeight: 600 }}>계정</div>
          <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", background: "none", border: "none", borderTop: "1px solid #f5f5f5", cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: "22px" }}>🚪</span>
            <span style={{ fontSize: "14px", color: "#e53e3e", fontWeight: 500 }}>로그아웃</span>
          </button>
        </div>
      </div>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eee", display: "flex", padding: "8px 0" }}>
        {[
          { icon: "🏠", label: "홈", href: "/" },
          { icon: "📋", label: "공고", href: "/jobs" },
          { icon: "👷", label: "인재", href: "/resumes" },
          { icon: "📝", label: "이력서", href: "/resume/write" },
          { icon: "👤", label: "내정보", href: "/mypage" },
        ].map((tab, i) => (
          <Link key={i} href={tab.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textDecoration: "none" }}>
            <span style={{ fontSize: "20px" }}>{tab.icon}</span>
            <span style={{ fontSize: "10px", color: i === 4 ? "#FF6B00" : "#999", fontWeight: i === 4 ? 600 : 400 }}>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
