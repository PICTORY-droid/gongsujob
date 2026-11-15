/** 지도 관련 순수 계산 */

export const MAP_TILE_ZOOM = 16;

export function isValidLatLng(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -85 && lat <= 85 && lng >= -180 && lng <= 180;
}

/** 위경도 → OSM 슬리피맵 타일 좌표 */
export function latLngToTile(lat: number, lng: number, zoom = MAP_TILE_ZOOM): { x: number; y: number; zoom: number } {
  const n = Math.pow(2, zoom);
  const latRad = (lat * Math.PI) / 180;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y, zoom };
}

/** 카카오맵 바로가기 링크 */
export function buildKakaoMapLink(address: string, coords: { lat: string; lng: string } | null): string {
  if (coords) return `https://map.kakao.com/link/map/현장위치,${coords.lat},${coords.lng}`;
  return "https://map.kakao.com/?q=" + encodeURIComponent(address);
}
