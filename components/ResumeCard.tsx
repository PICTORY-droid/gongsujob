type ResumeCardProps = {
  resume: {
    id: string;
    name?: string;
    photo_url?: string;
    job_type?: string;
    career_years?: number;
    address?: string;
    skills?: string;
  };
  onClick: () => void;
};

export default function ResumeCard({ resume, onClick }: ResumeCardProps) {
  return (
    <div
      onClick={onClick}
      style={{ background: "#fff", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #eee", cursor: "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: resume.skills ? "10px" : "0" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: resume.photo_url ? "transparent" : "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
          {resume.photo_url ? (
            <img src={resume.photo_url} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "20px", color: "#fff", fontWeight: 700 }}>
              {resume.name?.charAt(0) || "👷"}
            </span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>{resume.name}</div>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
            경력 {resume.career_years || 0}년 · {resume.address || "지역 미입력"}
          </div>
        </div>

        <div style={{ background: "#fff3e0", color: "#FF6B00", fontSize: "12px", borderRadius: "6px", padding: "4px 10px", fontWeight: 600 }}>
          {resume.job_type || "직종 미입력"}
        </div>
      </div>

      {resume.skills && (
        <div style={{ fontSize: "12px", color: "#666", background: "#f8f9fa", borderRadius: "8px", padding: "8px 12px" }}>
          🛠 {resume.skills}
        </div>
      )}
    </div>
  );
}
