import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/config/env";
import { geocodeAddress } from "@/lib/adapters/kakao-local";
import { apiError, logServerError, parseSearchParams } from "@/lib/http/api";
import { geocodeQuerySchema } from "@/lib/http/schemas";

/** GET /api/geocode?address= — 주소를 좌표로 변환 (카카오 키는 서버에만 존재) */
export async function GET(req: NextRequest) {
  const query = parseSearchParams(req.nextUrl.searchParams, geocodeQuerySchema);
  if (!query.ok) return query.response;

  const { KAKAO_REST_API_KEY } = getServerEnv();
  if (!KAKAO_REST_API_KEY) {
    logServerError("geocode", "KAKAO_REST_API_KEY is not set");
    return apiError("fail", 500);
  }

  try {
    const result = await geocodeAddress(query.data.address, KAKAO_REST_API_KEY);
    if (!result) return apiError("not found", 404);
    return NextResponse.json(result);
  } catch (error) {
    logServerError("geocode", error);
    return apiError("fail", 500);
  }
}
