"use client";

import { useState, type ChangeEvent } from "react";
import { useSession } from "@/hooks/useSession";
import { createJob } from "@/services/job.service";
import { toNewJob } from "@/domain/job";
import { validateJobForm, type JobFormValues } from "@/domain/validation";
import { ROUTES } from "@/lib/constants";
import { errorMessage, successMessage, type FormMessage } from "@/types/ui";

const INITIAL_FORM: JobFormValues = {
  title: "",
  company: "",
  region: "",
  detail_address: "",
  job_type: "",
  pay: "",
  pay_type: "일당",
  headcount: "1",
  start_date: "",
  end_date: "",
  completion_date: "",
  description: "",
  is_urgent: false,
};

const REDIRECT_DELAY_MS = 1500;

/** 공고 등록 화면 상태와 제출 동작 */
export function useJobForm() {
  const { user } = useSession({ requireAuth: true });
  const [form, setForm] = useState<JobFormValues>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<FormMessage>(null);

  const setField = <K extends keyof JobFormValues>(name: K, value: JobFormValues[K]) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    const nextValue = type === "checkbox" ? (event.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const submit = async () => {
    const invalid = validateJobForm(form);
    if (invalid) {
      setMessage(errorMessage(invalid));
      return;
    }
    if (!user) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const result = await createJob(toNewJob(form, user.id));
      if (!result.ok) {
        setMessage(errorMessage(result.error));
        return;
      }
      setMessage(successMessage("✅ 공고가 등록됐습니다."));
      setTimeout(() => {
        window.location.href = ROUTES.mypage;
      }, REDIRECT_DELAY_MS);
    } catch {
      setMessage(errorMessage("오류가 발생했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  return { form, setField, handleChange, submit, submitting, message };
}
