"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const TALLY_FORM_URL = "https://tally.so/r/1AD7jM";

function ContactContent() {
  const searchParams = useSearchParams();

  const iframeUrl = useMemo(() => {
    const params = new URLSearchParams();

    const jobId = searchParams.get("jobId");
    const jobTitle = searchParams.get("jobTitle");
    const userType = searchParams.get("userType");
    const fromPage = searchParams.get("fromPage");

    if (jobId) params.set("jobId", jobId);
    if (jobTitle) params.set("jobTitle", jobTitle);
    if (userType) params.set("userType", userType);
    if (fromPage) params.set("fromPage", fromPage);

    const query = params.toString();

    return query ? `${TALLY_FORM_URL}?${query}` : TALLY_FORM_URL;
  }, [searchParams]);

  return (
    <main style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Apple SD Gothic Neo', sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "14px 18px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ color: "#333", textDecoration: "none", fontSize: "14px", fontWeight: 700 }}>
            ← 홈으로
          </Link>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#1a1a1a" }}>
            문의하기
          </div>
          <div style={{ width: "48px" }} />
        </div>
      </header>

      <section style={{ maxWidth: "720px", margin: "0 auto", padding: "18px" }}>
        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <iframe
            src={iframeUrl}
            width="100%"
            height="780"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="공수잡 문의하기"
            style={{ border: "none", display: "block" }}
          />
        </div>
      </section>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>문의 페이지를 불러오는 중입니다.</div>}>
      <ContactContent />
    </Suspense>
  );
}
