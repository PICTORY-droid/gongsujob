import type { ReactNode } from "react";
import { colors } from "@/components/ui/theme";
import { Modal } from "@/components/ui/Modal";

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

export function SectionHeading({ title, count, action, onAction, extra }: { title: string; count: number; action: string; onAction: () => void; extra?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "16px", fontWeight: 800, color: colors.ink }}>
          {title} <span style={{ color: colors.brandText }}>{count}</span>
        </span>
        {extra}
      </div>
      <button type="button" onClick={onAction} style={{ background: "transparent", border: "none", fontSize: "13px", fontWeight: 600, color: colors.blue, cursor: "pointer", minHeight: "36px" }}>
        {action}
      </button>
    </div>
  );
}

export const plainButton = { width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer" } as const;
