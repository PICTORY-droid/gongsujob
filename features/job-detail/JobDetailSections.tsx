import { SaveToggle } from "@/components/ui/FilterChip";
import { card, colors } from "@/components/ui/theme";
import { getStartDayBadge } from "@/domain/job-list";
import { buildKakaoMapLink } from "@/domain/geo";
import type { GeoPoint, Job, WeatherSummary } from "@/types/domain";

/** 공고 상세 화면의 표시 전용 섹션들 */

const sectionCard = { ...card, padding: "16px 20px", marginBottom: "12px" } as const;
const sectionTitle = { fontSize: "13px", fontWeight: 700, color: colors.ink, marginBottom: "12px" } as const;

export function JobInfoCard({ job, address, saved, onToggleSave }: { job: Job; address: string; saved?: boolean; onToggleSave?: () => void }) {
  const badge = getStartDayBadge(job.start_date);
  const rows = [
    { label: "현장 위치", value: address },
    { label: "시작일", value: job.start_date },
    { label: "직종", value: job.job_type },
    { label: "모집 인원", value: job.headcount ? job.headcount + "명" : null },
  ].filter((row) => row.value);

  return (
    <div style={{ ...card, padding: "20px", marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ flex: 1, marginRight: "12px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
            {job.is_urgent && <span style={{ background: colors.danger, color: "#fff", fontSize: "11px", borderRadius: "6px", padding: "3px 8px", fontWeight: 700 }}>급구</span>}
            {badge && <span style={{ background: colors.blueSoft, color: colors.blue, fontSize: "11px", borderRadius: "6px", padding: "3px 8px", fontWeight: 700 }}>{badge.label}</span>}
            <span style={{ background: colors.brandTint, color: colors.brandText, fontSize: "11px", borderRadius: "6px", padding: "3px 8px", fontWeight: 600 }}>{job.job_type}</span>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.ink, margin: 0, lineHeight: 1.3 }}>{job.title}</h1>
          <div style={{ fontSize: "13px", color: colors.muted, marginTop: "4px" }}>{job.company}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "12px", color: colors.muted, fontWeight: 600 }}>{job.pay_type}</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: colors.brandText, letterSpacing: "-0.02em" }}>{Number(job.pay).toLocaleString()}원</div>
          {onToggleSave && (
            <div style={{ marginTop: "6px", display: "flex", justifyContent: "flex-end" }}>
              <SaveToggle saved={Boolean(saved)} onToggle={onToggleSave} />
            </div>
          )}
        </div>
      </div>

      <dl style={{ display: "flex", flexDirection: "column", gap: "8px", margin: 0 }}>
        {rows.map((row) => (
          <div key={row.label} style={{ display: "flex", gap: "8px" }}>
            <dt style={{ fontSize: "13px", color: colors.muted, minWidth: "90px" }}>{row.label}</dt>
            <dd style={{ fontSize: "13px", color: colors.ink, fontWeight: 500, margin: 0 }}>{row.value}</dd>
          </div>
        ))}
      </dl>

      {job.description && (
        <div style={{ marginTop: "16px", padding: "14px", background: colors.page, borderRadius: "10px" }}>
          <div style={{ fontSize: "12px", color: colors.muted, marginBottom: "6px", fontWeight: 600 }}>공고 내용</div>
          <div style={{ fontSize: "14px", color: colors.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{job.description}</div>
        </div>
      )}
    </div>
  );
}

export function JobMapCard({ address, point, staticMapUrl }: { address: string; point: GeoPoint | null; staticMapUrl: string | null }) {
  return (
    <div style={sectionCard}>
      <div style={sectionTitle}>현장 위치 지도</div>
      <a href={buildKakaoMapLink(address, point)} target="_blank" rel="noreferrer" style={{ display: "block", borderRadius: "10px", overflow: "hidden" }}>
        {staticMapUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 우리 서버 API가 실시간으로 내려주는 타일 이미지
          <img src={staticMapUrl} style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} alt={`${address} 지도`} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "180px", background: colors.brandTint, border: `1.5px solid ${colors.brand}`, borderRadius: "10px" }}>
            <span style={{ fontSize: "36px", marginBottom: "8px" }}>🗺️</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: colors.brand }}>카카오맵에서 보기</span>
            <span style={{ fontSize: "12px", color: colors.muted, marginTop: "4px" }}>{address}</span>
          </div>
        )}
      </a>
      <div style={{ fontSize: "12px", color: colors.muted, marginTop: "8px" }}>{address}</div>
    </div>
  );
}

export function JobWeatherCard({ address, weather, loading }: { address: string; weather: WeatherSummary | null; loading: boolean }) {
  return (
    <div style={sectionCard}>
      <div style={sectionTitle}>현장 날씨 ({address})</div>
      {loading ? (
        <div style={{ fontSize: "13px", color: colors.muted }}>날씨 불러오는 중...</div>
      ) : weather ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <span style={{ fontSize: "36px" }}>{weather.icon}</span>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>{weather.weather}</div>
              {weather.temperature && <div style={{ fontSize: "13px", color: colors.sub }}>현재 {weather.temperature}</div>}
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              {weather.rainProb && <div style={{ fontSize: "12px", color: colors.info }}>강수확률 {weather.rainProb}</div>}
              {weather.tempMin && (
                <div style={{ fontSize: "12px", color: colors.sub }}>
                  최저 {weather.tempMin} / 최고 {weather.tempMax}
                </div>
              )}
            </div>
          </div>
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: weather.workable ? colors.successBg : "var(--gs-danger-bg)", border: "1px solid " + (weather.workable ? colors.successBorder : "var(--gs-danger-bg)"), display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{weather.workable ? "✅" : "⚠️"}</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: weather.workable ? colors.success : "var(--gs-danger)" }}>{weather.workable ? "오늘 작업 가능 날씨" : "비/눈 — 소장님께 확인하세요"}</span>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: "13px", color: colors.muted }}>날씨 정보를 불러올 수 없습니다.</div>
      )}
    </div>
  );
}

export function ApplyBar({ applied, applying, message, onApply }: { applied: boolean; applying: boolean; message: string; onApply: () => void }) {
  return (
    <div className="mobile-apply-bar" style={{ position: "fixed", bottom: "64px", left: 0, right: 0, background: "var(--gs-surface)", borderTop: `1px solid ${colors.line}`, padding: "12px 20px", zIndex: 90 }}>
      {message && <div style={{ textAlign: "center", fontSize: "13px", color: colors.success, marginBottom: "8px", fontWeight: 600 }}>{message}</div>}
      <button
        type="button"
        onClick={onApply}
        disabled={applied || applying}
        style={{ width: "100%", maxWidth: "560px", display: "block", margin: "0 auto", padding: "14px", borderRadius: "12px", border: "none", fontSize: "16px", fontWeight: 700, background: applied ? "var(--gs-line)" : colors.brand, color: applied ? colors.muted : "var(--gs-surface)", cursor: applied ? "default" : "pointer" }}
      >
        {applying ? "지원 중.." : applied ? "이미 지원한 공고" : "지원하기"}
      </button>
    </div>
  );
}
