// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import JobCard from "@/components/job/JobCard";
import { FilterChip, SaveToggle } from "@/components/ui/FilterChip";
import ResumeCard from "@/components/resume/ResumeCard";
import { useSavedJobs } from "@/hooks/useSavedJobs";

const job = {
  id: "job-1",
  title: "철근 반장 구함",
  company: "가나건설",
  region: "서울",
  pay: 250000,
  pay_type: "일당",
  job_type: "철근",
  start_date: "2026-11-17",
  headcount: 3,
  detail_address: null,
  is_urgent: true,
};

describe("JobCard", () => {
  it("급구·내일 출근 배지와 일당을 보여준다", () => {
    render(<JobCard job={job} now={new Date(2026, 10, 16)} />);
    expect(screen.getByText("급구")).toBeTruthy();
    expect(screen.getByText("내일 출근")).toBeTruthy();
    expect(screen.getByText("250,000원")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/jobs/job-1");
  });

  it("찜 콜백이 없으면 하트를 그리지 않는다", () => {
    render(<JobCard job={job} />);
    expect(screen.queryByRole("button", { name: /찜/ })).toBeNull();
  });

  it("하트를 눌러도 상세 페이지로 이동하지 않는다", () => {
    const onToggle = vi.fn();
    render(<JobCard job={job} saved={false} onToggleSave={onToggle} />);
    const heart = screen.getByRole("button", { name: "찜하기" });
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    heart.dispatchEvent(click);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(click.defaultPrevented).toBe(true);
  });
});

describe("FilterChip / SaveToggle", () => {
  it("선택 상태를 aria-pressed로 알린다", () => {
    const onClick = vi.fn();
    render(<FilterChip label="급구만" active onClick={onClick} />);
    const chip = screen.getByRole("button", { name: "급구만" });
    expect(chip.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(chip);
    expect(onClick).toHaveBeenCalled();
  });

  it("찜 상태에 따라 버튼 이름이 바뀐다", () => {
    const { rerender } = render(<SaveToggle saved={false} onToggle={() => {}} />);
    expect(screen.getByRole("button", { name: "찜하기" })).toBeTruthy();
    rerender(<SaveToggle saved onToggle={() => {}} />);
    expect(screen.getByRole("button", { name: "찜 해제" }).getAttribute("aria-pressed")).toBe("true");
  });
});

describe("ResumeCard 안전교육 배지", () => {
  const resume = { id: "r1", name: "김철수", photo_url: null, job_type: "형틀", career_years: 5, address: "경기", skills: null };

  it("이수한 경우에만 배지를 보여준다", () => {
    const { rerender } = render(<ResumeCard resume={{ ...resume, has_safety_cert: true }} onClick={() => {}} />);
    expect(screen.getByText("안전교육 이수")).toBeTruthy();
    rerender(<ResumeCard resume={{ ...resume, has_safety_cert: false }} onClick={() => {}} />);
    expect(screen.queryByText("안전교육 이수")).toBeNull();
  });
});

describe("useSavedJobs", () => {
  beforeEach(() => window.localStorage.clear());

  it("토글하면 저장소에 기록되고 다른 훅 인스턴스에도 반영된다", () => {
    const a = renderHook(() => useSavedJobs());
    const b = renderHook(() => useSavedJobs());

    act(() => a.result.current.toggle("job-1"));
    expect(a.result.current.isSaved("job-1")).toBe(true);
    expect(b.result.current.savedIds).toEqual(["job-1"]);
    expect(JSON.parse(window.localStorage.getItem("gongsujob:saved-jobs") ?? "[]")).toEqual(["job-1"]);

    act(() => b.result.current.toggle("job-1"));
    expect(a.result.current.savedIds).toEqual([]);
  });

  it("저장소 값이 깨져 있어도 빈 목록으로 시작한다", () => {
    window.localStorage.setItem("gongsujob:saved-jobs", "{broken");
    const { result } = renderHook(() => useSavedJobs());
    expect(result.current.savedIds).toEqual([]);
  });
});
