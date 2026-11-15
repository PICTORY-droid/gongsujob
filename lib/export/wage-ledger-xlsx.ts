import type { SheetData } from "write-excel-file/browser";
import type { Ledger } from "@/domain/workforce";

/**
 * 노임대장 .xlsx 내려받기 (write-excel-file, MIT).
 * 버튼을 누를 때만 라이브러리를 불러와(동적 import) 첫 화면 용량에 영향을 주지 않는다.
 */

const HEADER = ["번호", "성명", "직종", "연락처", "일당", "근무일수", "총지급액", "고용보험", "소득세", "지방소득세", "공제합계", "실지급액", "서명"];
const WIDTHS = [6, 10, 8, 15, 11, 9, 13, 11, 10, 11, 11, 13, 10];
const MONEY = "#,##0";

type LedgerSheetInput = { ledger: Ledger; siteTitle: string; site: string; period: string };

/** 시트 데이터와 옵션 (순수 함수 — 테스트에서 실제 파일로 만들어 검증한다) */
export function buildWageLedgerSheet({ ledger, siteTitle, site, period }: LedgerSheetInput) {
  const head = { fontWeight: "bold" as const, backgroundColor: "#203C7F", textColor: "#FFFFFF", align: "center" as const, borderStyle: "thin" as const };
  const cell = { borderStyle: "thin" as const };
  const money = (value: number) => ({ value, type: Number, format: MONEY, ...cell });

  const span = HEADER.length;
  const titleRow = [{ value: `노임대장 — ${siteTitle}`, fontWeight: "bold" as const, fontSize: 14, columnSpan: span }];
  const infoRow = [{ value: `현장: ${site}   기간: ${period}`, textColor: "#5B6270", columnSpan: span }];
  const noteRow = [{ value: "※ 공제액은 고용보험·근로소득세(일용)·지방소득세 기준 예상치입니다. 국민연금·건강보험 대상자는 별도 확인하세요.", textColor: "#5B6270", columnSpan: span, wrap: true }];

  const rows = ledger.rows.map((row) => [
    { value: row.no, type: Number, align: "center" as const, ...cell },
    { value: row.name, ...cell },
    { value: row.jobType, ...cell },
    { value: row.phone, ...cell },
    money(row.dailyPay),
    { value: row.days, type: Number, align: "center" as const, ...cell },
    money(row.total),
    money(row.employmentInsurance),
    money(row.incomeTax),
    money(row.localIncomeTax),
    money(row.totalDeduction),
    { ...money(row.net), fontWeight: "bold" as const },
    { value: "", ...cell },
  ]);

  const t = ledger.totals;
  const totalStyle = { fontWeight: "bold" as const, backgroundColor: "#EEF3FC", ...cell };
  const totalRow = [
    { value: "합계", align: "center" as const, ...totalStyle },
    { value: `${ledger.rows.length}명`, ...totalStyle },
    { value: "", ...totalStyle },
    { value: "", ...totalStyle },
    { value: "", ...totalStyle },
    { value: t.days, type: Number, align: "center" as const, ...totalStyle },
    { ...money(t.total), ...totalStyle },
    { ...money(t.employmentInsurance), ...totalStyle },
    { ...money(t.incomeTax), ...totalStyle },
    { ...money(t.localIncomeTax), ...totalStyle },
    { ...money(t.totalDeduction), ...totalStyle },
    { ...money(t.net), ...totalStyle },
    { value: "", ...totalStyle },
  ];

  const sheetData = [titleRow, infoRow, noteRow, [], HEADER.map((label) => ({ value: label, ...head })), ...rows, totalRow];
  return {
    // write-excel-file 의 셀 타입은 유니온이 넓어 여기서 한 번만 맞춘다
    data: sheetData as unknown as SheetData,
    options: { sheet: "노임대장", columns: WIDTHS.map((width) => ({ width })), stickyRowsCount: 5, orientation: "landscape" as const },
  };
}

export async function downloadWageLedger(input: LedgerSheetInput & { fileName: string }) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const { data, options } = buildWageLedgerSheet(input);
  await writeExcelFile(data, options).toFile(`${input.fileName}.xlsx`);
}
