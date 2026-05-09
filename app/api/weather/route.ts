import { NextRequest, NextResponse } from "next/server";

const REGION_GRID: Record<string, { nx: number; ny: number }> = {
  "서울": { nx: 60, ny: 127 },
  "부산": { nx: 98, ny: 76 },
  "대구": { nx: 89, ny: 90 },
  "인천": { nx: 55, ny: 124 },
  "광주": { nx: 58, ny: 74 },
  "대전": { nx: 67, ny: 100 },
  "울산": { nx: 102, ny: 84 },
  "세종": { nx: 66, ny: 103 },
  "수원": { nx: 60, ny: 121 },
  "성남": { nx: 62, ny: 123 },
  "고양": { nx: 57, ny: 128 },
  "용인": { nx: 62, ny: 120 },
  "춘천": { nx: 73, ny: 134 },
  "원주": { nx: 76, ny: 122 },
  "강릉": { nx: 92, ny: 131 },
  "청주": { nx: 69, ny: 107 },
  "충주": { nx: 76, ny: 114 },
  "천안": { nx: 63, ny: 110 },
  "아산": { nx: 60, ny: 110 },
  "전주": { nx: 63, ny: 89 },
  "익산": { nx: 60, ny: 91 },
  "목포": { nx: 50, ny: 67 },
  "여수": { nx: 73, ny: 66 },
  "순천": { nx: 70, ny: 70 },
  "포항": { nx: 102, ny: 94 },
  "구미": { nx: 84, ny: 96 },
  "경주": { nx: 100, ny: 91 },
  "창원": { nx: 89, ny: 77 },
  "진주": { nx: 81, ny: 75 },
  "김해": { nx: 95, ny: 77 },
  "제주": { nx: 52, ny: 38 },
  "서귀포": { nx: 52, ny: 33 },
};

function getGridByRegion(region: string): { nx: number; ny: number } {
  for (const key of Object.keys(REGION_GRID)) {
    if (region.includes(key)) return REGION_GRID[key];
  }
  return { nx: 60, ny: 127 };
}

function convertLatLngToGrid(lat: number, lng: number): { nx: number; ny: number } {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43;
  const YO = 136;

  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);

  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;

  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);

  let theta = lng * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx, ny };
}

async function getGridFromAddress(req: NextRequest, address: string): Promise<{ nx: number; ny: number }> {
  try {
    const geocodeUrl = req.nextUrl.origin + "/api/geocode?address=" + encodeURIComponent(address);
    const res = await fetch(geocodeUrl, { cache: "no-store" });
    const data = await res.json();

    const lat = Number(data.lat);
    const lng = Number(data.lng);

    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return convertLatLngToGrid(lat, lng);
    }
  } catch {}

  return getGridByRegion(address);
}

function getBaseTime(): { base_date: string; base_time: string } {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const hour = kst.getUTCHours();
  const minutes = kst.getUTCMinutes();
  const times = [2, 5, 8, 11, 14, 17, 20, 23];

  let base_hour = 23;
  const totalMin = hour * 60 + minutes;

  for (const t of times) {
    if (totalMin >= t * 60 + 10) base_hour = t;
  }

  let base_date = kst.toISOString().slice(0, 10).replace(/-/g, "");

  if (base_hour === 23 && hour < 2) {
    const yesterday = new Date(kst.getTime() - 24 * 60 * 60 * 1000);
    base_date = yesterday.toISOString().slice(0, 10).replace(/-/g, "");
  }

  return { base_date, base_time: String(base_hour).padStart(2, "0") + "00" };
}

function formatTemperature(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  const text = String(value).replace(/°C/g, "").replace(/C/g, "").trim();
  return text ? text + "°C" : null;
}

function formatPercent(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  const text = String(value).replace(/%/g, "").trim();
  return text ? text + "%" : null;
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  const region = req.nextUrl.searchParams.get("region");
  const location = address || region || "서울";

  const { nx, ny } = await getGridFromAddress(req, location);
  const { base_date, base_time } = getBaseTime();

  const SERVICE_KEY = process.env.WEATHER_API_KEY;

  if (!SERVICE_KEY) {
    return NextResponse.json({ error: "API 키 없음" }, { status: 500 });
  }

  const url =
    "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst" +
    "?serviceKey=" + SERVICE_KEY +
    "&numOfRows=100&pageNo=1&dataType=JSON" +
    "&base_date=" + base_date +
    "&base_time=" + base_time +
    "&nx=" + nx +
    "&ny=" + ny;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    const items: any[] = data?.response?.body?.items?.item || [];

    if (items.length === 0) {
      return NextResponse.json({ error: "날씨 데이터 없음", location, nx, ny }, { status: 500 });
    }

    const today = base_date;
    const sky = items.find((i) => i.category === "SKY" && i.fcstDate === today);
    const pty = items.find((i) => i.category === "PTY" && i.fcstDate === today);
    const tmp = items.find((i) => i.category === "TMP" && i.fcstDate === today);
    const tmn = items.find((i) => i.category === "TMN" && i.fcstDate === today);
    const tmx = items.find((i) => i.category === "TMX" && i.fcstDate === today);
    const pop = items.find((i) => i.category === "POP" && i.fcstDate === today);

    const skyCode = sky?.fcstValue;
    const ptyCode = pty?.fcstValue;

    let weather = "맑음";
    let icon = "☀️";
    let workable = true;

    if (ptyCode === "1" || ptyCode === "4") {
      weather = "비";
      icon = "🌧️";
      workable = false;
    } else if (ptyCode === "2") {
      weather = "비/눈";
      icon = "🌨️";
      workable = false;
    } else if (ptyCode === "3") {
      weather = "눈";
      icon = "❄️";
      workable = false;
    } else if (skyCode === "1") {
      weather = "맑음";
      icon = "☀️";
    } else if (skyCode === "3") {
      weather = "구름많음";
      icon = "⛅";
    } else if (skyCode === "4") {
      weather = "흐림";
      icon = "☁️";
    }

    return NextResponse.json({
      location,
      nx,
      ny,
      weather,
      icon,
      workable,
      temperature: formatTemperature(tmp?.fcstValue),
      tempMin: formatTemperature(tmn?.fcstValue),
      tempMax: formatTemperature(tmx?.fcstValue),
      rainProb: formatPercent(pop?.fcstValue),
    });
  } catch {
    return NextResponse.json({ error: "날씨 조회 실패", location, nx, ny }, { status: 500 });
  }
}
