import type { OfferFormValues } from "@/domain/validation";
import type { Job } from "@/types/domain";

/** 포지션 제안 양식 기본값과 공고 → 양식 채우기 (순수 함수) */

export const DEFAULT_OFFER_MESSAGE = "이력서를 확인하고 현장 조건과 잘 맞아 보여 제안드립니다.";

export const emptyOfferForm = (): OfferFormValues => ({
  title: "",
  job_type: "",
  location: "",
  start_date: "",
  pay: "",
  work_conditions: "",
  message: DEFAULT_OFFER_MESSAGE,
  job_id: "",
});

/** 내 공고를 고르면 제안 양식에 공고 정보를 채워 넣는다 (순수 함수) */
export function fillOfferFromJob(prev: OfferFormValues, job: Job | undefined): OfferFormValues {
  if (!job) return { ...prev, job_id: "" };
  return {
    ...prev,
    job_id: job.id,
    title: job.title || prev.title,
    job_type: job.job_type || prev.job_type,
    location: job.detail_address || job.region || prev.location,
    start_date: job.start_date || prev.start_date,
    pay: job.pay ? String(job.pay) : prev.pay,
    work_conditions: job.description || prev.work_conditions,
  };
}
