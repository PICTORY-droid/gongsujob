export default function AppFooter() {
  return (
    <footer style={{ background: "var(--gs-surface)", borderTop: "1px solid var(--gs-line)", padding: "28px 0 96px", marginTop: "40px" }} className="gs-page-bottom">
      <div className="gs-container">
        <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--gs-ink)", marginBottom: "8px" }}>
          현장공수잡
        </div>

        <div style={{ fontSize: "13px", color: "var(--gs-sub)", lineHeight: 1.6, marginBottom: "18px" }}>
          현장·기술·물류·이사·식당·공장 일용직 구인구직 흐름을 구현한 포트폴리오 프로젝트입니다.
        </div>

        <div style={{ fontSize: "13px", color: "var(--gs-text)", fontWeight: 700, marginBottom: "6px" }}>
          문의
        </div>

        <div style={{ fontSize: "13px", color: "var(--gs-sub)", marginBottom: "18px" }}>
          pictory.droid@gmail.com
        </div>

        <div style={{ fontSize: "12px", color: "var(--gs-muted)", lineHeight: 1.6, marginBottom: "14px" }}>
          본 프로젝트는 포트폴리오 목적으로 제작된 웹 서비스입니다.<br />
          실제 채용, 급여, 근로 조건은 등록자와 이용자 간 확인이 필요합니다.
        </div>

        <div style={{ fontSize: "12px", color: "var(--gs-muted)" }}>
          © 2026 GongsuJob. Portfolio Project.
        </div>
      </div>
    </footer>
  );
}
