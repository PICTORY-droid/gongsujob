import { describe, expect, it, vi } from "vitest";
import { KakaoLocalError, geocodeAddress } from "@/lib/adapters/kakao-local";
import { fetchVillageForecast } from "@/lib/adapters/kma-forecast";
import { fetchOsmTile } from "@/lib/adapters/osm-tile";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("카카오 로컬 어댑터", () => {
  it("주소 검색 결과가 있으면 주소 좌표를 쓴다", async () => {
    const fetchImpl = vi.fn(async () => json({ documents: [{ x: "127.1", y: "37.5", address_name: "서울 강서구", road_address: { address_name: "공항대로 1" } }] }));
    const result = await geocodeAddress("서울 강서구", "KEY", fetchImpl as unknown as typeof fetch);

    expect(result).toEqual({ lng: "127.1", lat: "37.5", address_name: "서울 강서구", road_address_name: "공항대로 1", source: "address" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("KakaoAK KEY");
  });

  it("주소 결과가 없으면 키워드 검색으로 대체", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({ documents: [] }))
      .mockResolvedValueOnce(json({ documents: [{ x: "1", y: "2", place_name: "세종시청" }] }));
    const result = await geocodeAddress("세종시청", "KEY", fetchImpl);

    expect(result).toMatchObject({ source: "keyword", address_name: "세종시청", place_name: "세종시청" });
    expect(String(fetchImpl.mock.calls[1][0])).toContain("/keyword.json?query=");
  });

  it("둘 다 없으면 null", async () => {
    const fetchImpl = vi.fn(async () => json({ documents: [] }));
    expect(await geocodeAddress("없는곳", "KEY", fetchImpl as unknown as typeof fetch)).toBeNull();
  });

  it("카카오가 오류 응답을 주면 예외", async () => {
    const fetchImpl = vi.fn(async () => json({ message: "unauthorized" }, 401));
    await expect(geocodeAddress("x", "BAD", fetchImpl as unknown as typeof fetch)).rejects.toBeInstanceOf(KakaoLocalError);
  });
});

describe("기상청 어댑터", () => {
  it("격자·기준시각을 쿼리에 담고 item 배열을 돌려준다", async () => {
    const items = [{ category: "SKY", fcstDate: "20261115", fcstValue: "1" }];
    const fetchImpl = vi.fn(async () => json({ response: { body: { items: { item: items } } } }));
    const result = await fetchVillageForecast({ nx: 60, ny: 127, base_date: "20261115", base_time: "0500" }, "SVC", fetchImpl as unknown as typeof fetch);

    expect(result).toEqual(items);
    const url = String((fetchImpl.mock.calls[0] as unknown[])[0]);
    expect(url).toContain("nx=60");
    expect(url).toContain("base_time=0500");
    expect(url).toContain("serviceKey=SVC");
  });

  it("빈 응답이면 빈 배열", async () => {
    const fetchImpl = vi.fn(async () => json({}));
    expect(await fetchVillageForecast({ nx: 1, ny: 1, base_date: "d", base_time: "t" }, "S", fetchImpl as unknown as typeof fetch)).toEqual([]);
  });
});

describe("OSM 타일 어댑터", () => {
  it("User-Agent를 포함해 타일을 요청한다", async () => {
    const fetchImpl = vi.fn(async () => new Response(new Uint8Array([1, 2, 3])));
    const buffer = await fetchOsmTile({ x: 1, y: 2, zoom: 16 }, fetchImpl as unknown as typeof fetch);

    expect(buffer.byteLength).toBe(3);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://tile.openstreetmap.org/16/1/2.png");
    expect((init.headers as Record<string, string>)["User-Agent"]).toBe("gongsujob/1.0");
  });
});
