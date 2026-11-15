import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * API Route 통합 테스트: 실제 라우트 핸들러를 호출하고, 외부 네트워크(fetch)만 가짜로 바꾼다.
 */

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const req = (path: string) => new NextRequest(new URL(path, "http://localhost:3000"));

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("KAKAO_REST_API_KEY", "kakao-test");
  vi.stubEnv("WEATHER_API_KEY", "kma-test");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("GET /api/geocode", async () => {
  const { GET } = await import("@/app/api/geocode/route");

  it("주소가 없으면 400 'no address'", async () => {
    const res = await GET(req("/api/geocode"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "no address" });
  });

  it("주소가 지나치게 길면 400", async () => {
    const res = await GET(req("/api/geocode?address=" + "가".repeat(201)));
    expect(res.status).toBe(400);
  });

  it("좌표를 찾으면 200", async () => {
    fetchMock.mockResolvedValueOnce(json({ documents: [{ x: "127", y: "37", address_name: "서울" }] }));
    const res = await GET(req("/api/geocode?address=" + encodeURIComponent("서울")));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ lat: "37", lng: "127", source: "address" });
  });

  it("못 찾으면 404", async () => {
    fetchMock.mockImplementation(async () => json({ documents: [] }));
    const res = await GET(req("/api/geocode?address=x"));
    expect(res.status).toBe(404);
  });

  it("서버 키가 없으면 내부 사정은 숨기고 500", async () => {
    vi.stubEnv("KAKAO_REST_API_KEY", "");
    const res = await GET(req("/api/geocode?address=x"));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "fail" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/staticmap", async () => {
  const { GET } = await import("@/app/api/staticmap/route");

  it.each(["", "?lat=37", "?lat=abc&lng=127", "?lat=95&lng=127"])("잘못된 좌표 %s → 400", async (query) => {
    const res = await GET(req("/api/staticmap" + query));
    expect(res.status).toBe(400);
  });

  it("정상 좌표면 PNG 이미지", async () => {
    fetchMock.mockResolvedValueOnce(new Response(new Uint8Array([137, 80, 78, 71])));
    const res = await GET(req("/api/staticmap?lat=37.5665&lng=126.978"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://tile.openstreetmap.org/16/55883/25378.png");
  });
});

describe("GET /api/weather", async () => {
  const { GET } = await import("@/app/api/weather/route");

  it("자기 자신(/api/geocode)을 다시 부르지 않고 카카오·기상청만 호출", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ documents: [{ x: "126.978", y: "37.5665", address_name: "서울" }] }))
      .mockImplementationOnce(async (url) => {
        const date = new URL(String(url)).searchParams.get("base_date");
        return json({ response: { body: { items: { item: [{ category: "PTY", fcstDate: date, fcstValue: "1" }] } } } });
      });

    const res = await GET(req("/api/weather?address=" + encodeURIComponent("서울 중구")));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ location: "서울 중구", nx: 60, ny: 127, weather: "비", workable: false });
    const urls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes("/api/geocode"))).toBe(false);
    expect(urls[1]).toContain("apis.data.go.kr");
  });

  it("지오코딩 실패 시 지역명 격자로 대체", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(json({ response: { body: { items: { item: [] } } } }));
    const res = await GET(req("/api/weather?address=" + encodeURIComponent("부산 해운대")));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: "날씨 데이터 없음", nx: 98, ny: 76 });
  });

  it("기상청 키가 없으면 500", async () => {
    vi.stubEnv("WEATHER_API_KEY", "");
    const res = await GET(req("/api/weather?address=x"));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "API 키 없음" });
  });
});
