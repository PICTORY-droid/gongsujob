import { NextResponse } from "next/server";
import type { z } from "zod";

/**
 * API Route 공통 유틸.
 * - 쿼리 파라미터 검증(zod)
 * - 일관된 오류 응답 형식 { error: string }
 * - 내부 오류 메시지·스택은 응답에 노출하지 않고 서버 로그에만 남긴다.
 */

export type ApiError = { error: string };

export function apiError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json<ApiError & Record<string, unknown>>({ error: message, ...extra }, { status });
}

export function parseSearchParams<S extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: S,
): { ok: true; data: z.infer<S> } | { ok: false; response: NextResponse } {
  const raw = Object.fromEntries(searchParams.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, response: apiError(parsed.error.issues[0]?.message ?? "invalid request", 400) };
  }
  return { ok: true, data: parsed.data };
}

export function logServerError(scope: string, error: unknown) {
  console.error(`[api:${scope}]`, error instanceof Error ? error.message : error);
}
