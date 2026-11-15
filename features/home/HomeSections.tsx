import type { ReactNode } from "react";
import { colors } from "@/components/ui/theme";
import { Modal } from "@/components/ui/Modal";
import { SERVICE_HIGHLIGHTS, type ActionCard } from "@/features/home/home-menus";

/** 홈 화면 표시 컴포넌트 모음 (상태 없음) */

export function LoginRequiredModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return (
    <Modal onClose={onClose} backdrop="rgba(0,0,0,0.45)" labelledBy="login-required-title" panelStyle={{ maxWidth: "360px", borderRadius: "18px", padding: "24px 20px", boxShadow: "0 12px 36px rgba(0,0,0,0.22)", textAlign: "center" }}>
      <div style={{ fontSize: "32px", marginBottom: "10px" }}>🔐</div>
      <div id="login-required-title" style={{ fontSize: "18px", fontWeight: 800, color: colors.ink, marginBottom: "8px" }}>
        로그인이 필요합니다
      </div>
      <div style={{ fontSize: "13px", color: colors.sub, lineHeight: 1.6, marginBottom: "18px" }}>
        이 기능은 로그인 후 이용할 수 있습니다.
        <br />
        로그인 또는 회원가입 후 다시 이용해주세요.
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px", background: "var(--gs-surface)", border: "1px solid var(--gs-disabled)", borderRadius: "10px", fontSize: "13px", color: colors.sub, cursor: "pointer", fontWeight: 700 }}>
          닫기
        </button>
        <button type="button" onClick={onLogin} style={{ flex: 2, padding: "12px", background: colors.brand, border: "none", borderRadius: "10px", fontSize: "13px", color: "var(--gs-surface)", cursor: "pointer", fontWeight: 800 }}>
          로그인하기
        </button>
      </div>
    </Modal>
  );
}

export function HomeHero({ employer, searchQuery, onSearchChange }: { employer: boolean; searchQuery: string; onSearchChange: (value: string) => void }) {
  return (
    <section className="gs-hero" style={{ background: "radial-gradient(120% 140% at 85% 0%, var(--gs-blue) 0%, var(--gs-navy) 62%)", color: "var(--gs-surface)", textAlign: "center" }}>
      <h1 className="gs-hero-title" style={{ fontWeight: 800, margin: "0 0 12px" }}>
        {employer ? "건설 현장 인재를" : "건설 현장 일자리를"}
        <br />
        한곳에서 확인하세요
      </h1>
      <p className="gs-hero-sub" style={{ opacity: 0.85, margin: "0 0 clamp(20px, 3vw, 32px)" }}>
        {employer ? "공고 등록 · 인재 조회 · 포지션 제안 관리" : "직종별 공고 확인 · 이력서 등록 · 포지션 제안 관리"}
      </p>
      <div style={{ background: "var(--gs-surface)", borderRadius: "var(--gs-radius-lg)", padding: "6px 6px 6px 16px", display: "flex", gap: "8px", maxWidth: "560px", margin: "0 auto", boxShadow: "var(--gs-shadow-md)" }}>
        <input
          type="search"
          aria-label="직종 또는 지역 검색"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="직종 또는 지역 검색"
          style={{ flex: 1, minWidth: 0, width: "100%", border: "none", outline: "none", fontSize: "15px", color: colors.text, background: "transparent" }}
        />
        <button type="button" style={{ background: colors.brand, color: "var(--gs-surface)", border: "none", borderRadius: "var(--gs-radius-md)", minHeight: "44px", padding: "10px 20px", fontSize: "15px", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
          검색
        </button>
      </div>
    </section>
  );
}

export function ServiceHighlights() {
  return (
    <section style={{ background: "var(--gs-surface)", borderBottom: `1px solid ${colors.line}`, padding: "16px 20px", display: "flex", justifyContent: "center", gap: "32px" }}>
      {SERVICE_HIGHLIGHTS.map((item) => (
        <div key={item.num} style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: 800, color: colors.navy }}>{item.num}</div>
          <div style={{ fontSize: "11px", color: colors.muted, marginTop: "2px" }}>{item.label}</div>
        </div>
      ))}
    </section>
  );
}

export function ActionCards({ cards, onSelect }: { cards: ActionCard[]; onSelect: (href: string) => void }) {
  return (
    <section className="gs-container gs-action-grid" style={{ paddingBlock: "20px" }}>
      {cards.map((item) => (
        <button key={item.href} type="button" onClick={() => onSelect(item.href)} className="gs-hover-lift" style={{ background: "var(--gs-surface)", border: `1px solid ${colors.line}`, borderRadius: "var(--gs-radius-lg)", padding: "18px 16px", textAlign: "center", boxShadow: "var(--gs-shadow-sm)", cursor: "pointer" }}>
          <div style={{ fontSize: "28px", marginBottom: "6px" }}>{item.icon}</div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: colors.ink }}>{item.label}</div>
          <div style={{ fontSize: "11px", color: colors.muted, marginTop: "2px" }}>{item.desc}</div>
        </button>
      ))}
    </section>
  );
}

export function SectionHeading({ title, count, action, onAction, extra }: { title: string; count: number; action: string; onAction: () => void; extra?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: colors.ink }}>
          {title} <span style={{ color: colors.brand }}>{count}</span>
        </span>
        {extra}
      </div>
      <button type="button" onClick={onAction} style={{ background: "transparent", border: "none", fontSize: "12px", color: colors.muted, cursor: "pointer" }}>
        {action}
      </button>
    </div>
  );
}

export const plainButton = { width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer" } as const;
