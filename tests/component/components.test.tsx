// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import NetPayCalculator from "@/components/job/NetPayCalculator";
import ResumeCard from "@/components/resume/ResumeCard";
import { ChipSelect } from "@/components/ui/Form";
import { Notice } from "@/components/ui/Feedback";
import { isTabActive } from "@/components/layout/MobileBottomNav";

vi.mock("next/navigation", () => ({ usePathname: () => "/jobs/1" }));

describe("NetPayCalculator", () => {
  it("열기 → 일수 증가 → 실수령액 갱신", () => {
    render(<NetPayCalculator dailyPay={200000} />);

    fireEvent.click(screen.getByRole("button", { name: /실수령액 계산기/ }));
    expect(screen.getByText("196,715원")).toBeTruthy(); // 1일: 200,000 - (1,800 + 1,350 + 135)

    fireEvent.click(screen.getByRole("button", { name: "근무일 늘리기" }));
    expect(screen.getByText("393,430원")).toBeTruthy(); // 2일: 400,000 - (3,600 + 2,700 + 270)

    fireEvent.click(screen.getByRole("button", { name: "근무일 줄이기" }));
    fireEvent.click(screen.getByRole("button", { name: "근무일 줄이기" }));
    expect(screen.getByText("1")).toBeTruthy(); // 최소 1일 유지
  });

  it("4대보험 체크 시 국민연금 항목 표시", () => {
    render(<NetPayCalculator dailyPay={200000} />);
    fireEvent.click(screen.getByRole("button", { name: /실수령액 계산기/ }));
    expect(screen.getByText("국민연금·건강보험 적용")).toBeTruthy(); // 체크박스 라벨
    expect(screen.queryByText("국민연금 (4.75%)")).toBeNull();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByText("국민연금 (4.75%)")).toBeTruthy();
  });
});

describe("ResumeCard", () => {
  it("이름이 없으면 대체 문구, 클릭 시 콜백", () => {
    const onClick = vi.fn();
    render(<ResumeCard resume={{ id: "r", name: null, photo_url: null, job_type: null, career_years: 3, address: null, skills: "배근" }} onClick={onClick} />);

    expect(screen.getByText("이름 미입력")).toBeTruthy();
    expect(screen.getByText("직종 미입력")).toBeTruthy();
    expect(screen.getByText(/경력 3년/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("공통 UI", () => {
  it("ChipSelect: 선택 상태를 aria-checked로 노출", () => {
    const onChange = vi.fn();
    render(<ChipSelect ariaLabel="지역" options={["서울", "부산"] as const} value="부산" onChange={onChange} />);

    expect(screen.getByRole("radio", { name: "부산" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("radio", { name: "서울" }));
    expect(onChange).toHaveBeenCalledWith("서울");
  });

  it("Notice: 오류는 alert, 성공은 status 역할", () => {
    const { rerender } = render(<Notice message="저장 실패: x" />);
    expect(screen.getByRole("alert")).toBeTruthy();
    rerender(<Notice message="저장했습니다" tone="success" />);
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("하단 탭 활성 판정: 홈은 정확히 일치, 나머지는 하위 경로 포함", () => {
    expect(isTabActive("/", "/")).toBe(true);
    expect(isTabActive("/jobs", "/")).toBe(false);
    expect(isTabActive("/jobs/123", "/jobs")).toBe(true);
    expect(isTabActive("/jobsearch", "/jobs")).toBe(false);
  });
});
