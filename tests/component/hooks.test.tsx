// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PositionOffer, PublicResume } from "@/types/domain";

/** 훅 테스트: 서비스 계층을 가짜로 바꿔 화면 로직(경합 처리, 연락처 공개 규칙)을 검증 */

const listActiveJobs = vi.fn();
const listPublicResumes = vi.fn();
const getResumeContact = vi.fn();
const getLatestOfferForResume = vi.fn();
const recordContactView = vi.fn();
const listJobsByOwner = vi.fn(async () => []);

vi.mock("@/services/job.service", () => ({ listActiveJobs: (...a: unknown[]) => listActiveJobs(...a), listJobsByOwner: () => listJobsByOwner() }));
vi.mock("@/services/resume.service", () => ({ listPublicResumes: (...a: unknown[]) => listPublicResumes(...a), getResumeContact: (...a: unknown[]) => getResumeContact(...a) }));
vi.mock("@/services/offer.service", () => ({
  getLatestOfferForResume: (...a: unknown[]) => getLatestOfferForResume(...a),
  recordContactView: (...a: unknown[]) => recordContactView(...a),
  createOffer: vi.fn(),
}));

let sessionState = { user: { id: "emp-1" }, profile: null, isEmployer: true, loading: false };
vi.mock("@/hooks/useSession", () => ({ useSession: () => sessionState }));

const { useJobList } = await import("@/hooks/useListings");
const { useDismissible } = await import("@/hooks/useDismissible");
const { useTalentSearch } = await import("@/features/resumes/useTalentSearch");

beforeEach(() => {
  vi.clearAllMocks();
  listPublicResumes.mockResolvedValue([]);
  sessionState = { user: { id: "emp-1" }, profile: null, isEmployer: true, loading: false };
});

describe("useJobList", () => {
  it("직종을 빠르게 바꾸면 늦게 도착한 이전 응답은 무시한다", async () => {
    let resolveFirst: (v: unknown) => void = () => {};
    listActiveJobs
      .mockImplementationOnce(() => new Promise((resolve) => (resolveFirst = resolve)))
      .mockResolvedValueOnce([{ id: "형틀-공고" }]);

    const { result, rerender } = renderHook(({ category }) => useJobList(category), { initialProps: { category: "철근" } });
    rerender({ category: "형틀" });

    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => resolveFirst([{ id: "철근-공고" }]));

    expect(result.current.jobs).toEqual([{ id: "형틀-공고" }]);
  });

  it("조회 실패(null) 시 기존 목록 유지", async () => {
    listActiveJobs.mockResolvedValueOnce([{ id: "a" }]).mockResolvedValueOnce(null);
    const { result, rerender } = renderHook(({ category }) => useJobList(category), { initialProps: { category: "전체" } });
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));

    rerender({ category: "도장" });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.jobs).toEqual([{ id: "a" }]);
  });
});

describe("useDismissible", () => {
  it("열린 상태에서 문서를 클릭하면 닫힌다", () => {
    const { result } = renderHook(() => useDismissible());
    act(() => result.current.toggle());
    expect(result.current.open).toBe(true);
    act(() => document.dispatchEvent(new MouseEvent("click")));
    expect(result.current.open).toBe(false);
  });
});

describe("useTalentSearch (연락처 공개 규칙)", () => {
  const resume = { id: "r1", user_id: "seek-1", name: "김철수" } as PublicResume;

  it("제안이 수락된 경우에만 연락처를 조회하고 열람 기록을 남긴다", async () => {
    getLatestOfferForResume.mockResolvedValueOnce({ status: "accepted" } as PositionOffer);
    getResumeContact.mockResolvedValueOnce({ phone: "010-1111-2222", email: null });

    const { result } = renderHook(() => useTalentSearch());
    await act(() => result.current.openResume(resume));

    expect(recordContactView).toHaveBeenCalledWith("emp-1", "r1");
    expect(result.current.contactAllowed).toBe(true);
    expect(result.current.contact?.phone).toBe("010-1111-2222");
  });

  it("대기 중인 제안이면 연락처를 요청하지 않는다", async () => {
    getLatestOfferForResume.mockResolvedValueOnce({ status: "pending" } as PositionOffer);

    const { result } = renderHook(() => useTalentSearch());
    await act(() => result.current.openResume(resume));

    expect(getResumeContact).not.toHaveBeenCalled();
    expect(result.current.contactAllowed).toBe(false);
    expect(result.current.contact).toBeNull();
  });

  it("구직자는 인재 상세를 열 수 없다 (안내 토스트)", async () => {
    sessionState = { ...sessionState, isEmployer: false };
    const { result } = renderHook(() => useTalentSearch());
    await act(() => result.current.openResume(resume));

    expect(result.current.selected).toBeNull();
    expect(result.current.toastMessage).toBe("구인전용 메뉴입니다");
    expect(getLatestOfferForResume).not.toHaveBeenCalled();
  });

  it("필수 항목이 비면 제안을 보내지 않는다", async () => {
    getLatestOfferForResume.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useTalentSearch());
    await act(() => result.current.openResume(resume));
    await act(() => result.current.sendOffer());

    expect(result.current.offerMessage).toEqual({ text: "필수 항목을 입력해주세요.", tone: "error" });
  });
});
