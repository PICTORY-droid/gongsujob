export default function AppFooter() {
  return (
    <footer style={{ background: "#fff", borderTop: "1px solid #eee", padding: "28px 20px 96px", marginTop: "40px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ fontSize: "16px", fontWeight: 800, color: "#1a1a1a", marginBottom: "8px" }}>
          현장공수잡
        </div>

        <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, marginBottom: "18px" }}>
          건설 현장 일용직 구인구직 흐름을 구현한 포트폴리오 프로젝트입니다.
        </div>

        <div style={{ fontSize: "13px", color: "#333", fontWeight: 700, marginBottom: "6px" }}>
          문의
        </div>

        <div style={{ fontSize: "13px", color: "#666", marginBottom: "18px" }}>
          pictory.droid@gmail.com
        </div>

        <div style={{ fontSize: "12px", color: "#999", lineHeight: 1.6, marginBottom: "14px" }}>
          본 프로젝트는 포트폴리오 목적으로 제작된 웹 서비스입니다.<br />
          실제 채용, 급여, 근로 조건은 등록자와 이용자 간 확인이 필요합니다.
        </div>

        <div style={{ fontSize: "12px", color: "#bbb" }}>
          © 2026 GongsuJob. Portfolio Project.
        </div>
      </div>
    </footer>
  );
}
