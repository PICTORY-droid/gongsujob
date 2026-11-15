import { getBrowserSupabase as db } from "@/lib/supabase/client";
import { ALL_CATEGORY } from "@/lib/constants";
import type { Job, NewJob, Result } from "@/types/domain";

/** 공고 서비스 (jobs 테이블, active_jobs 뷰) */

export async function listActiveJobs(options: { category: string; limit?: number }): Promise<Job[] | null> {
  let query = db().from("active_jobs").select("*").eq("is_active", true).order("created_at", { ascending: false });
  if (options.limit) query = query.limit(options.limit);
  if (options.category !== ALL_CATEGORY) query = query.eq("job_type", options.category);

  const { data, error } = await query;
  if (error || !data) return null;
  return data as Job[];
}

export async function getJob(jobId: string): Promise<Job | null> {
  const { data } = await db().from("jobs").select("*").eq("id", jobId).maybeSingle();
  return (data as Job | null) ?? null;
}

export async function listJobsByOwner(userId: string): Promise<Job[]> {
  const { data } = await db().from("jobs").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return (data as Job[] | null) ?? [];
}

export async function createJob(job: NewJob): Promise<Result<null>> {
  const { error } = await db().from("jobs").insert(job);
  if (error) return { ok: false, error: "등록 실패: " + error.message };
  return { ok: true, data: null };
}

/** 본인 공고만 삭제되도록 user_id 조건을 함께 건다(RLS와 이중 방어). */
export async function deleteJob(jobId: string, ownerId: string): Promise<Result<null>> {
  const { error } = await db().from("jobs").delete().eq("id", jobId).eq("user_id", ownerId);
  if (error) return { ok: false, error: "삭제 실패: " + error.message };
  return { ok: true, data: null };
}
