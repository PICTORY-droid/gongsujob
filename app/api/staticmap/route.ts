import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lng = req.nextUrl.searchParams.get("lng");
  const lat = req.nextUrl.searchParams.get("lat");
  if (!lng || !lat) return NextResponse.json({ error: "no coords" }, { status: 400 });

  const marker = `pos:${lng}%20${lat}`;
  const url = `https://dapi.kakao.com/v2/maps/staticmap?appkey=df58203831b3eac3cf6f8b301680d626&center=${lng},${lat}&level=4&w=560&h=220&marker=${marker}`;

  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "fail" }, { status: 500 });
  }
}