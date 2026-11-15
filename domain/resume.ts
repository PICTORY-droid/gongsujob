import type { ResumeFormValues } from "@/domain/validation";
import type { Resume, ResumeUpsert } from "@/types/domain";

/** 이력서 레코드 ↔ 폼 값 변환 (순수 함수) */

export function toResumeForm(resume: Resume): ResumeFormValues {
  return {
    name: resume.name || "",
    birth: resume.birth || "",
    phone: resume.phone || "",
    email: resume.email || "",
    address: resume.address || "",
    job_type: resume.job_type || "",
    career_years: String(resume.career_years || "0"),
    skills: resume.skills || "",
    certifications: resume.certifications || "",
    experience: resume.experience || "",
    education: resume.education || "",
    is_public: resume.is_public ?? true,
  };
}

export function toResumeRecord(
  form: ResumeFormValues,
  extra: { userId: string; photoUrl: string; hasSafetyCert: boolean; now?: Date },
): ResumeUpsert {
  return {
    user_id: extra.userId,
    name: form.name,
    birth: form.birth,
    phone: form.phone,
    email: form.email,
    address: form.address,
    job_type: form.job_type,
    career_years: parseInt(form.career_years, 10) || 0,
    skills: form.skills,
    certifications: form.certifications,
    experience: form.experience,
    education: form.education,
    photo_url: extra.photoUrl,
    is_public: form.is_public,
    has_safety_cert: extra.hasSafetyCert,
    updated_at: (extra.now ?? new Date()).toISOString(),
  };
}
