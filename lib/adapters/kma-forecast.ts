import "server-only";
import type { ForecastItem, Grid } from "@/domain/weather";

/** 기상청 단기예보 API 어댑터 (서버 전용) */

const KMA_VILLAGE_FORECAST_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

export class KmaForecastError extends Error {}

export async function fetchVillageForecast(
  params: Grid & { base_date: string; base_time: string },
  serviceKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ForecastItem[]> {
  // serviceKey는 공공데이터포털에서 이미 URL 인코딩된 값을 주는 경우가 많아 그대로 붙인다(기존 동작 유지).
  const url =
    `${KMA_VILLAGE_FORECAST_URL}?serviceKey=${serviceKey}` +
    `&numOfRows=100&pageNo=1&dataType=JSON` +
    `&base_date=${params.base_date}&base_time=${params.base_time}` +
    `&nx=${params.nx}&ny=${params.ny}`;

  const res = await fetchImpl(url, { cache: "no-store" });
  if (!res.ok) throw new KmaForecastError(`kma ${res.status}`);

  const data = (await res.json()) as { response?: { body?: { items?: { item?: ForecastItem[] } } } };
  return data?.response?.body?.items?.item ?? [];
}
