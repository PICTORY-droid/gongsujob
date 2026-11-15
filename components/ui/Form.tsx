import type { CSSProperties, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { card, colors, inputStyle } from "@/components/ui/theme";

/** 폼 공통 컴포넌트: 섹션 카드, 라벨+입력, 선택 칩 */

export function FormSection({ title, children, marginBottom = "12px" }: { title?: string; children: ReactNode; marginBottom?: string }) {
  return (
    <section style={{ ...card, padding: "20px", marginBottom }}>
      {title && <div style={{ fontSize: "14px", fontWeight: 700, color: colors.ink, marginBottom: "16px" }}>{title}</div>}
      {children}
    </section>
  );
}

export function FieldLabel({ children, htmlFor, gap = "6px" }: { children: ReactNode; htmlFor?: string; gap?: string }) {
  return (
    <label htmlFor={htmlFor} style={{ fontSize: "12px", color: colors.muted, display: "block", marginBottom: gap }}>
      {children}
    </label>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; marginBottom?: string; hint?: ReactNode };

export function TextField({ label, marginBottom = "14px", hint, id, style, ...inputProps }: TextFieldProps) {
  const fieldId = id ?? (inputProps.name ? `field-${inputProps.name}` : undefined);
  return (
    <div style={{ marginBottom }}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <input id={fieldId} {...inputProps} style={{ ...inputStyle, ...style }} />
      {hint}
    </div>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; marginBottom?: string };

export function TextAreaField({ label, marginBottom = "0", id, style, ...areaProps }: TextAreaFieldProps) {
  const fieldId = id ?? (areaProps.name ? `field-${areaProps.name}` : undefined);
  return (
    <div style={{ marginBottom }}>
      {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
      <textarea id={fieldId} {...areaProps} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, ...style }} />
    </div>
  );
}

type ChipLayout = "grid4" | "grid3" | "wrap" | "row";

const LAYOUTS: Record<ChipLayout, CSSProperties> = {
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" },
  wrap: { display: "flex", gap: "8px", flexWrap: "wrap" },
  row: { display: "flex", gap: "8px" },
};

const CHIP_PADDING: Record<ChipLayout, string> = { grid4: "8px 4px", grid3: "10px 6px", wrap: "8px 14px", row: "10px" };

/** 지역·직종·급여형태 같은 단일 선택 버튼 그룹 */
export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  layout = "wrap",
  ariaLabel,
}: {
  options: readonly T[];
  value: string;
  onChange: (value: T) => void;
  layout?: ChipLayout;
  ariaLabel?: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} style={LAYOUTS[layout]}>
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            style={{
              flex: layout === "row" ? 1 : undefined,
              padding: CHIP_PADDING[layout],
              border: `1.5px solid ${selected ? colors.brand : colors.line}`,
              borderRadius: "8px",
              background: selected ? colors.brandSoft : "#fff",
              fontSize: layout === "row" || layout === "grid3" ? "14px" : "13px",
              fontWeight: selected ? 700 : 400,
              color: selected ? colors.brand : colors.text,
              cursor: "pointer",
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
