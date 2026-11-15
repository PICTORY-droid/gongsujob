import { getBrowserSupabase as db } from "@/lib/supabase/client";
import type { ConfirmedWorker } from "@/types/domain";

/**
 * 현장관리 서비스: 구인자가 보낸 제안 중 '수락'된 것만 확정 인력으로 가져온다.
 * 연락처는 수락된 제안의 이력서에 한해 한 번에 조회한다(수락 전 연락처 비공개 원칙 유지).
 * 다른 구인자의 제안은 DB 보안 정책(RLS)에서 막힌다.
 */

const CONFIRMED_COLUMNS =
  "id, job_id, resume_id, title, job_type, location, start_date, pay, work_conditions, resumes(name, job_type), jobs(title, company, region, detail_address, start_date, pay_type)";

type Row = Omit<ConfirmedWorker, "workerName" | "workerJobType" | "phone" | "job"> & {
  resumes: { name: string | null; job_type: string | null } | null;
  jobs: ConfirmedWorker["job"];
};

async function attachContacts(rows: Row[]): Promise<ConfirmedWorker[]> {
  const resumeIds = [...new Set(rows.map((row) => row.resume_id))];
  const phones = new Map<string, string | null>();
  if (resumeIds.length > 0) {
    const { data } = await db().from("resumes").select("id, phone").in("id", resumeIds);
    for (const resume of (data as { id: string; phone: string | null }[] | null) ?? []) phones.set(resume.id, resume.phone);
  }
  return rows.map(({ resumes, jobs, ...offer }) => ({
    ...offer,
    workerName: resumes?.name || "이름 미입력",
    workerJobType: resumes?.job_type ?? null,
    phone: phones.get(offer.resume_id) ?? null,
    job: jobs,
  }));
}

export async function listConfirmedWorkers(employerId: string): Promise<ConfirmedWorker[] | null> {
  const { data, error } = await db()
    .from("position_offers")
    .select(CONFIRMED_COLUMNS)
    .eq("employer_user_id", employerId)
    .eq("status", "accepted")
    .order("start_date", { ascending: false });
  if (error) return null;
  return attachContacts((data as unknown as Row[]) ?? []);
}

export async function getConfirmedWorker(employerId: string, offerId: string): Promise<ConfirmedWorker | null> {
  const { data } = await db()
    .from("position_offers")
    .select(CONFIRMED_COLUMNS)
    .eq("id", offerId)
    .eq("employer_user_id", employerId)
    .eq("status", "accepted")
    .maybeSingle();
  if (!data) return null;
  const [worker] = await attachContacts([data as unknown as Row]);
  return worker ?? null;
}
