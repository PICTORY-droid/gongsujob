/**
 * 기상청 단기예보(동네예보) 관련 순수 로직.
 * - 위경도 → 기상청 격자(nx, ny) 변환 (Lambert Conformal Conic)
 * - 발표 기준시각 계산
 * - 예보 항목 → 화면용 요약 해석
 */

export type Grid = { nx: number; ny: number };

export const DEFAULT_GRID: Grid = { nx: 60, ny: 127 }; // 서울

export const REGION_GRID: Record<string, Grid> = {
  서울: { nx: 60, ny: 127 },
  부산: { nx: 98, ny: 76 },
  대구: { nx: 89, ny: 90 },
  인천: { nx: 55, ny: 124 },
  광주: { nx: 58, ny: 74 },
  대전: { nx: 67, ny: 100 },
  울산: { nx: 102, ny: 84 },
  세종: { nx: 66, ny: 103 },
  수원: { nx: 60, ny: 121 },
  성남: { nx: 62, ny: 123 },
  고양: { nx: 57, ny: 128 },
  용인: { nx: 62, ny: 120 },
  춘천: { nx: 73, ny: 134 },
  원주: { nx: 76, ny: 122 },
  강릉: { nx: 92, ny: 131 },
  청주: { nx: 69, ny: 107 },
  충주: { nx: 76, ny: 114 },
  천안: { nx: 63, ny: 110 },
  아산: { nx: 60, ny: 110 },
  전주: { nx: 63, ny: 89 },
  익산: { nx: 60, ny: 91 },
  목포: { nx: 50, ny: 67 },
  여수: { nx: 73, ny: 66 },
  순천: { nx: 70, ny: 70 },
  포항: { nx: 102, ny: 94 },
  구미: { nx: 84, ny: 96 },
  경주: { nx: 100, ny: 91 },
  창원: { nx: 89, ny: 77 },
  진주: { nx: 81, ny: 75 },
  김해: { nx: 95, ny: 77 },
  제주: { nx: 52, ny: 38 },
  서귀포: { nx: 52, ny: 33 },
};

export function getGridByRegion(region: string): Grid {
  for (const key of Object.keys(REGION_GRID)) {
    if (region.includes(key)) return REGION_GRID[key];
  }
  return DEFAULT_GRID;
}

export function convertLatLngToGrid(lat: number, lng: number): Grid {
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
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;

  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);

  let theta = lng * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  return {
    nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
  };
}

const ISSUE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

/** 단기예보는 02·05·08…23시 발표, 발표 10분 후부터 조회 가능. now를 주입받아 테스트 가능하게 했다. */
export function getBaseTime(now: Date = new Date()): { base_date: string; base_time: string } {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const hour = kst.getUTCHours();
  const totalMin = hour * 60 + kst.getUTCMinutes();

  let baseHour = 23;
  for (const t of ISSUE_HOURS) {
    if (totalMin >= t * 60 + 10) baseHour = t;
  }

  let baseDate = toYmd(kst);
  if (baseHour === 23 && hour < 2) {
    baseDate = toYmd(new Date(kst.getTime() - DAY_MS));
  }

  return { base_date: baseDate, base_time: String(baseHour).padStart(2, "0") + "00" };
}

export function formatTemperature(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  const text = String(value).replace(/°C/g, "").replace(/C/g, "").trim();
  return text ? text + "°C" : null;
}

export function formatPercent(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  const text = String(value).replace(/%/g, "").trim();
  return text ? text + "%" : null;
}

export type ForecastItem = {
  category: string;
  fcstDate: string;
  fcstValue: string;
};

export type ForecastInterpretation = {
  weather: string;
  icon: string;
  workable: boolean;
  temperature: string | null;
  tempMin: string | null;
  tempMax: string | null;
  rainProb: string | null;
};

/** PTY(강수형태) 우선, 없으면 SKY(하늘상태)로 판단. 비·눈이면 작업 불가로 본다. */
export function interpretForecast(items: ForecastItem[], date: string): ForecastInterpretation {
  const find = (category: string) => items.find((i) => i.category === category && i.fcstDate === date);

  const skyCode = find("SKY")?.fcstValue;
  const ptyCode = find("PTY")?.fcstValue;

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

  return {
    weather,
    icon,
    workable,
    temperature: formatTemperature(find("TMP")?.fcstValue),
    tempMin: formatTemperature(find("TMN")?.fcstValue),
    tempMax: formatTemperature(find("TMX")?.fcstValue),
    rainProb: formatPercent(find("POP")?.fcstValue),
  };
}
