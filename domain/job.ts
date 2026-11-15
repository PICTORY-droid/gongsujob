import { parseAmount } from "@/domain/format";
import type { JobFormValues } from "@/domain/validation";
import type { NewJob } from "@/types/domain";

/** 폼 값 → 저장용 레코드 (순수 변환, 테스트 대상) */
export function toNewJob(form: JobFormValues, userId: string): NewJob {
  return {
    user_id: userId,
    title: form.title,
    company: form.company,
    region: form.region,
    detail_address: form.detail_address,
    job_type: form.job_type,
    pay: parseAmount(form.pay),
    pay_type: form.pay_type,
    headcount: parseInt(form.headcount, 10),
    start_date: form.start_date,
    end_date: form.end_date || null,
    completion_date: form.completion_date || null,
    description: form.description,
    is_urgent: form.is_urgent,
    is_active: true,
    source: "직접등록",
  };
}
