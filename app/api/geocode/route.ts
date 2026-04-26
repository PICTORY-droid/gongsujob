import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "no address" }, { status: 400 });
  try {
    const res = await fetch(
      "https://dapi.kakao.com/v2/local/search/address.json?query=" + encodeURIComponent(address),
      { headers: { Authorization: "KakaoAK fc92387847139e9982abf7ba92bed979" } }
    );
    const data = await res.json();
    if (data.documents && data.documents.length > 0) {
      const { x, y } = data.documents[0];
      return NextResponse.json({ lng: x, lat: y });
    }
    return NextResponse.json({ error: "not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "fail" }, { status: 500 });
  }
}