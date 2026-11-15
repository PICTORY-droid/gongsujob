import { describe, expect, it } from "vitest";
import writeExcelFile from "write-excel-file/node";
import { unzipSync, strFromU8 } from "fflate";
import { buildLedger } from "@/domain/workforce";
import { buildWageLedgerSheet } from "@/lib/export/wage-ledger-xlsx";
import type { ConfirmedWorker } from "@/types/domain";

const worker: ConfirmedWorker = {
  id: "o1", job_id: "j1", resume_id: "r1", title: "철근", job_type: "철근", location: "서울", start_date: "2026-11-20", pay: 200000, work_conditions: null,
  workerName: "김철수", workerJobType: "철근", phone: "010-1234-5678",
  job: { title: "아파트 신축", company: "가나건설", region: "서울", detail_address: "강서구", start_date: "2026-11-20", pay_type: "일당" },
};

describe("노임대장 엑셀", () => {
  it("실제 .xlsx 파일로 만들어지고, 이름·금액·합계가 들어 있다", async () => {
    const ledger = buildLedger([worker], { o1: 2 });
    const { data, options } = buildWageLedgerSheet({ ledger, siteTitle: "아파트 신축", site: "서울 강서구", period: "2026-11-20 ~" });
    const buffer = await writeExcelFile(data, options).toBuffer();

    const files = unzipSync(new Uint8Array(buffer));
    const sheetXml = strFromU8(files["xl/worksheets/sheet1.xml"]);
    const strings = files["xl/sharedStrings.xml"] ? strFromU8(files["xl/sharedStrings.xml"]) : sheetXml;
    const workbook = strFromU8(files["xl/workbook.xml"]);

    expect(workbook).toContain("노임대장");
    expect(strings).toContain("김철수");
    expect(strings).toContain("실지급액");
    expect(sheetXml).toContain("393430"); // 2일 × 200,000 − 공제 6,570
    expect(sheetXml).toContain("400000");
  });
});
