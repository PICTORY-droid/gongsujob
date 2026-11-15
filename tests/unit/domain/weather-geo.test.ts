import { describe, expect, it } from "vitest";
import { DEFAULT_GRID, convertLatLngToGrid, formatPercent, formatTemperature, getBaseTime, getGridByRegion, interpretForecast, type ForecastItem } from "@/domain/weather";
import { buildKakaoMapLink, isValidLatLng, latLngToTile } from "@/domain/geo";

describe("기상청 격자 변환", () => {
  it("서울시청 좌표 → (60, 127)", () => {
    expect(convertLatLngToGrid(37.5665, 126.978)).toEqual({ nx: 60, ny: 127 });
  });

  it("부산 좌표 → 부산 격자 근처", () => {
    const grid = convertLatLngToGrid(35.1796, 129.0756);
    expect(grid.nx).toBeGreaterThanOrEqual(97);
    expect(grid.nx).toBeLessThanOrEqual(99);
    expect(grid.ny).toBeGreaterThanOrEqual(74);
    expect(grid.ny).toBeLessThanOrEqual(76);
  });

  it("지역명이 포함되면 해당 격자, 없으면 서울 기본값", () => {
    expect(getGridByRegion("충북 청주시 흥덕구")).toEqual({ nx: 69, ny: 107 });
    expect(getGridByRegion("알 수 없는 곳")).toEqual(DEFAULT_GRID);
  });
});

describe("발표 기준시각 getBaseTime", () => {
  const at = (iso: string) => new Date(iso);

  it("KST 05:10 이후면 0500 발표분", () => {
    expect(getBaseTime(at("2026-11-14T20:15:00Z"))).toEqual({ base_date: "20261115", base_time: "0500" });
  });

  it("KST 05:09 는 아직 0200 발표분", () => {
    expect(getBaseTime(at("2026-11-14T20:09:00Z"))).toEqual({ base_date: "20261115", base_time: "0200" });
  });

  it("KST 01:30 은 전날 2300 발표분", () => {
    expect(getBaseTime(at("2026-11-14T16:30:00Z"))).toEqual({ base_date: "20261114", base_time: "2300" });
  });
});

describe("예보 해석 interpretForecast", () => {
  const day = "20261115";
  const item = (category: string, fcstValue: string, fcstDate = day): ForecastItem => ({ category, fcstValue, fcstDate });

  it("강수형태(PTY) 비 → 작업 불가", () => {
    const r = interpretForecast([item("PTY", "1"), item("SKY", "1")], day);
    expect(r).toMatchObject({ weather: "비", icon: "🌧️", workable: false });
  });

  it("눈·비/눈도 작업 불가", () => {
    expect(interpretForecast([item("PTY", "3")], day).weather).toBe("눈");
    expect(interpretForecast([item("PTY", "2")], day).weather).toBe("비/눈");
  });

  it("강수 없으면 하늘상태(SKY)로 판단, 작업 가능", () => {
    const r = interpretForecast([item("PTY", "0"), item("SKY", "4"), item("TMP", "12"), item("POP", "30")], day);
    expect(r).toMatchObject({ weather: "흐림", workable: true, temperature: "12°C", rainProb: "30%" });
  });

  it("다른 날짜 예보는 무시", () => {
    const r = interpretForecast([item("PTY", "1", "20261116")], day);
    expect(r.workable).toBe(true);
  });

  it("온도·확률 포맷", () => {
    expect(formatTemperature("5.0°C")).toBe("5.0°C");
    expect(formatTemperature("")).toBeNull();
    expect(formatPercent("60%")).toBe("60%");
  });
});

describe("지도 계산", () => {
  it("위경도 범위 검증", () => {
    expect(isValidLatLng(37.5, 127)).toBe(true);
    expect(isValidLatLng(91, 127)).toBe(false);
    expect(isValidLatLng(Number.NaN, 127)).toBe(false);
  });

  it("서울시청 줌16 타일 좌표 (기존 계산식과 동일한 결과)", () => {
    expect(latLngToTile(37.5665, 126.978)).toEqual({ x: 55883, y: 25378, zoom: 16 });
  });

  it("좌표가 있으면 핀 링크, 없으면 검색 링크", () => {
    expect(buildKakaoMapLink("세종", { lat: "36.5", lng: "127.2" })).toContain("/link/map/");
    expect(buildKakaoMapLink("세종 어진동", null)).toBe("https://map.kakao.com/?q=" + encodeURIComponent("세종 어진동"));
  });
});
