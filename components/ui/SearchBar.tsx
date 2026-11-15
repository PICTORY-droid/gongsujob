import { colors, inputStyle } from "@/components/ui/theme";

/** 목록 상단 검색 입력 */
export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div style={{ background: colors.surface, padding: "12px 0", borderBottom: `1px solid ${colors.line}` }}>
      <div className="gs-container">
        <input
          type="search"
          aria-label={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, background: colors.page }}
        />
      </div>
    </div>
  );
}
