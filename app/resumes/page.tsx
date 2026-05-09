"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const JOB_CATEGORIES = ["전체", "철근", "형틀", "방수", "도장", "미장", "전기", "배관", "용접", "타일", "조적", "기타"];

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [toast, setToast] = useState("");
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [contactAllowed, setContactAllowed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerSending, setOfferSending] = useState(false);
  const [offerMessage, setOfferMessage] = useState("");
  const [offerForm, setOfferForm] = useState({
    title: "",
    job_type: "",
    location: "",
    start_date: "",
    pay: "",
    work_conditions: "",
    message: "",
    job_id: "",
  });

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    const checkAndInit = async () => {
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

      const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setMyJobs(jobs || []);
    };

    checkAndInit();
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [selectedCategory]);

  const fetchResumes = async () => {
    setLoading(true);

    let query = supabase
      .from("resumes")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (selectedCategory !== "전체") {
      query = query.eq("job_type", selectedCategory);
    }

    const { data, error } = await query;
    if (!error && data) setResumes(data);

    setLoading(false);
  };

  const filtered = resumes.filter(r =>
    r.name?.includes(searchQuery) ||
    r.job_type?.includes(searchQuery) ||
    r.address?.includes(searchQuery) ||
    r.skills?.includes(searchQuery)
  );

  const maskPhone = (phone?: string) => {
    if (!phone) return "연락처 미입력";

    const onlyNumber = phone.replace(/[^0-9]/g, "");

    if (onlyNumber.length === 11) {
      return `${onlyNumber.slice(0, 3)}-****-${onlyNumber.slice(7)}`;
    }

    if (onlyNumber.length === 10) {
      return `${onlyNumber.slice(0, 3)}-***-${onlyNumber.slice(6)}`;
    }

    if (onlyNumber.length >= 8) {
      return `${onlyNumber.slice(0, 3)}-****-${onlyNumber.slice(-4)}`;
    }

    return "연락처 비공개";
  };

  const maskEmail = (email?: string) => {
    if (!email || !email.includes("@")) return "이메일 미입력";
    const [id, domain] = email.split("@");
    return `${id.slice(0, 4)}****@${domain}`;
  };

  const checkAcceptedOffer = async (resume: any) => {
    if (!user) return false;

    const { data } = await supabase
      .from("position_offers")
      .select("id")
      .eq("employer_user_id", user.id)
      .eq("resume_id", resume.id)
      .eq("status", "accepted")
      .limit(1)
      .maybeSingle();

    if (data) {
      await supabase.from("resume_contact_views").insert({
        employer_user_id: user.id,
        resume_id: resume.id,
      });

      return true;
    }

    return false;
  };

  const handleCardClick = async (resume: any) => {
    if (profile?.user_type !== "구인자") {
      setToast("구인전용 메뉴입니다");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    setSelectedResume(resume);
    setOfferOpen(false);
    setOfferMessage("");
    setContactAllowed(false);

    const allowed = await checkAcceptedOffer(resume);
    setContactAllowed(allowed);

    setOfferForm({
      title: "",
      job_type: "",
      location: "",
      start_date: "",
      pay: "",
        work_conditions: "",
      message: "이력서를 확인하고 현장 조건과 잘 맞아 보여 제안드립니다.",
      job_id: "",
    });
  };

  const handleSelectJob = (jobId: string) => {
    const job = myJobs.find(j => j.id === jobId);

    if (!job) {
      setOfferForm(prev => ({ ...prev, job_id: "" }));
      return;
    }

    setOfferForm(prev => ({
      ...prev,
      job_id: job.id,
      title: job.title || prev.title,
      job_type: job.job_type || prev.job_type,
      location: job.detail_address || job.region || prev.location,
      start_date: job.start_date || prev.start_date,
      pay: job.pay ? String(job.pay) : prev.pay,
      work_conditions: job.description || prev.work_conditions,
    }));
  };

  const handleSendOffer = async () => {
    if (!selectedResume || !user) return;

    if (!offerForm.title || !offerForm.job_type || !offerForm.location || !offerForm.start_date || !offerForm.pay || !offerForm.message) {
      setOfferMessage("필수 항목을 입력해주세요.");
      return;
    }

    setOfferSending(true);
    setOfferMessage("");

    const { data: offer, error } = await supabase
      .from("position_offers")
      .insert({
        employer_user_id: user.id,
        seeker_user_id: selectedResume.user_id,
        resume_id: selectedResume.id,
        job_id: offerForm.job_id || null,
        title: offerForm.title,
        job_type: offerForm.job_type,
        location: offerForm.location,
        start_date: offerForm.start_date,
        pay: Number(offerForm.pay),
        work_conditions: offerForm.work_conditions,
        message: offerForm.message,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      setOfferMessage("제안 발송 실패: " + error.message);
      setOfferSending(false);
      return;
    }

    await supabase.from("notifications").insert({
      user_id: selectedResume.user_id,
      type: "position_offer",
      title: "새 포지션 제안이 도착했습니다",
      message: offerForm.title,
      link_url: "/mypage",
    });

    if (offer?.id) {
      await supabase.from("position_offer_messages").insert({
        offer_id: offer.id,
        sender_user_id: user.id,
        message: offerForm.message,
      });
    }

    setOfferMessage("포지션 제안을 보냈습니다. 구직자가 수락하면 연락처를 확인할 수 있습니다.");
    setOfferSending(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Apple SD Gothic Neo', sans-serif", paddingBottom: "80px" }}>
      {toast && (
        <div style={{ position: "fixed", top: "72px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.75)", color: "#fff", fontSize: "13px", padding: "10px 20px", borderRadius: "999px", zIndex: 999, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {selectedResume && (
        <div onClick={() => setSelectedResume(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px", padding: "28px 24px 32px", width: "100%", maxWidth: "480px", maxHeight: "76vh", overflowY: "auto", boxShadow: "0 12px 40px rgba(0,0,0,0.25)" }}>
            <div style={{ width: "40px", height: "4px", background: "#eee", borderRadius: "2px", margin: "0 auto 20px" }} />

            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: selectedResume.photo_url ? "transparent" : "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                {selectedResume.photo_url
                  ? <img src={selectedResume.photo_url} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "24px", color: "#fff", fontWeight: 700 }}>{selectedResume.name?.charAt(0) || "👷"}</span>
                }
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a1a" }}>{selectedResume.name}</div>
                <div style={{ fontSize: "13px", color: "#999", marginTop: "2px" }}>{selectedResume.job_type} · 경력 {selectedResume.career_years || 0}년</div>
              </div>
            </div>

            <div style={{ background: "#fff8f5", border: "1px solid #ffd9bf", borderRadius: "12px", padding: "14px", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", color: "#FF6B00", fontWeight: 800, marginBottom: "6px" }}>🔐 개인정보 보호 안내</div>
              <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.5 }}>
                구직자의 연락처는 바로 공개되지 않습니다.<br />
                구직자가 포지션 제안을 수락하면 연락처 열람이 가능합니다.
              </div>
            </div>

            <div style={{ background: "#fff3e0", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#FF6B00", fontWeight: 700, marginBottom: "10px" }}>📞 연락처</div>
              {contactAllowed ? (
                <>
                  {selectedResume.phone && (
                    <a href={`tel:${selectedResume.phone}`} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", color: "#1a1a1a", fontWeight: 600 }}>{selectedResume.phone}</span>
                      <span style={{ fontSize: "11px", background: "#FF6B00", color: "#fff", borderRadius: "4px", padding: "2px 6px" }}>전화</span>
                    </a>
                  )}
                  {selectedResume.email && (
                    <div style={{ fontSize: "13px", color: "#666" }}>{selectedResume.email}</div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "6px" }}>전화번호: {maskPhone(selectedResume.phone)}</div>
                  <div style={{ fontSize: "13px", color: "#666" }}>이메일: {maskEmail(selectedResume.email)}</div>
                </>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {selectedResume.address && (
                <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>거주 지역</div>
                  <div style={{ fontSize: "14px", color: "#1a1a1a" }}>📍 {selectedResume.address}</div>
                </div>
              )}
              {selectedResume.skills && (
                <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>보유 기술</div>
                  <div style={{ fontSize: "14px", color: "#1a1a1a" }}>🛠 {selectedResume.skills}</div>
                </div>
              )}
              {selectedResume.certifications && (
                <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>자격증</div>
                  <div style={{ fontSize: "14px", color: "#1a1a1a" }}>📜 {selectedResume.certifications}</div>
                </div>
              )}
              {selectedResume.experience && (
                <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>경력 사항</div>
                  <div style={{ fontSize: "14px", color: "#1a1a1a", whiteSpace: "pre-wrap" }}>{selectedResume.experience}</div>
                </div>
              )}
            </div>

            {!contactAllowed && (
              <div style={{ marginTop: "16px" }}>
                {!offerOpen ? (
                  <button onClick={() => setOfferOpen(true)} style={{ width: "100%", padding: "14px", background: "#FF6B00", border: "none", borderRadius: "12px", fontSize: "14px", color: "#fff", cursor: "pointer", fontWeight: 800 }}>
                    포지션 제안하기
                  </button>
                ) : (
                  <div style={{ background: "#f8f9fa", borderRadius: "14px", padding: "16px", border: "1px solid #eee" }}>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#1a1a1a", marginBottom: "6px" }}>포지션 제안 작성</div>
                    <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.5, marginBottom: "14px" }}>
                      제안이 발송되면 구직자에게 앱 알림이 전달됩니다.<br />
                      구직자가 수락하면 연락처 열람이 가능합니다.
                    </div>

                    {myJobs.length > 0 && (
                      <div style={{ marginBottom: "10px" }}>
                        <label style={{ fontSize: "11px", color: "#999", display: "block", marginBottom: "5px" }}>관련 공고 선택</label>
                        <select value={offerForm.job_id} onChange={(e) => handleSelectJob(e.target.value)}
                          style={{ width: "100%", padding: "10px", border: "1px solid #eee", borderRadius: "10px", fontSize: "13px", boxSizing: "border-box" }}>
                          <option value="">직접 입력</option>
                          {myJobs.map(job => (
                            <option key={job.id} value={job.id}>{job.title}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {[
                      { key: "title", label: "제안 제목 *", placeholder: "예, 세종 철근 현장 작업 제안드립니다" },
                      { key: "job_type", label: "직종 *", placeholder: "예, 철근" },
                      { key: "location", label: "현장 위치 *", placeholder: "예, 세종시 어진동" },
                      { key: "start_date", label: "근무 시작일 *", placeholder: "예, 2026-05-15" },
                      { key: "pay", label: "예상 일당 *", placeholder: "예, 170000" },
                    ].map(field => (
                      <div key={field.key} style={{ marginBottom: "10px" }}>
                        <label style={{ fontSize: "11px", color: "#999", display: "block", marginBottom: "5px" }}>{field.label}</label>
                        <input value={(offerForm as any)[field.key]} onChange={(e) => setOfferForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          style={{ width: "100%", padding: "10px", border: "1px solid #eee", borderRadius: "10px", fontSize: "13px", boxSizing: "border-box" }} />
                      </div>
                    ))}

                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ fontSize: "11px", color: "#999", display: "block", marginBottom: "5px" }}>근무 조건</label>
                      <textarea value={offerForm.work_conditions} onChange={(e) => setOfferForm(prev => ({ ...prev, work_conditions: e.target.value }))}
                        placeholder="예, 아침 간식 제공, 점심 제공, 음료 제공"
                        rows={3}
                        style={{ width: "100%", padding: "10px", border: "1px solid #eee", borderRadius: "10px", fontSize: "13px", boxSizing: "border-box", resize: "vertical" }} />
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ fontSize: "11px", color: "#999", display: "block", marginBottom: "5px" }}>제안 메시지 *</label>
                      <textarea value={offerForm.message} onChange={(e) => setOfferForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="이력서를 보고 현장 조건과 잘 맞아 보여 제안드립니다."
                        rows={4}
                        style={{ width: "100%", padding: "10px", border: "1px solid #eee", borderRadius: "10px", fontSize: "13px", boxSizing: "border-box", resize: "vertical" }} />
                    </div>

                    {offerMessage && (
                      <div style={{ background: offerMessage.includes("실패") || offerMessage.includes("필수") ? "#fff3f3" : "#f0fff4", border: "1px solid " + (offerMessage.includes("실패") || offerMessage.includes("필수") ? "#ffd0d0" : "#9ae6b4"), borderRadius: "10px", padding: "10px", fontSize: "12px", color: offerMessage.includes("실패") || offerMessage.includes("필수") ? "#e53e3e" : "#276749", lineHeight: 1.5, marginBottom: "10px" }}>
                        {offerMessage}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => setOfferOpen(false)} style={{ flex: 1, padding: "12px", background: "#fff", border: "1px solid #ddd", borderRadius: "10px", fontSize: "13px", color: "#666", cursor: "pointer", fontWeight: 700 }}>
                        취소
                      </button>
                      <button onClick={handleSendOffer} disabled={offerSending} style={{ flex: 2, padding: "12px", background: offerSending ? "#ddd" : "#FF6B00", border: "none", borderRadius: "10px", fontSize: "13px", color: "#fff", cursor: offerSending ? "not-allowed" : "pointer", fontWeight: 800 }}>
                        {offerSending ? "발송 중..." : "제안 보내기"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button onClick={() => setSelectedResume(null)} style={{ marginTop: "12px", width: "100%", padding: "14px", background: "#f5f5f5", border: "none", borderRadius: "12px", fontSize: "14px", color: "#666", cursor: "pointer", fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      )}

      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← 홈</Link>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
          <img src="/logo.png" alt="로고" style={{ width: "28px", height: "28px", borderRadius: "6px", objectFit: "cover" }} />
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>현장공수잡</span>
        </Link>
        <div style={{ width: "40px" }} />
      </header>

      <div style={{ background: "#fff", padding: "12px 20px", borderBottom: "1px solid #eee" }}>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="이름, 직종, 지역 검색"
          style={{ width: "100%", padding: "10px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ background: "#fff", padding: "12px 20px", borderBottom: "1px solid #eee" }}>
        <div style={{ position: "relative" }}>
          <button onClick={(e) => { e.stopPropagation(); setDropdownOpen(prev => !prev); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 16px", border: "1.5px solid #FF6B00", borderRadius: "10px", background: "#fff", fontSize: "14px", fontWeight: 600, color: "#FF6B00", cursor: "pointer" }}>
            {selectedCategory === "전체" ? "직종 선택" : selectedCategory}
            <span style={{ fontSize: "11px" }}>{dropdownOpen ? "▲" : "▼"}</span>
          </button>
          {dropdownOpen && (
            <div style={{ position: "absolute", top: "44px", left: 0, background: "#fff", border: "1px solid #eee", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 50, minWidth: "160px", overflow: "hidden" }}>
              {JOB_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setSelectedCategory(cat); setDropdownOpen(false); }}
                  style={{ display: "block", width: "100%", padding: "11px 18px", border: "none", background: selectedCategory === cat ? "#fff8f5" : "#fff", fontSize: "14px", fontWeight: selectedCategory === cat ? 700 : 400, color: selectedCategory === cat ? "#FF6B00" : "#333", cursor: "pointer", textAlign: "left" }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999", fontSize: "14px" }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>👷</div>
            <div style={{ fontSize: "15px", color: "#999" }}>등록된 인재가 없습니다</div>
            {profile?.user_type !== "구인자" && (
              <Link href="/resume/write" style={{ display: "inline-block", marginTop: "16px", padding: "10px 24px", background: "#FF6B00", color: "#fff", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>이력서 등록하기</Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map(resume => (
              <div key={resume.id} onClick={() => handleCardClick(resume)}
                style={{ background: "#fff", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #eee", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: resume.skills ? "10px" : "0" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: resume.photo_url ? "transparent" : "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                    {resume.photo_url
                      ? <img src={resume.photo_url} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: "20px", color: "#fff", fontWeight: 700 }}>{resume.name?.charAt(0) || "👷"}</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>{resume.name}</div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>경력 {resume.career_years || 0}년 · {resume.address || "지역 미입력"}</div>
                  </div>
                  <div style={{ background: "#fff3e0", color: "#FF6B00", fontSize: "12px", borderRadius: "6px", padding: "4px 10px", fontWeight: 600 }}>
                    {resume.job_type || "직종 미입력"}
                  </div>
                </div>
                {resume.skills && (
                  <div style={{ fontSize: "12px", color: "#666", background: "#f8f9fa", borderRadius: "8px", padding: "8px 12px" }}>
                    🛠 {resume.skills}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
            <span style={{ fontSize: "10px", color: i === 2 ? "#FF6B00" : "#999", fontWeight: i === 2 ? 600 : 400 }}>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
