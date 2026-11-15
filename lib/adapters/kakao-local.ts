import "server-only";

/**
 * 카카오 로컬 API 어댑터 (서버 전용).
 * 주소 검색 → 실패 시 키워드 검색 순으로 좌표를 찾는다.
 * fetchImpl 주입으로 네트워크 없이 테스트할 수 있다.
 */

const KAKAO_LOCAL_BASE = "https://dapi.kakao.com/v2/local/search";

export type GeocodeResult = {
  lng: string;
  lat: string;
  address_name: string;
  road_address_name: string | null;
  place_name?: string | null;
  source: "address" | "keyword";
};

type KakaoAddressDoc = {
  x: string;
  y: string;
  address_name: string;
  road_address?: { address_name: string } | null;
};

type KakaoKeywordDoc = {
  x: string;
  y: string;
  address_name?: string;
  road_address_name?: string;
  place_name?: string;
};

export class KakaoLocalError extends Error {}

export async function geocodeAddress(
  address: string,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GeocodeResult | null> {
  const request = async <T>(endpoint: "address" | "keyword"): Promise<T[]> => {
    const res = await fetchImpl(`${KAKAO_LOCAL_BASE}/${endpoint}.json?query=${encodeURIComponent(address)}`, {
      headers: { Authorization: "KakaoAK " + apiKey },
      cache: "no-store",
    });
    if (!res.ok) throw new KakaoLocalError(`kakao ${endpoint} ${res.status}`);
    const body = (await res.json()) as { documents?: T[] };
    return body.documents ?? [];
  };

  const [addressDoc] = await request<KakaoAddressDoc>("address");
  if (addressDoc) {
    return {
      lng: addressDoc.x,
      lat: addressDoc.y,
      address_name: addressDoc.address_name,
      road_address_name: addressDoc.road_address?.address_name || null,
      source: "address",
    };
  }

  const [keywordDoc] = await request<KakaoKeywordDoc>("keyword");
  if (keywordDoc) {
    return {
      lng: keywordDoc.x,
      lat: keywordDoc.y,
      address_name: keywordDoc.address_name || keywordDoc.road_address_name || keywordDoc.place_name || "",
      road_address_name: keywordDoc.road_address_name || null,
      place_name: keywordDoc.place_name || null,
      source: "keyword",
    };
  }

  return null;
}
