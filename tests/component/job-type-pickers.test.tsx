// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { CategoryDropdown } from "@/components/ui/CategoryDropdown";
import { JobTypePicker } from "@/components/ui/JobTypePicker";

describe("CategoryDropdown (분야별 묶음)", () => {
  it("분야 전체 또는 세부 직종을 고를 수 있고, 버튼에 선택 이름이 보인다", () => {
    const onChange = vi.fn();
    const { rerender } = render(<CategoryDropdown value="전체" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /직종 선택/ }));

    const listbox = screen.getByRole("listbox", { name: "직종" });
    expect(within(listbox).getAllByRole("group")).toHaveLength(6);
    fireEvent.click(within(listbox).getByRole("option", { name: /식당 파출 전체/ }));
    expect(onChange).toHaveBeenLastCalledWith("group:restaurant");

    rerender(<CategoryDropdown value="group:restaurant" onChange={onChange} />);
    expect(screen.getByRole("button", { name: /식당 파출 전체/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /식당 파출 전체/ }));
    fireEvent.click(screen.getByRole("option", { name: "지게차" }));
    expect(onChange).toHaveBeenLastCalledWith("지게차");
  });
});

describe("JobTypePicker (분야 → 직종)", () => {
  it("이미 고른 직종의 분야가 처음부터 열려 있다", () => {
    render(<JobTypePicker value="홀서빙" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /식당 파출/ }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("radio", { name: "홀서빙" }).getAttribute("aria-checked")).toBe("true");
  });

  it("분야를 바꾸면 그 분야의 직종이 나오고, 고르면 값을 넘긴다", () => {
    const onChange = vi.fn();
    render(<JobTypePicker value="" onChange={onChange} />);
    expect(screen.getByRole("radiogroup", { name: "현장 인력 직종" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /공장·농장/ }));
    fireEvent.click(screen.getByRole("radio", { name: "농작업" }));
    expect(onChange).toHaveBeenCalledWith("농작업");
  });
});
