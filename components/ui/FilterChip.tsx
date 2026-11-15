import { colors } from "@/components/ui/theme";

/** 켜고 끄는 필터 칩 (가로 스크롤 줄에 배치). 선택 상태는 aria-pressed로 알린다. */
export function FilterChip({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={{
        flexShrink: 0,
        minHeight: "36px",
        padding: "0 14px",
        borderRadius: "999px",
        border: `1px solid ${active ? colors.navy : colors.line}`,
        background: active ? colors.navy : colors.surface,
        color: active ? "#fff" : colors.text,
        fontSize: "13px",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {typeof count === "number" && <span style={{ marginLeft: "4px", opacity: 0.8 }}>{count}</span>}
    </button>
  );
}

/** 찜(하트) 토글 버튼. 카드 링크 안에 있어도 이동하지 않도록 기본 동작을 막는다. */
export function SaveToggle({ saved, onToggle, size = 40 }: { saved: boolean; onToggle: () => void; size?: number }) {
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "찜 해제" : "찜하기"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "999px",
        border: "none",
        background: saved ? colors.brandSoft : "transparent",
        cursor: "pointer",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7.1 4.5c2 0 3.5 1.1 4.9 2.9 1.4-1.8 2.9-2.9 4.9-2.9 3.5 0 5.6 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
          fill={saved ? "var(--gs-brand)" : "none"}
          stroke={saved ? "var(--gs-brand)" : "var(--gs-muted)"}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
