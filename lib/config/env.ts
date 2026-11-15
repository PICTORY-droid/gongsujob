import { z } from "zod";

/**
 * 환경변수 단일 진입점.
 * - 공개 변수(NEXT_PUBLIC_*)는 빌드 시 인라인되므로 process.env.X 형태로 직접 참조해야 한다.
 * - 서버 전용 키는 이 모듈의 getServerEnv()로만 읽는다(클라이언트 번들에 포함되지 않음).
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL 형식이 올바르지 않습니다."),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY가 비어 있습니다."),
});

export type PublicEnv = z.infer<typeof publicSchema>;

let cachedPublicEnv: PublicEnv | null = null;

export function getPublicEnv(): PublicEnv {
  if (cachedPublicEnv) return cachedPublicEnv;

  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    throw new Error("[env] 공개 환경변수 설정 오류: " + parsed.error.issues.map((i) => i.message).join(", "));
  }

  cachedPublicEnv = parsed.data;
  return cachedPublicEnv;
}

/** 서버 전용 키. 없을 수 있으므로 호출부에서 null 처리를 강제한다. */
export function getServerEnv() {
  return {
    KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY || null,
    WEATHER_API_KEY: process.env.WEATHER_API_KEY || null,
  };
}
