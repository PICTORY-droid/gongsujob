"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { LoadingScreen } from "@/components/ui/Feedback";
import { colors } from "@/components/ui/theme";
import { useSession } from "@/hooks/useSession";
import { getConfirmedWorker } from "@/services/workforce.service";
import { buildContractSections } from "@/domain/workforce";
import { ROUTES } from "@/lib/constants";
import type { ConfirmedWorker } from "@/types/domain";

/**
 * 근로계약서 (인쇄·PDF 저장용).
 * 고용노동부 건설일용근로자 표준근로계약서의 기재 항목을 따라, 공고·제안에 있는 값을 미리 채운다.
 * 브라우저 인쇄 기능으로 종이 출력 또는 'PDF로 저장'할 수 있다(별도 서버·라이브러리 없음).
 */
export default function ContractContainer({ offerId }: { offerId: string }) {
  const { user, loading: sessionLoading } = useSession({ requireAuth: true });
  const [result, setResult] = useState<{ key: string; worker: ConfirmedWorker | null } | null>(null);
  const key = `${user?.id}:${offerId}`;

  useEffect(() => {
    if (!user) return;
    let stale = false;
    getConfirmedWorker(user.id, offerId).then((worker) => {
      if (!stale) setResult({ key: `${user.id}:${offerId}`, worker });
    });
    return () => {
      stale = true;
    };
  }, [user, offerId]);

  if (sessionLoading || result?.key !== key) return <LoadingScreen />;

  const worker = result.worker;
  if (!worker) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "20px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "15px", color: colors.sub }}>수락된 제안만 근로계약서를 만들 수 있습니다.</p>
        <Link href={ROUTES.manage} style={{ color: colors.blue, fontWeight: 700 }}>현장관리로 돌아가기</Link>
      </main>
    );
  }

  return <ContractSheet worker={worker} />;
}

/** 근로계약서 본문 (표시 전용) */
export function ContractSheet({ worker }: { worker: ConfirmedWorker }) {
  const sections = buildContractSections(worker);

  return (
    <main className="gs-print-page" style={{ minHeight: "100vh", background: colors.page, padding: "clamp(12px, 3vw, 32px) 12px 48px" }}>
      <div className="gs-no-print" style={{ maxWidth: "800px", margin: "0 auto 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <Link href={ROUTES.manage} style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: colors.sub, fontSize: "14px", textDecoration: "none", minHeight: "44px" }}>
          <ArrowLeft size={16} aria-hidden="true" /> 현장관리
        </Link>
        <button type="button" onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: "6px", minHeight: "44px", padding: "0 18px", borderRadius: "var(--gs-radius-md)", border: "none", background: colors.navy, color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
          <Printer size={18} aria-hidden="true" /> 인쇄 · PDF 저장
        </button>
      </div>

      <article className="gs-print-sheet" style={{ maxWidth: "800px", margin: "0 auto", background: "#fff", border: `1px solid ${colors.line}`, borderRadius: "var(--gs-radius-md)", boxShadow: "var(--gs-shadow-sm)", padding: "clamp(20px, 5vw, 48px)", color: "#111", fontSize: "13px", lineHeight: 1.6 }}>
        <h1 style={{ margin: "0 0 4px", textAlign: "center", fontSize: "22px", fontWeight: 800, letterSpacing: "0.2em" }}>근로계약서</h1>
        <p style={{ margin: "0 0 20px", textAlign: "center", fontSize: "12px", color: "#555" }}>(건설일용근로자)</p>

        <p style={{ margin: "0 0 16px" }}>
          사업주(이하 &quot;갑&quot;)와 근로자(이하 &quot;을&quot;)는 다음과 같이 근로계약을 체결한다.
        </p>

        {sections.map((section) => (
          <section key={section.title} style={{ marginBottom: "14px", breakInside: "avoid" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 800 }}>{section.title}</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <tbody>
                {section.fields.map((field) => (
                  <tr key={field.label}>
                    <th scope="row" style={{ width: "28%", textAlign: "left", fontWeight: 600, background: "#f4f5f7", border: "1px solid #c9ccd2", padding: "7px 10px" }}>
                      {field.label}
                    </th>
                    <td style={{ border: "1px solid #c9ccd2", padding: "7px 10px", minHeight: "32px", height: "32px", wordBreak: "keep-all" }}>{field.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        <section style={{ margin: "18px 0", breakInside: "avoid" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 800 }}>기타</h2>
          <ol style={{ margin: 0, paddingLeft: "18px" }}>
            <li>&quot;갑&quot;은 근로계약을 체결함과 동시에 본 계약서를 사본하여 &quot;을&quot;에게 교부한다.</li>
            <li>이 계약에 정하지 않은 사항은 근로기준법 등 관계 법령에 따른다.</li>
          </ol>
        </section>

        <p style={{ margin: "24px 0 18px", textAlign: "center" }}>________년 ____월 ____일</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {["사업주(갑)", "근로자(을)"].map((who) => (
            <div key={who} style={{ border: "1px solid #c9ccd2", borderRadius: "6px", padding: "12px" }}>
              <div style={{ fontWeight: 700, marginBottom: "10px" }}>{who}</div>
              <div>성명: ____________________ (서명)</div>
            </div>
          ))}
        </div>

        <p className="gs-no-print" style={{ margin: "22px 0 0", fontSize: "12px", color: colors.muted }}>
          이 양식은 고용노동부 건설일용근로자 표준근로계약서의 기재 항목을 바탕으로 한 작성 보조용입니다. 빈칸은 직접 작성하고, 최신 서식은 고용노동부 노동포털(labor.moel.go.kr)에서 확인하세요.
        </p>
      </article>
    </main>
  );
}
