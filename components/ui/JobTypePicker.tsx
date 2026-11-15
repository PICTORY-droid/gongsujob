"use client";

import { useState } from "react";
import { JobGroupIcon } from "@/components/job/JobGroupIcon";
import { ChipSelect } from "@/components/ui/Form";
import { colors } from "@/components/ui/theme";
import { JOB_GROUPS, type JobGroupKey } from "@/lib/job-taxonomy";
import { findGroupOfType } from "@/domain/job-category";

/**
 * 공고·이력서 작성용 직종 선택: ① 분야 고르기 → ② 세부 직종 고르기.
 * 26개 직종을 한 번에 늘어놓지 않고 분야별로 나눠 보여준다.
 */
export function JobTypePicker({ value, onChange }: { value: string; onChange: (jobType: string) => void }) {
  const [openGroup, setOpenGroup] = useState<JobGroupKey>(() => findGroupOfType(value)?.key ?? "site");
  const group = JOB_GROUPS.find((g) => g.key === openGroup) ?? JOB_GROUPS[0];
  const selectedGroup = findGroupOfType(value)?.key;

  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <div role="group" aria-label="분야" className="gs-chip-row" style={{ marginBottom: "10px", paddingBottom: "2px" }}>
        {JOB_GROUPS.map((g) => {
          const active = g.key === openGroup;
          return (
            <button
              key={g.key}
              type="button"
              aria-pressed={active}
              onClick={() => setOpenGroup(g.key)}
              style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "6px", minHeight: "38px", padding: "0 12px", borderRadius: "999px", border: `1px solid ${active ? colors.navy : colors.line}`, background: active ? colors.navy : colors.surface, color: active ? "#fff" : colors.text, fontSize: "13px", fontWeight: active ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <JobGroupIcon group={g.key} size={16} />
              {g.label}
              {selectedGroup === g.key && !active && <span aria-label="선택됨" style={{ width: "6px", height: "6px", borderRadius: "999px", background: colors.brand }} />}
            </button>
          );
        })}
      </div>
      <ChipSelect ariaLabel={`${group.label} 직종`} options={group.types} value={value} onChange={onChange} />
    </div>
  );
}
