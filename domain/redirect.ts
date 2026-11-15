/**
 * 로그인 후 이동 경로 검증.
 * ?redirectedFrom= 값을 그대로 쓰면 외부 사이트로 보내는 오픈 리다이렉트 취약점이 생긴다.
 * 같은 사이트의 상대 경로("/"로 시작, "//"·"/\" 금지)만 허용한다.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\r\n\t]/.test(value)) return fallback;
  return value;
}
