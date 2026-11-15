import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/config/env";
import { geocodeAddress } from "@/lib/adapters/kakao-local";
import { fetchVillageForecast } from "@/lib/adapters/kma-forecast";
import { apiError, logServerError, parseSearchParams } from "@/lib/http/api";
import { weatherQuerySchema } from "@/lib/http/schemas";
import { convertLatLngToGrid, getBaseTime, getGridByRegion, interpretForecast, type Grid } from "@/domain/weather";
import type { WeatherSummary } from "@/types/domain";

/**
 * 주소 → 기상청 격자 변환.
 * 기존에는 자기 자신의 /api/geocode 를 HTTP로 다시 호출했으나, 어댑터를 직접 호출해 왕복을 없앴다.
 * 좌표를 못 찾으면 지역명 기반 기본 격자로 대체한다.
 */
async function resolveGrid(location: string, kakaoKey: string | null): Promise<Grid> {
  if (kakaoKey) {
    try {
      const point = await geocodeAddress(location, kakaoKey);
      const lat = Number(point?.lat);
      const lng = Number(point?.lng);
      if (point && !Number.isNaN(lat) && !Number.isNaN(lng)) return convertLatLngToGrid(lat, lng);
    } catch (error) {
      logServerError("weather:geocode", error);
    }
  }
  return getGridByRegion(location);
}

/** GET /api/weather?address= — 현장 위치의 오늘 날씨와 작업 가능 여부 */
export async function GET(req: NextRequest) {
  const query = parseSearchParams(req.nextUrl.searchParams, weatherQuerySchema);
  if (!query.ok) return query.response;

  const { location } = query.data;
  const { WEATHER_API_KEY, KAKAO_REST_API_KEY } = getServerEnv();

  if (!WEATHER_API_KEY) return apiError("API 키 없음", 500);

  const { nx, ny } = await resolveGrid(location, KAKAO_REST_API_KEY);
  const base = getBaseTime();

  try {
    const items = await fetchVillageForecast({ nx, ny, ...base }, WEATHER_API_KEY);
    if (items.length === 0) return apiError("날씨 데이터 없음", 500, { location, nx, ny });

    const summary: WeatherSummary = { location, nx, ny, ...interpretForecast(items, base.base_date) };
    return NextResponse.json(summary);
  } catch (error) {
    logServerError("weather", error);
    return apiError("날씨 조회 실패", 500, { location, nx, ny });
  }
}
