import type { CSSProperties } from "react";

/**
 * 디자인 토큰: 실제 값은 app/globals.css 의 CSS 변수(--gs-*)에 있고,
 * 여기서는 변수 이름만 참조한다. 색을 바꿀 때는 globals.css 한 곳만 수정하면 된다.
 */
export const colors = {
  navy: "var(--gs-navy)",
  blue: "var(--gs-blue)",
  blueSoft: "var(--gs-blue-soft)",
  blueBorder: "var(--gs-blue-border)",
  brand: "var(--gs-brand)",
  brandBright: "var(--gs-brand-bright)",
  brandText: "var(--gs-brand-text)",
  brandSoft: "var(--gs-brand-soft)",
  brandTint: "var(--gs-brand-tint)",
  brandBorder: "var(--gs-brand-border)",
  ink: "var(--gs-ink)",
  text: "var(--gs-text)",
  sub: "var(--gs-sub)",
  muted: "var(--gs-muted)",
  disabled: "var(--gs-disabled)",
  line: "var(--gs-line)",
  lineSoft: "var(--gs-line-soft)",
  page: "var(--gs-page)",
  surface: "var(--gs-surface)",
  success: "var(--gs-success)",
  successBg: "var(--gs-success-bg)",
  successBorder: "var(--gs-success-border)",
  danger: "var(--gs-danger)",
  dangerBg: "var(--gs-danger-bg)",
  dangerBorder: "var(--gs-danger-border)",
  info: "var(--gs-blue)",
  infoBg: "var(--gs-blue-soft)",
  infoBorder: "var(--gs-blue-border)",
} as const;

export const fontFamily = "var(--gs-font)";

export const card: CSSProperties = {
  background: colors.surface,
  borderRadius: "var(--gs-radius-lg)",
  boxShadow: "var(--gs-shadow-sm)",
};

export const listCard: CSSProperties = {
  background: colors.surface,
  borderRadius: "var(--gs-radius-lg)",
  padding: "16px",
  boxShadow: "var(--gs-shadow-sm)",
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
  minHeight: "46px",
  padding: "11px 14px",
  border: `1px solid ${colors.line}`,
  borderRadius: "var(--gs-radius-md)",
  background: colors.surface,
  color: colors.ink,
  fontSize: "15px",
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
  color: tone === "brand" ? colors.brandText : colors.sub,
  fontSize: "12px",
  fontWeight: 600,
  borderRadius: "6px",
  padding: "4px 8px",
});

export const primaryButton = (disabled = false): CSSProperties => ({
  width: "100%",
  minHeight: "52px",
  padding: "15px",
  background: disabled ? colors.disabled : colors.brand,
  color: "#fff",
  border: "none",
  borderRadius: "var(--gs-radius-md)",
  fontSize: "16px",
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
});
