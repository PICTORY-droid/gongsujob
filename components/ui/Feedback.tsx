import type { CSSProperties, ReactNode } from "react";
import { colors } from "@/components/ui/theme";
import { isErrorMessage } from "@/domain/validation";

/** 상단 중앙 토스트 */
export function Toast({ message, zIndex = 500 }: { message: string; zIndex?: number }) {
  if (!message) return null;
  return (
    <div
      role="status"
      style={{ position: "fixed", top: "72px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.78)", color: "#fff", fontSize: "13px", padding: "10px 18px", borderRadius: "999px", zIndex, whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}
    >
      {message}
    </div>
  );
}

type NoticeTone = "success" | "error";

/** 성공/오류 안내 박스. tone을 생략하면 문구로 자동 판단한다. */
export function Notice({
  message,
  tone,
  style,
}: {
  message: string;
  tone?: NoticeTone;
  style?: CSSProperties;
}) {
  if (!message) return null;
  const resolved: NoticeTone = tone ?? (isErrorMessage(message) ? "error" : "success");
  const palette =
    resolved === "error"
      ? { bg: colors.dangerBg, border: colors.dangerBorder, color: colors.danger }
      : { bg: colors.successBg, border: colors.successBorder, color: colors.success };

  return (
    <div
      role={resolved === "error" ? "alert" : "status"}
      style={{ background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: "12px", padding: "12px 14px", fontSize: "13px", color: palette.color, lineHeight: 1.5, marginBottom: "12px", ...style }}
    >
      {message}
    </div>
  );
}

export function LoadingScreen({ text = "불러오는 중..." }: { text?: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.page }}>
      <div style={{ fontSize: "14px", color: colors.muted }}>{text}</div>
    </div>
  );
}

export function InlineLoading({ padding = "40px" }: { padding?: string }) {
  return <div style={{ textAlign: "center", padding, color: colors.muted, fontSize: "14px" }}>불러오는 중...</div>;
}

export function EmptyState({
  icon,
  text,
  action,
  boxed = false,
  padding = "60px 20px",
  iconSize = "40px",
  textSize = "15px",
}: {
  icon: string;
  text: string;
  action?: ReactNode;
  boxed?: boolean;
  padding?: string;
  iconSize?: string;
  textSize?: string;
}) {
  return (
    <div
      style={{ textAlign: "center", padding, ...(boxed ? { background: "#fff", borderRadius: "12px", border: `1px solid ${colors.line}` } : {}) }}
    >
      <div style={{ fontSize: iconSize, marginBottom: "12px" }}>{icon}</div>
      <div style={{ fontSize: textSize, color: colors.muted }}>{text}</div>
      {action}
    </div>
  );
}
