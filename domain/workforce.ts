import { calculateNetPay, clampDays } from "@/domain/net-pay";
import type { ConfirmedWorker } from "@/types/domain";

/**
 * 현장관리 규칙 (순수 함수)
 * - 확정 근로자를 현장(공고)별로 묶기
 * - 근무일수로 노임대장 행 계산 (공제액은 실수령액 계산기와 같은 규칙)
 * - 근로계약서에 채울 항목 만들기
 */

export type WorkerGroup = { key: string; title: string; site: string; startDate: string; workers: ConfirmedWorker[] };

/** 공고별로 묶는다. 공고 없이 보낸 제안은 제안 제목·장소 기준으로 묶는다. 최근 시작일 순. */
export function groupWorkersBySite(workers: readonly ConfirmedWorker[]): WorkerGroup[] {
  const groups = new Map<string, WorkerGroup>();
  for (const worker of workers) {
    const key = worker.job_id ?? `offer:${worker.title}|${worker.location}`;
    const existing = groups.get(key);
    if (existing) {
      existing.workers.push(worker);
      continue;
    }
    groups.set(key, {
      key,
      title: worker.job?.title ?? worker.title,
      site: siteAddress(worker),
      startDate: worker.job?.start_date ?? worker.start_date,
      workers: [worker],
    });
  }
  return [...groups.values()].sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function siteAddress(worker: Pick<ConfirmedWorker, "job" | "location">): string {
  const parts = [worker.job?.region, worker.job?.detail_address].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : worker.location;
}

export type LedgerRow = {
  no: number;
  name: string;
  jobType: string;
  phone: string;
  dailyPay: number;
  days: number;
  total: number;
  employmentInsurance: number;
  incomeTax: number;
  localIncomeTax: number;
  totalDeduction: number;
  net: number;
};

export type Ledger = { rows: LedgerRow[]; totals: Omit<LedgerRow, "no" | "name" | "jobType" | "phone" | "dailyPay"> };

/**
 * 노임대장 계산. 근무일수는 1~31일로 보정한다.
 * 국민연금·건강보험은 월 8일 이상 등 개인별 요건이 있어 대장에서는 제외하고 별도 확인하도록 안내한다.
 */
export function buildLedger(workers: readonly ConfirmedWorker[], daysByWorker: Readonly<Record<string, number>>): Ledger {
  const rows = workers.map((worker, index): LedgerRow => {
    const days = clampDays(daysByWorker[worker.id] ?? 1);
    const pay = calculateNetPay(worker.pay, days, false);
    return {
      no: index + 1,
      name: worker.workerName,
      jobType: worker.job_type || worker.workerJobType || "",
      phone: worker.phone ?? "",
      dailyPay: worker.pay,
      days,
      total: pay?.total ?? 0,
      employmentInsurance: pay?.employment ?? 0,
      incomeTax: pay?.incomeTax ?? 0,
      localIncomeTax: pay?.localIncomeTax ?? 0,
      totalDeduction: pay?.totalDeduction ?? 0,
      net: pay?.net ?? 0,
    };
  });

  const sum = (pick: (row: LedgerRow) => number) => rows.reduce((acc, row) => acc + pick(row), 0);
  return {
    rows,
    totals: {
      days: sum((r) => r.days),
      total: sum((r) => r.total),
      employmentInsurance: sum((r) => r.employmentInsurance),
      incomeTax: sum((r) => r.incomeTax),
      localIncomeTax: sum((r) => r.localIncomeTax),
      totalDeduction: sum((r) => r.totalDeduction),
      net: sum((r) => r.net),
    },
  };
}

/** 파일 이름에 쓸 수 없는 문자를 정리한다 */
export function safeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim();
  return (cleaned || "현장").slice(0, 60);
}

export type ContractField = { label: string; value: string };
export type ContractSection = { title: string; fields: ContractField[] };

/**
 * 근로계약서 항목. 고용노동부 건설일용근로자 표준근로계약서의 기재 항목 구성을 따르고,
 * 공고·제안에 있는 값만 채운다. 나머지(주민번호·대표자 등)는 빈칸으로 두어 현장에서 직접 적는다.
 */
export function buildContractSections(worker: ConfirmedWorker): ContractSection[] {
  const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;
  return [
    {
      title: "사업주(갑)",
      fields: [
        { label: "업체명", value: worker.job?.company ?? "" },
        { label: "대표자", value: "" },
        { label: "사업자등록번호", value: "" },
        { label: "연락처", value: "" },
      ],
    },
    {
      title: "근로자(을)",
      fields: [
        { label: "성명", value: worker.workerName },
        { label: "생년월일", value: "" },
        { label: "연락처", value: worker.phone ?? "" },
        { label: "주소", value: "" },
      ],
    },
    {
      title: "근로 조건",
      fields: [
        { label: "근로계약기간", value: `${worker.job?.start_date ?? worker.start_date} 부터  ________ 까지` },
        { label: "근무 장소", value: siteAddress(worker) },
        { label: "업무 내용(직종)", value: worker.job_type || worker.workerJobType || "" },
        { label: "소정근로시간", value: "____시 ____분 ~ ____시 ____분" },
        { label: "휴게시간", value: "____시 ____분 ~ ____시 ____분" },
        { label: "근무일·휴일", value: "" },
      ],
    },
    {
      title: "임금",
      fields: [
        { label: "일급", value: won(worker.pay) },
        { label: "임금 지급일", value: "" },
        { label: "지급 방법", value: "□ 근로자 명의 계좌 입금   □ 직접 지급" },
        { label: "기타 근로조건", value: worker.work_conditions ?? "" },
      ],
    },
    {
      title: "사회보험 적용",
      fields: [{ label: "적용 여부", value: "□ 고용보험   □ 산재보험   □ 국민연금   □ 건강보험" }],
    },
  ];
}
