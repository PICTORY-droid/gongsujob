import { describe, expect, it } from "vitest";
import { buildContractSections, buildLedger, groupWorkersBySite, safeFileName } from "@/domain/workforce";
import type { ConfirmedWorker } from "@/types/domain";

const worker = (over: Partial<ConfirmedWorker>): ConfirmedWorker => ({
  id: "o1",
  job_id: "j1",
  resume_id: "r1",
  title: "철근 반장",
  job_type: "철근",
  location: "서울",
  start_date: "2026-11-20",
  pay: 200000,
  work_conditions: null,
  workerName: "김철수",
  workerJobType: "철근",
  phone: "010-1234-5678",
  job: { title: "아파트 신축 철근", company: "가나건설", region: "서울", detail_address: "강서구", start_date: "2026-11-20", pay_type: "일당" },
  ...over,
});

describe("현장별 묶기", () => {
  it("같은 공고는 한 묶음, 공고 없는 제안은 제목·장소로 묶고 최근 시작일 순", () => {
    const groups = groupWorkersBySite([
      worker({ id: "a" }),
      worker({ id: "b", workerName: "이영호" }),
      worker({ id: "c", job_id: null, job: null, title: "타일 기공", location: "인천", start_date: "2026-12-01" }),
    ]);
    expect(groups.map((g) => [g.title, g.site, g.workers.length])).toEqual([
      ["타일 기공", "인천", 1],
      ["아파트 신축 철근", "서울 강서구", 2],
    ]);
  });
});

describe("노임대장 계산", () => {
  it("근무일수 × 일당에서 공제액과 실지급액을 계산하고 합계를 낸다 (계산기와 같은 규칙)", () => {
    const ledger = buildLedger([worker({ id: "a" }), worker({ id: "b", pay: 150000 })], { a: 2, b: 1 });
    expect(ledger.rows[0]).toMatchObject({ no: 1, days: 2, total: 400000, employmentInsurance: 3600, incomeTax: 2700, localIncomeTax: 270, totalDeduction: 6570, net: 393430 });
    // 일당 15만원 이하는 소득세 0
    expect(ledger.rows[1]).toMatchObject({ total: 150000, employmentInsurance: 1350, incomeTax: 0, localIncomeTax: 0, net: 148650 });
    expect(ledger.totals).toMatchObject({ days: 3, total: 550000, totalDeduction: 7920, net: 542080 });
  });

  it("근무일수는 1~31일로 보정, 입력이 없으면 1일", () => {
    const ledger = buildLedger([worker({ id: "a" }), worker({ id: "b" })], { a: 99 });
    expect(ledger.rows.map((r) => r.days)).toEqual([31, 1]);
  });
});

describe("근로계약서 항목", () => {
  it("공고·제안 정보는 채우고, 개인 식별 정보는 빈칸으로 둔다", () => {
    const sections = buildContractSections(worker({}));
    const field = (title: string, label: string) => sections.find((s) => s.title === title)?.fields.find((f) => f.label === label)?.value;
    expect(field("사업주(갑)", "업체명")).toBe("가나건설");
    expect(field("근로자(을)", "성명")).toBe("김철수");
    expect(field("근로자(을)", "생년월일")).toBe("");
    expect(field("근로 조건", "근무 장소")).toBe("서울 강서구");
    expect(field("임금", "일급")).toBe("200,000원");
  });
});

describe("파일 이름", () => {
  it("파일 이름에 못 쓰는 문자를 지운다", () => {
    expect(safeFileName('강서/아파트:"1차"')).toBe("강서 아파트 1차");
    expect(safeFileName("  ")).toBe("현장");
  });
});

describe("근로계약서 양식 이름", () => {
  it("건설 직종은 건설일용근로자, 그 외 직종은 일용근로자", async () => {
    const { contractKind } = await import("@/domain/workforce");
    expect(contractKind({ job_type: "철근", workerJobType: null }).subtitle).toBe("건설일용근로자");
    expect(contractKind({ job_type: "홀서빙", workerJobType: null }).subtitle).toBe("일용근로자");
    expect(contractKind({ job_type: "", workerJobType: "지게차" }).subtitle).toBe("일용근로자");
  });
});
