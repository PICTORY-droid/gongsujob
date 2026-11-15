import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseMock } from "../../support/supabase-mock";

let mock = createSupabaseMock();

vi.mock("@/lib/supabase/client", () => ({
  getBrowserSupabase: () => mock.client,
}));

const { listConfirmedWorkers, getConfirmedWorker } = await import("@/services/workforce.service");

const offerRow = {
  id: "o1",
  job_id: "j1",
  resume_id: "r1",
  title: "철근",
  job_type: "철근",
  location: "서울",
  start_date: "2026-11-20",
  pay: 200000,
  work_conditions: null,
  resumes: { name: "김철수", job_type: "철근" },
  jobs: { title: "아파트", company: "가나건설", region: "서울", detail_address: null, start_date: "2026-11-20", pay_type: "일당" },
};

beforeEach(() => {
  mock = createSupabaseMock();
});

describe("workforce.service", () => {
  it("본인이 보낸 '수락' 제안만 조회하고, 연락처는 해당 이력서만 한 번에 가져온다", async () => {
    mock = createSupabaseMock({
      position_offers: [{ data: [offerRow], error: null }],
      resumes: [{ data: [{ id: "r1", phone: "010-1111-2222" }], error: null }],
    });

    const workers = await listConfirmedWorkers("emp-1");

    expect(mock.callsFor("position_offers")).toEqual(
      expect.arrayContaining([
        { table: "position_offers", method: "eq", args: ["employer_user_id", "emp-1"] },
        { table: "position_offers", method: "eq", args: ["status", "accepted"] },
      ]),
    );
    // 목록 조회에는 연락처 컬럼을 요청하지 않는다
    const select = mock.callsFor("position_offers").find((c) => c.method === "select")?.args[0] as string;
    expect(select).not.toMatch(/phone|email|birth/);
    expect(mock.callsFor("resumes")).toContainEqual({ table: "resumes", method: "in", args: ["id", ["r1"]] });

    expect(workers).toEqual([expect.objectContaining({ id: "o1", workerName: "김철수", phone: "010-1111-2222", job: offerRow.jobs })]);
  });

  it("확정 인력이 없으면 연락처 조회를 하지 않는다", async () => {
    mock = createSupabaseMock({ position_offers: [{ data: [], error: null }] });
    expect(await listConfirmedWorkers("emp-1")).toEqual([]);
    expect(mock.callsFor("resumes")).toHaveLength(0);
  });

  it("조회 실패는 null", async () => {
    mock = createSupabaseMock({ position_offers: [{ data: null, error: { message: "x" } }] });
    expect(await listConfirmedWorkers("emp-1")).toBeNull();
  });

  it("계약서용 단건은 본인·수락 조건을 모두 건다", async () => {
    mock = createSupabaseMock({
      position_offers: [{ data: offerRow, error: null }],
      resumes: [{ data: [], error: null }],
    });
    const worker = await getConfirmedWorker("emp-1", "o1");
    const eqs = mock.callsFor("position_offers").filter((c) => c.method === "eq").map((c) => c.args);
    expect(eqs).toEqual([["id", "o1"], ["employer_user_id", "emp-1"], ["status", "accepted"]]);
    expect(worker).toMatchObject({ workerName: "김철수", phone: null });
  });
});
