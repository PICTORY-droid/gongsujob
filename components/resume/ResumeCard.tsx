import { Avatar } from "@/components/ui/Avatar";
import { colors, listCard } from "@/components/ui/theme";
import type { PublicResume } from "@/types/domain";

type ResumeCardData = Pick<PublicResume, "id" | "name" | "photo_url" | "job_type" | "career_years" | "address" | "skills">;

/** 인재(이력서) 카드 내용. 클릭 동작(버튼/링크)은 감싸는 쪽에서 결정한다. */
export function ResumeCardBody({ resume }: { resume: ResumeCardData }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: resume.skills ? "10px" : "0" }}>
        <Avatar src={resume.photo_url} fallback={resume.name?.charAt(0) || "👷"} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: colors.ink }}>{resume.name || "이름 미입력"}</div>
          <div style={{ fontSize: "12px", color: colors.muted, marginTop: "2px" }}>
            경력 {resume.career_years || 0}년 · {resume.address || "지역 미입력"}
          </div>
        </div>
        <div style={{ background: colors.brandTint, color: colors.brand, fontSize: "12px", borderRadius: "6px", padding: "4px 10px", fontWeight: 600 }}>{resume.job_type || "직종 미입력"}</div>
      </div>

      {resume.skills && <div style={{ fontSize: "12px", color: colors.sub, background: colors.page, borderRadius: "8px", padding: "8px 12px" }}>🛠 {resume.skills}</div>}
    </>
  );
}

/** 클릭 가능한 인재 카드 (버튼 시맨틱) */
export default function ResumeCard({ resume, onClick }: { resume: ResumeCardData; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ ...listCard, width: "100%", textAlign: "left", cursor: "pointer" }}>
      <ResumeCardBody resume={resume} />
    </button>
  );
}
