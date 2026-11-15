import { getBrowserSupabase as db } from "@/lib/supabase/client";
import type { ApplicationWithJob, Result } from "@/types/domain";

/** 지원 서비스 (applications 테이블) */

export const APPLICATION_STATUS_SUBMITTED = "지원완료";

export async function listMyApplications(userId: string): Promise<ApplicationWithJob[]> {
  const { data } = await db()
    .from("applications")
    .select("id,status,created_at, jobs(title, region, pay, pay_type)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as unknown as ApplicationWithJob[] | null) ?? [];
}

export async function hasApplied(jobId: string, userId: string): Promise<boolean> {
  const { data } = await db().from("applications").select("id").eq("job_id", jobId).eq("user_id", userId).maybeSingle();
  return Boolean(data);
}

export async function applyToJob(jobId: string, userId: string): Promise<Result<null>> {
  const { error } = await db()
    .from("applications")
    .insert({ job_id: jobId, user_id: userId, status: APPLICATION_STATUS_SUBMITTED });
  if (error) return { ok: false, error: "오류 발생." };
  return { ok: true, data: null };
}
