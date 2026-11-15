import type { CSSProperties } from "react";

/** 디자인 토큰: 화면마다 흩어져 있던 색상·카드 스타일을 한곳에서 관리 */
export const colors = {
  brand: "#FF6B00",
  brandSoft: "#fff8f5",
  brandTint: "#fff3e0",
  brandBorder: "#ffd9bf",
  ink: "#1a1a1a",
  text: "#333",
  sub: "#666",
  muted: "#999",
  line: "#eee",
  lineSoft: "#f5f5f5",
  page: "#f8f9fa",
  success: "#276749",
  successBg: "#f0fff4",
  successBorder: "#9ae6b4",
  danger: "#e53e3e",
  dangerBg: "#fff3f3",
  dangerBorder: "#ffd0d0",
  info: "#0ea5e9",
  infoBg: "#f0f9ff",
  infoBorder: "#bae6fd",
} as const;

export const fontFamily = "'Apple SD Gothic Neo', sans-serif";

export const card: CSSProperties = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

export const listCard: CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  padding: "16px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  border: `1px solid ${colors.line}`,
};

export const pageShell = (paddingBottom = "80px"): CSSProperties => ({
  minHeight: "100vh",
  background: colors.page,
  fontFamily,
  paddingBottom,
});

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: `1px solid ${colors.line}`,
  borderRadius: "10px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

export const compactInputStyle: CSSProperties = {
  width: "100%",
  padding: "10px",
  border: `1px solid ${colors.line}`,
  borderRadius: "10px",
  fontSize: "13px",
  boxSizing: "border-box",
};

export const tag = (tone: "brand" | "neutral" = "neutral"): CSSProperties => ({
  background: tone === "brand" ? colors.brandTint : colors.lineSoft,
  color: tone === "brand" ? colors.brand : colors.sub,
  fontSize: "11px",
  borderRadius: "6px",
  padding: "3px 8px",
});

export const primaryButton = (disabled = false): CSSProperties => ({
  width: "100%",
  padding: "15px",
  background: disabled ? "#ddd" : colors.brand,
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
});
