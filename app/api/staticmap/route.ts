import { NextResponse, type NextRequest } from "next/server";
import { latLngToTile } from "@/domain/geo";
import { fetchOsmTile } from "@/lib/adapters/osm-tile";
import { apiError, logServerError, parseSearchParams } from "@/lib/http/api";
import { staticMapQuerySchema } from "@/lib/http/schemas";

/** GET /api/staticmap?lat=&lng= — 현장 위치 지도 타일 이미지 프록시 */
export async function GET(req: NextRequest) {
  const query = parseSearchParams(req.nextUrl.searchParams, staticMapQuerySchema);
  if (!query.ok) return query.response;

  try {
    const buffer = await fetchOsmTile(latLngToTile(query.data.lat, query.data.lng));
    return new NextResponse(buffer, {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
    });
  } catch (error) {
    logServerError("staticmap", error);
    return apiError("fail", 500);
  }
}
