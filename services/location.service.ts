import type { GeoPoint, WeatherSummary } from "@/types/domain";

/** 브라우저 → 우리 서버 API(/api/*) 호출 계층. 외부 API 키는 서버에만 있다. */

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    const data = (await res.json()) as T & { error?: string };
    if (!res.ok || data?.error) return null;
    return data;
  } catch {
    return null;
  }
}

export function fetchWeather(address: string): Promise<WeatherSummary | null> {
  return getJson<WeatherSummary>("/api/weather?address=" + encodeURIComponent(address));
}

export function fetchGeocode(address: string): Promise<GeoPoint | null> {
  return getJson<GeoPoint>("/api/geocode?address=" + encodeURIComponent(address));
}

export function buildStaticMapUrl(point: GeoPoint): string {
  return `/api/staticmap?lng=${point.lng}&lat=${point.lat}`;
}
