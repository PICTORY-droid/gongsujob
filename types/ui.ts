/** 화면 공통 UI 타입 */

/** 폼 하단 안내 메시지. tone으로 성공/오류 색상을 명시한다(문구 추측 대신). */
export type FormMessage = { text: string; tone: "success" | "error" } | null;

export const successMessage = (text: string): FormMessage => ({ text, tone: "success" });
export const errorMessage = (text: string): FormMessage => ({ text, tone: "error" });
