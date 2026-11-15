"use client";

import type { CSSProperties } from "react";
import { useDismissible } from "@/hooks/useDismissible";
import { JobGroupIcon } from "@/components/job/JobGroupIcon";
import { ALL_CATEGORY } from "@/lib/constants";
import { JOB_GROUPS } from "@/lib/job-taxonomy";
import { categoryLabel, groupCategoryValue } from "@/domain/job-category";
import { colors } from "@/components/ui/theme";

type Size = "md" | "sm";

const SIZE_STYLES: Record<Size, { button: CSSProperties; arrow: string; top: string }> = {
  md: { button: { gap: "8px", minHeight: "40px", padding: "0 16px", borderRadius: "var(--gs-radius-md)", fontSize: "14px" }, arrow: "11px", top: "46px" },
  sm: { button: { gap: "6px", minHeight: "36px", padding: "0 14px", borderRadius: "999px", fontSize: "13px", flexShrink: 0 }, arrow: "10px", top: "42px" },
};

/**
 * 직종 선택 드롭다운 (바깥 클릭 시 닫힘). 홈·공고·인재 화면 공용.
 * 분야별로 묶어 보여주며, 분야 이름을 고르면 그 분야 전체, 세부 직종을 고르면 그 직종만 거른다.
 */
export function CategoryDropdown({ value, onChange, size = "md" }: { value: string; onChange: (category: string) => void; size?: Size }) {
  const { open, toggle, close } = useDismissible();
  const s = SIZE_STYLES[size];

  const select = (next: string) => {
    onChange(next);
    close();
  };

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
        style={{ display: "flex", alignItems: "center", border: `1.5px solid ${colors.navy}`, background: "var(--gs-surface)", fontWeight: 700, color: colors.navy, cursor: "pointer", whiteSpace: "nowrap", ...s.button }}
      >
        {categoryLabel(value, "직종 선택")}
        <span style={{ fontSize: s.arrow }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="직종"
          onClick={(event) => event.stopPropagation()}
          style={{ position: "absolute", top: s.top, left: 0, background: "var(--gs-surface)", border: `1px solid ${colors.line}`, borderRadius: "12px", boxShadow: "var(--gs-shadow-md)", zIndex: 50, width: "min(300px, 86vw)", maxHeight: "min(420px, 64vh)", overflowY: "auto", padding: "6px" }}
        >
          <Option label="전체 직종" selected={value === ALL_CATEGORY} onSelect={() => select(ALL_CATEGORY)} strong />
          {JOB_GROUPS.map((group) => {
            const groupValue = groupCategoryValue(group.key);
            return (
              <div key={group.key} role="group" aria-label={group.label} style={{ borderTop: `1px solid ${colors.lineSoft}`, marginTop: "4px", paddingTop: "4px" }}>
                <Option
                  label={`${group.label} 전체`}
                  icon={<JobGroupIcon group={group.key} size={16} />}
                  selected={value === groupValue}
                  onSelect={() => select(groupValue)}
                  strong
                />
                {group.types.map((type) => (
                  <Option key={type} label={type} selected={value === type} onSelect={() => select(type)} indent />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Option({ label, selected, onSelect, icon, strong = false, indent = false }: { label: string; selected: boolean; onSelect: () => void; icon?: React.ReactNode; strong?: boolean; indent?: boolean }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      // 목록을 열면 현재 선택 항목이 보이도록 스크롤
      ref={selected ? (element) => element?.scrollIntoView?.({ block: "center" }) : undefined}
      style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", minHeight: "38px", padding: indent ? "0 12px 0 36px" : "0 12px", border: "none", borderRadius: "8px", background: selected ? colors.blueSoft : "transparent", fontSize: "14px", fontWeight: selected || strong ? 700 : 400, color: selected ? colors.navy : strong ? colors.ink : colors.text, cursor: "pointer", textAlign: "left" }}
    >
      {icon}
      {label}
    </button>
  );
}
