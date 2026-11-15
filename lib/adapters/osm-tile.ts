import "server-only";

/** OpenStreetMap 타일 어댑터 (서버 전용). OSM 정책상 User-Agent를 반드시 보낸다. */

const OSM_TILE_BASE = "https://tile.openstreetmap.org";
const USER_AGENT = "gongsujob/1.0";

export class OsmTileError extends Error {}

export async function fetchOsmTile(
  tile: { x: number; y: number; zoom: number },
  fetchImpl: typeof fetch = fetch,
): Promise<ArrayBuffer> {
  const res = await fetchImpl(`${OSM_TILE_BASE}/${tile.zoom}/${tile.x}/${tile.y}.png`, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });
  if (!res.ok) throw new OsmTileError(`osm ${res.status}`);
  return res.arrayBuffer();
}
