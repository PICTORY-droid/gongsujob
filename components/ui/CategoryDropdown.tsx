"use client";

import type { CSSProperties } from "react";
import { useDismissible } from "@/hooks/useDismissible";
import { ALL_CATEGORY, JOB_CATEGORIES } from "@/lib/constants";
import { colors } from "@/components/ui/theme";

type Size = "md" | "sm";

const SIZE_STYLES: Record<Size, { button: CSSProperties; arrow: string; top: string }> = {
  md: { button: { gap: "8px", padding: "9px 16px", borderRadius: "10px", fontSize: "14px" }, arrow: "11px", top: "44px" },
  sm: { button: { gap: "6px", padding: "5px 12px", borderRadius: "8px", fontSize: "12px" }, arrow: "10px", top: "34px" },
};

/** 직종 선택 드롭다운 (바깥 클릭 시 닫힘). 홈·공고·인재 화면 공용 */
export function CategoryDropdown({ value, onChange, size = "md" }: { value: string; onChange: (category: string) => void; size?: Size }) {
  const { open, toggle, close } = useDismissible();
  const s = SIZE_STYLES[size];

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          toggle();
        }}
        style={{ display: "flex", alignItems: "center", border: `1.5px solid ${colors.brand}`, background: "#fff", fontWeight: 600, color: colors.brand, cursor: "pointer", ...s.button }}
      >
        {value === ALL_CATEGORY ? "직종 선택" : value}
        <span style={{ fontSize: s.arrow }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{ position: "absolute", top: s.top, left: 0, background: "#fff", border: `1px solid ${colors.line}`, borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 50, minWidth: "160px", overflow: "hidden" }}
        >
          {JOB_CATEGORIES.map((category) => {
            const selected = value === category;
            return (
              <button
                key={category}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(category);
                  close();
                }}
                style={{ display: "block", width: "100%", padding: "11px 18px", border: "none", background: selected ? colors.brandSoft : "#fff", fontSize: "14px", fontWeight: selected ? 700 : 400, color: selected ? colors.brand : colors.text, cursor: "pointer", textAlign: "left" }}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
