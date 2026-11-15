import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseMock } from "../../support/supabase-mock";

/**
 * 서비스 계층 테스트: Supabase 클라이언트를 테스트 더블로 바꿔
 * "어느 테이블에 어떤 조건으로 무엇을 보냈는지"를 검증한다.
 */
let mock = createSupabaseMock();

vi.mock("@/lib/supabase/client", () => ({
  getBrowserSupabase: () => mock.client,
}));

const { listPublicResumes, PUBLIC_RESUME_COLUMNS, uploadResumePhoto, saveResume } = await import("@/services/resume.service");
const { deleteJob, listActiveJobs } = await import("@/services/job.service");
const { createOffer, respondToOffer, sendOfferMessage, listOffersForUser } = await import("@/services/offer.service");

beforeEach(() => {
  mock = createSupabaseMock();
});

describe("resume.service", () => {
  it("공개 이력서 목록은 연락처·생년월일 컬럼을 요청하지 않는다", async () => {
    mock = createSupabaseMock({ resumes: [{ data: [], error: null }] });
    await listPublicResumes("철근");

    const select = mock.callsFor("resumes").find((c) => c.method === "select");
    expect(select?.args[0]).toBe(PUBLIC_RESUME_COLUMNS);
    expect(PUBLIC_RESUME_COLUMNS).not.toMatch(/phone|email|birth/);
    expect(mock.callsFor("resumes")).toContainEqual({ table: "resumes", method: "eq", args: ["job_type", "철근"] });
  });

  it("'전체'면 직종 조건을 걸지 않는다", async () => {
    mock = createSupabaseMock({ resumes: [{ data: [], error: null }] });
    await listPublicResumes("전체");
    expect(mock.callsFor("resumes").some((c) => c.method === "eq" && c.args[0] === "job_type")).toBe(false);
  });

  it("이미지가 아니거나 5MB 초과면 업로드하지 않는다", async () => {
    const pdf = new File(["x"], "a.pdf", { type: "application/pdf" });
    expect((await uploadResumePhoto("u", pdf)).ok).toBe(false);

    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "a.jpg", { type: "image/jpeg" });
    expect((await uploadResumePhoto("u", big)).ok).toBe(false);
    expect(mock.storageBucket.upload).not.toHaveBeenCalled();
  });

  it("정상 이미지는 사용자 폴더에 올리고 공개 URL을 돌려준다", async () => {
    const photo = new File(["x"], "me.PNG", { type: "image/png" });
    const result = await uploadResumePhoto("user-1", photo);
    expect(result.ok).toBe(true);
    const [path] = mock.storageBucket.upload.mock.calls[0] as unknown as [string];
    expect(path).toMatch(/^user-1\/resume_photo_\d+\.png$/);
  });

  it("기존 이력서가 있으면 update, 없으면 insert", async () => {
    mock = createSupabaseMock({ resumes: [{ data: { id: "r1" }, error: null }, { data: null, error: null }] });
    await saveResume({ user_id: "u" } as never);
    expect(mock.callsFor("resumes").some((c) => c.method === "update")).toBe(true);

    mock = createSupabaseMock({ resumes: [{ data: null, error: null }, { data: null, error: null }] });
    await saveResume({ user_id: "u" } as never);
    expect(mock.callsFor("resumes").some((c) => c.method === "insert")).toBe(true);
  });
});

describe("job.service", () => {
  it("공고 삭제 시 본인 소유 조건(user_id)을 함께 건다", async () => {
    await deleteJob("job-1", "owner-1");
    const eqs = mock.callsFor("jobs").filter((c) => c.method === "eq").map((c) => c.args);
    expect(eqs).toEqual([
      ["id", "job-1"],
      ["user_id", "owner-1"],
    ]);
  });

  it("홈 미리보기는 limit을 건다", async () => {
    mock = createSupabaseMock({ active_jobs: [{ data: [], error: null }] });
    await listActiveJobs({ category: "전체", limit: 6 });
    expect(mock.callsFor("active_jobs")).toContainEqual({ table: "active_jobs", method: "limit", args: [6] });
  });

  it("조회 오류면 null (화면은 기존 목록 유지)", async () => {
    mock = createSupabaseMock({ active_jobs: [{ data: null, error: { message: "x" } }] });
    expect(await listActiveJobs({ category: "전체" })).toBeNull();
  });
});

describe("offer.service", () => {
  const offer = { id: "o1", employer_user_id: "emp", seeker_user_id: "seek" };

  it("제안 목록 조회 시 이력서 연락처를 함께 가져오지 않는다", async () => {
    mock = createSupabaseMock({ position_offers: [{ data: [], error: null }] });
    await listOffersForUser("emp", true);
    const select = mock.callsFor("position_offers").find((c) => c.method === "select");
    expect(String(select?.args[0])).not.toMatch(/phone|email/);
  });

  it("제안 생성 → 구직자에게 알림", async () => {
    mock = createSupabaseMock({ position_offers: [{ data: { id: "new" }, error: null }] });
    const result = await createOffer({ seeker_user_id: "seek", title: "철근 현장" } as never);
    expect(result.ok).toBe(true);
    expect(mock.callsFor("notifications")).toContainEqual(
      expect.objectContaining({ method: "insert", args: [expect.objectContaining({ user_id: "seek", type: "position_offer", message: "철근 현장" })] }),
    );
  });

  it("수락 → 상태 변경 + 구인자에게 수락 알림", async () => {
    const result = await respondToOffer(offer, "accepted");
    expect(result.ok).toBe(true);
    expect(mock.callsFor("position_offers")).toContainEqual(expect.objectContaining({ method: "update", args: [expect.objectContaining({ status: "accepted" })] }));
    expect(mock.callsFor("notifications")[0].args[0]).toMatchObject({ user_id: "emp", type: "position_offer_accepted" });
  });

  it("상태 변경 실패 시 알림을 보내지 않는다", async () => {
    mock = createSupabaseMock({ position_offers: [{ data: null, error: { message: "denied" } }] });
    const result = await respondToOffer(offer, "rejected");
    expect(result).toEqual({ ok: false, error: "처리 실패: denied" });
    expect(mock.callsFor("notifications")).toHaveLength(0);
  });

  it("구직자 질문 → 상태 question + 구인자 알림 / 구인자 답변 → answered + 구직자 알림", async () => {
    mock = createSupabaseMock({ position_offer_messages: [{ data: { id: "m1" }, error: null }] });
    await sendOfferMessage(offer, "seek", "식사 제공되나요?", "question");
    expect(mock.callsFor("position_offers")[0].args[0]).toMatchObject({ status: "question" });
    expect(mock.callsFor("notifications")[0].args[0]).toMatchObject({ user_id: "emp", type: "position_offer_question" });

    mock = createSupabaseMock({ position_offer_messages: [{ data: { id: "m2" }, error: null }] });
    await sendOfferMessage(offer, "emp", "네 제공됩니다", "answer");
    expect(mock.callsFor("position_offers")[0].args[0]).toMatchObject({ status: "answered" });
    expect(mock.callsFor("notifications")[0].args[0]).toMatchObject({ user_id: "seek", type: "position_offer_answer" });
  });
});
