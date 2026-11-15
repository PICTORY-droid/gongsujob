"use client";

import Link from "next/link";
import { Download, FileSignature, Minus, Phone, Plus } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { EmptyState, LoadingScreen, Notice } from "@/components/ui/Feedback";
import { card, colors, pageShell } from "@/components/ui/theme";
import { buildLedger, type WorkerGroup } from "@/domain/workforce";
import { MAX_DAYS, MIN_DAYS } from "@/domain/net-pay";
import { useManage } from "@/features/manage/useManage";
import { ROUTES } from "@/lib/constants";

/** 현장관리 (구인자 전용): 현장별 확정 인력 · 노임대장 엑셀 · 근로계약서 */
export default function ManageContainer() {
  const manage = useManage();

  if (manage.loading) return <LoadingScreen />;

  return (
    <div style={pageShell()} className="gs-page-bottom">
      <AppHeader />
      <div className="gs-container" style={{ paddingBlock: "20px" }}>
        <header style={{ marginBottom: "18px" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(22px, 1.4vw + 16px, 30px)", fontWeight: 800, color: colors.ink }}>현장관리</h1>
          <p style={{ margin: "6px 0 0", fontSize: "14px", color: colors.sub }}>제안을 수락한 근로자가 현장별로 모입니다. 근무일수를 입력하고 노임대장·근로계약서를 만드세요.</p>
        </header>

        {!manage.isEmployer ? (
          <EmptyState icon="🔒" text="현장관리는 구인자 계정에서 이용할 수 있습니다" boxed />
        ) : manage.loadFailed ? (
          <Notice message="확정 인력을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." tone="error" />
        ) : manage.groups.length === 0 ? (
          <EmptyState
            icon="👷"
            text="아직 확정된 인력이 없습니다. 인재에게 제안을 보내고 수락을 받으면 여기에 표시됩니다."
            boxed
            action={
              <Link href={ROUTES.resumes} style={{ display: "inline-block", marginTop: "16px", padding: "12px 22px", background: colors.navy, color: "#fff", borderRadius: "999px", textDecoration: "none", fontSize: "14px", fontWeight: 700 }}>
                인재 찾기
              </Link>
            }
          />
        ) : (
          <>
            {manage.error && <Notice message={manage.error} tone="error" />}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {manage.groups.map((group) => (
                <SiteCard key={group.key} group={group} manage={manage} />
              ))}
            </div>
            <p style={{ margin: "18px 0 0", fontSize: "12px", color: colors.muted, lineHeight: 1.6 }}>
              ※ 공제액은 고용보험·일용근로소득세·지방소득세 기준 예상치입니다. 국민연금·건강보험 적용 대상자는 별도로 확인하세요.
            </p>
          </>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
}

type SiteCardActions = Pick<ReturnType<typeof useManage>, "daysByWorker" | "changeDays" | "downloadLedger" | "downloading">;

/** 현장 한 곳의 확정 인력 카드 (표시 전용, 동작은 props로 받음) */
export function SiteCard({ group, manage }: { group: WorkerGroup; manage: SiteCardActions }) {
  const ledger = buildLedger(group.workers, manage.daysByWorker);
  const busy = manage.downloading === group.key;

  return (
    <section style={{ ...card, padding: "clamp(16px, 2.5vw, 24px)" }} aria-labelledby={`site-${group.key}`}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
        <div style={{ minWidth: 0 }}>
          <h2 id={`site-${group.key}`} style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: colors.ink }}>{group.title}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: colors.sub }}>
            {group.site} · 시작 {group.startDate} · 확정 {group.workers.length}명
          </p>
        </div>
        <button
          type="button"
          onClick={() => manage.downloadLedger(group)}
          disabled={busy}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", minHeight: "44px", padding: "0 16px", borderRadius: "var(--gs-radius-md)", border: "none", background: busy ? colors.disabled : "#1f7a4d", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}
        >
          <Download size={18} aria-hidden="true" />
          {busy ? "만드는 중..." : "노임대장 엑셀"}
        </button>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {group.workers.map((worker, index) => {
          const row = ledger.rows[index];
          return (
            <li key={worker.id} className="gs-worker-row" style={{ border: `1px solid ${colors.line}`, borderRadius: "var(--gs-radius-md)", padding: "12px 14px", background: colors.surface }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "15px", color: colors.ink }}>{worker.workerName}</strong>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: colors.brandText, background: colors.brandTint, borderRadius: "6px", padding: "2px 7px" }}>{row.jobType || "직종 미입력"}</span>
                </div>
                {worker.phone ? (
                  <a href={`tel:${worker.phone.replace(/[^0-9+]/g, "")}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px", fontSize: "13px", color: colors.blue, textDecoration: "none" }}>
                    <Phone size={13} aria-hidden="true" /> {worker.phone}
                  </a>
                ) : (
                  <span style={{ display: "block", marginTop: "4px", fontSize: "13px", color: colors.muted }}>연락처 미입력</span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }} role="group" aria-label={`${worker.workerName} 근무일수`}>
                <StepButton label="근무일 줄이기" disabled={row.days <= MIN_DAYS} onClick={() => manage.changeDays(worker.id, row.days - 1)}>
                  <Minus size={16} />
                </StepButton>
                <span style={{ minWidth: "44px", textAlign: "center", fontSize: "15px", fontWeight: 700, color: colors.ink }} aria-live="polite">
                  {row.days}일
                </span>
                <StepButton label="근무일 늘리기" disabled={row.days >= MAX_DAYS} onClick={() => manage.changeDays(worker.id, row.days + 1)}>
                  <Plus size={16} />
                </StepButton>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: colors.muted }}>실지급 예상 (일당 {worker.pay.toLocaleString()}원)</div>
                <div style={{ fontSize: "17px", fontWeight: 800, color: colors.brandText }}>{row.net.toLocaleString()}원</div>
              </div>

              <Link href={`${ROUTES.manage}/contract/${worker.id}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", minHeight: "40px", padding: "0 12px", borderRadius: "var(--gs-radius-md)", border: `1px solid ${colors.blueBorder}`, color: colors.navy, fontSize: "13px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                <FileSignature size={16} aria-hidden="true" /> 근로계약서
              </Link>
            </li>
          );
        })}
      </ul>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", flexWrap: "wrap", marginTop: "12px", fontSize: "13px", color: colors.sub }}>
        <span>총지급 <strong style={{ color: colors.ink }}>{ledger.totals.total.toLocaleString()}원</strong></span>
        <span>공제 <strong style={{ color: colors.ink }}>{ledger.totals.totalDeduction.toLocaleString()}원</strong></span>
        <span>실지급 <strong style={{ color: colors.brandText }}>{ledger.totals.net.toLocaleString()}원</strong></span>
      </div>
    </section>
  );
}

function StepButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={onClick} style={{ width: "36px", height: "36px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", border: `1px solid ${colors.line}`, background: colors.surface, color: disabled ? colors.disabled : colors.navy, cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  );
}
