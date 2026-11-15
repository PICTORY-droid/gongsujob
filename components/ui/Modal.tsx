"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";

type ModalProps = {
  onClose: () => void;
  children: ReactNode;
  zIndex?: number;
  backdrop?: string;
  panelStyle?: CSSProperties;
  labelledBy?: string;
};

/** 배경 클릭·ESC로 닫히는 공통 모달 */
export function Modal({ onClose, children, zIndex = 300, backdrop = "rgba(0,0,0,0.5)", panelStyle, labelledBy }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: backdrop, zIndex, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(event) => event.stopPropagation()}
        style={{ width: "100%", maxWidth: "520px", maxHeight: "82vh", overflowY: "auto", background: "var(--gs-surface)", borderRadius: "20px", padding: "20px", boxShadow: "0 12px 40px rgba(0,0,0,0.25)", ...panelStyle }}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, onClose, id, closeBg = "var(--gs-line-soft)" }: { title: string; onClose: () => void; id?: string; closeBg?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
      <div id={id} style={{ fontSize: "17px", fontWeight: 800, color: "var(--gs-ink)" }}>
        {title}
      </div>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: closeBg, color: "var(--gs-sub)", fontSize: "18px", cursor: "pointer" }}
      >
        ×
      </button>
    </div>
  );
}
