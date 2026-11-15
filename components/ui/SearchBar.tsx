import { colors } from "@/components/ui/theme";

/** 목록 상단 검색 입력 */
export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div style={{ background: "#fff", padding: "12px 20px", borderBottom: `1px solid ${colors.line}` }}>
      <input
        type="search"
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "10px 14px", border: `1px solid ${colors.line}`, borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}
