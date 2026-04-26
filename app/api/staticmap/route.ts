import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lng = parseFloat(req.nextUrl.searchParams.get("lng") || "");
  const lat = parseFloat(req.nextUrl.searchParams.get("lat") || "");
  if (isNaN(lng) || isNaN(lat)) return NextResponse.json({ error: "no coords" }, { status: 400 });

  const zoom = 16;
  const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
  const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));

  const tileUrl = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
  const res = await fetch(tileUrl, { headers: { "User-Agent": "gongsujob/1.0" } });
  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}