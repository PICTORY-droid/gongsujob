import {
  BadgeCheck,
  Briefcase,
  CalendarClock,
  Calculator,
  ClipboardList,
  FileSignature,
  FileSpreadsheet,
  FileText,
  HardHat,
  Heart,
  Search,
  ShieldCheck,
  SquarePlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { colors } from "@/components/ui/theme";
import type { ActionCard, ActionIcon, FeatureIcon, FeatureItem } from "@/features/home/home-menus";
import { JobGroupIcon } from "@/components/job/JobGroupIcon";
import { JOB_GROUPS } from "@/lib/job-taxonomy";
import { groupCategoryValue } from "@/domain/job-category";

/** 홈 메뉴 표시 컴포넌트 (상태 없음). 아이콘: Lucide(ISC) */

/* ───────── 빠른 검색 ───────── */

export function QuickSearch({ value, onChange, onSubmit, placeholder }: { value: string; onChange: (value: string) => void; onSubmit: () => void; placeholder: string }) {
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="gs-container"
      style={{ marginTop: "16px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: colors.surface, border: `1.5px solid ${colors.navy}`, borderRadius: "var(--gs-radius-lg)", padding: "6px 6px 6px 14px", boxShadow: "var(--gs-shadow-sm)" }}>
        <Search size={20} color="var(--gs-muted)" aria-hidden="true" />
        <input
          type="search"
          aria-label={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, minWidth: 0, border: "none", outline: "none", fontSize: "16px", background: "transparent", color: colors.ink, minHeight: "40px" }}
        />
        <button type="submit" style={{ flexShrink: 0, minHeight: "44px", padding: "0 20px", borderRadius: "var(--gs-radius-md)", border: "none", background: colors.brand, color: "#fff", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
          검색
        </button>
      </div>
    </form>
  );
}

/* ───────── 분야별 직종 메뉴 ───────── */

/** 분야 6개 타일. 누르면 그 분야 전체로 걸러진 목록으로 이동한다(세부 직종은 목록 화면에서 좁힌다). */
export function CategoryMenu({ title, subtitle, onSelect }: { title: string; subtitle: string; onSelect: (category: string | null) => void }) {
  return (
    <section className="gs-container" style={{ marginTop: "24px" }} aria-labelledby="category-menu-title">
      <div style={{ background: colors.surface, borderRadius: "var(--gs-radius-lg)", border: `1px solid ${colors.line}`, padding: "clamp(20px, 3vw, 32px)", boxShadow: "var(--gs-shadow-sm)" }}>
        <div style={{ textAlign: "center", marginBottom: "clamp(18px, 3vw, 28px)" }}>
          <h2 id="category-menu-title" style={{ display: "inline-block", margin: 0, paddingBottom: "8px", borderBottom: `3px solid ${colors.brandBright}`, fontSize: "clamp(20px, 1.4vw + 15px, 28px)", fontWeight: 800, color: colors.ink }}>
            {title}
          </h2>
          <p style={{ margin: "10px 0 0", fontSize: "14px", color: colors.sub }}>{subtitle}</p>
        </div>
        <ul className="gs-group-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {JOB_GROUPS.map((group) => (
            <li key={group.key}>
              <button type="button" onClick={() => onSelect(groupCategoryValue(group.key))} className="gs-group-tile" aria-label={`${group.label} — ${group.description}`}>
                <span className="gs-group-icon" style={{ color: colors.navy }}>
                  <JobGroupIcon group={group.key} size={34} strokeWidth={1.7} />
                </span>
                <span style={{ fontSize: "15px", fontWeight: 700, color: colors.ink }}>{group.label}</span>
                <span style={{ fontSize: "12px", color: colors.muted, lineHeight: 1.4 }}>{group.description}</span>
              </button>
            </li>
          ))}
        </ul>
        <div style={{ textAlign: "center", marginTop: "14px" }}>
          <button type="button" onClick={() => onSelect(null)} style={{ border: "none", background: "transparent", color: colors.blue, fontSize: "14px", fontWeight: 700, cursor: "pointer", minHeight: "40px" }}>
            전체 직종 보기 →
          </button>
        </div>
      </div>
    </section>
  );
}

/* ───────── 바로가기 ───────── */

const ACTION_ICONS: Record<ActionIcon, LucideIcon> = {
  resume: FileText,
  jobs: Briefcase,
  post: SquarePlus,
  talent: Users,
  saved: Heart,
  manage: ClipboardList,
};

export function ActionCards({ cards, onSelect }: { cards: ActionCard[]; onSelect: (href: string) => void }) {
  return (
    <section className="gs-container gs-action-grid" style={{ paddingBlock: "20px", gridTemplateColumns: cards.length === 3 ? "repeat(3, minmax(0, 1fr))" : undefined }} aria-label="바로가기">
      {cards.map((item) => {
        const Icon = ACTION_ICONS[item.icon];
        return (
          <button key={item.href} type="button" onClick={() => onSelect(item.href)} className="gs-hover-lift" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", background: colors.surface, border: `1px solid ${colors.line}`, borderRadius: "var(--gs-radius-lg)", padding: "16px 8px", boxShadow: "var(--gs-shadow-sm)", cursor: "pointer" }}>
            <Icon size={26} color="var(--gs-brand)" strokeWidth={1.9} aria-hidden="true" />
            <span style={{ fontSize: "14px", fontWeight: 700, color: colors.ink }}>{item.label}</span>
            <span style={{ fontSize: "12px", color: colors.muted }}>{item.desc}</span>
          </button>
        );
      })}
    </section>
  );
}

/* ───────── 기능 안내 (모두 실제 화면으로 연결) ───────── */

const FEATURE_ICONS: Record<FeatureIcon, LucideIcon> = {
  verified: BadgeCheck,
  spreadsheet: FileSpreadsheet,
  contract: FileSignature,
  calculator: Calculator,
  safety: HardHat,
  privacy: ShieldCheck,
  saved: Heart,
  today: CalendarClock,
};

export function FeatureMenu({ title, subtitle, items, onSelect }: { title: string; subtitle: string; items: FeatureItem[]; onSelect: (href: string) => void }) {
  return (
    <section style={{ background: colors.surface, borderBlock: `1px solid ${colors.line}`, marginTop: "8px" }} aria-labelledby="feature-menu-title">
      <div className="gs-container" style={{ paddingBlock: "clamp(28px, 5vw, 56px)" }}>
        <h2 id="feature-menu-title" style={{ margin: 0, textAlign: "center", fontSize: "clamp(20px, 1.4vw + 14px, 28px)", fontWeight: 800, color: colors.ink }}>
          {title}
        </h2>
        <p style={{ margin: "6px 0 clamp(20px, 3vw, 36px)", textAlign: "center", fontSize: "14px", color: colors.sub }}>{subtitle}</p>
        <ul className="gs-feature-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {items.map((item) => {
            const Icon = FEATURE_ICONS[item.icon];
            return (
              <li key={item.title}>
                <button type="button" onClick={() => onSelect(item.href)} className="gs-feature-item" style={{ width: "100%", height: "100%", display: "flex", gap: "14px", alignItems: "flex-start", textAlign: "left", border: "none", background: "transparent", padding: "12px", borderRadius: "var(--gs-radius-lg)", cursor: "pointer" }}>
                  <span style={{ flexShrink: 0, width: "64px", height: "64px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "20px", background: colors.blueSoft, border: `1px solid ${colors.blueBorder}`, color: colors.navy }}>
                    <Icon size={30} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "block", fontSize: "16px", fontWeight: 700, color: colors.ink, marginBottom: "4px" }}>{item.title}</span>
                    <span style={{ display: "block", fontSize: "13px", lineHeight: 1.55, color: colors.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.description}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
