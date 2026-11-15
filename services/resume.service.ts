import { getBrowserSupabase as db } from "@/lib/supabase/client";
import { AVATAR_BUCKET } from "@/lib/constants";
import { jobTypesForCategory } from "@/domain/job-category";
import type { PublicResume, Resume, ResumeContact, ResumeUpsert, Result } from "@/types/domain";

/**
 * 이력서 서비스 (resumes 테이블).
 * 보안: 공개 목록 조회 시 연락처(phone·email)·생년월일은 아예 요청하지 않는다.
 * (기존에는 select("*")로 전체를 받아 화면에서만 가렸기 때문에 네트워크 응답에 연락처가 노출됐다.)
 */

export const PUBLIC_RESUME_COLUMNS =
  "id,user_id,name,photo_url,job_type,career_years,address,skills,certifications,experience,has_safety_cert,is_public,created_at";

export async function listPublicResumes(category: string): Promise<PublicResume[] | null> {
  let query = db()
    .from("resumes")
    .select(PUBLIC_RESUME_COLUMNS)
    .eq("is_public", true)
    .order("created_at", { ascending: false });
  const types = jobTypesForCategory(category);
  if (types) query = types.length === 1 ? query.eq("job_type", types[0]) : query.in("job_type", [...types]);

  const { data, error } = await query;
  if (error || !data) return null;
  return data as PublicResume[];
}

/** 제안이 수락된 경우에만 호출: 연락처 단건 조회 */
export async function getResumeContact(resumeId: string): Promise<ResumeContact | null> {
  const { data } = await db().from("resumes").select("phone,email").eq("id", resumeId).maybeSingle();
  return (data as ResumeContact | null) ?? null;
}

export async function getMyResume(userId: string): Promise<Resume | null> {
  const { data } = await db().from("resumes").select("*").eq("user_id", userId).maybeSingle();
  return (data as Resume | null) ?? null;
}

export async function saveResume(resume: ResumeUpsert): Promise<Result<null>> {
  const { data: existing } = await db().from("resumes").select("id").eq("user_id", resume.user_id).maybeSingle();

  const { error } = existing
    ? await db().from("resumes").update(resume).eq("user_id", resume.user_id)
    : await db().from("resumes").insert(resume);

  if (error) return { ok: false, error: "저장 실패: " + error.message };
  return { ok: true, data: null };
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function uploadResumePhoto(userId: string, file: File): Promise<Result<string>> {
  if (!file.type.startsWith("image/")) return { ok: false, error: "사진 업로드 실패: 지원하지 않는 이미지 형식입니다." };
  if (file.size > MAX_PHOTO_BYTES) return { ok: false, error: "사진 업로드 실패: 5MB 이하 이미지만 올릴 수 있습니다." };

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const filePath = `${userId}/resume_photo_${Date.now()}.${ext}`;

  const storage = db().storage.from(AVATAR_BUCKET);
  const { error } = await storage.upload(filePath, file, { cacheControl: "0", upsert: false });
  if (error) return { ok: false, error: "사진 업로드 실패: " + error.message };

  return { ok: true, data: storage.getPublicUrl(filePath).data.publicUrl };
}
