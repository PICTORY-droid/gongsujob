import { NextRequest, NextResponse } from "next/server";

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "no address" }, { status: 400 });
  }

  try {
    const addressRes = await fetch(
      "https://dapi.kakao.com/v2/local/search/address.json?query=" + encodeURIComponent(address),
      {
        headers: {
          Authorization: "KakaoAK " + KAKAO_REST_API_KEY,
        },
        cache: "no-store",
      }
    );

    const addressData = await addressRes.json();

    if (addressData.documents && addressData.documents.length > 0) {
      const result = addressData.documents[0];
      return NextResponse.json({
        lng: result.x,
        lat: result.y,
        address_name: result.address_name,
        road_address_name: result.road_address?.address_name || null,
        source: "address",
      });
    }

    const keywordRes = await fetch(
      "https://dapi.kakao.com/v2/local/search/keyword.json?query=" + encodeURIComponent(address),
      {
        headers: {
          Authorization: "KakaoAK " + KAKAO_REST_API_KEY,
        },
        cache: "no-store",
      }
    );

    const keywordData = await keywordRes.json();

    if (keywordData.documents && keywordData.documents.length > 0) {
      const result = keywordData.documents[0];
      return NextResponse.json({
        lng: result.x,
        lat: result.y,
        address_name: result.address_name || result.road_address_name || result.place_name,
        road_address_name: result.road_address_name || null,
        place_name: result.place_name || null,
        source: "keyword",
      });
    }

    return NextResponse.json({ error: "not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "fail" }, { status: 500 });
  }
}
