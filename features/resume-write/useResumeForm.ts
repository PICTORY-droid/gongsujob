"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useSession } from "@/hooks/useSession";
import { getMyResume, saveResume, uploadResumePhoto } from "@/services/resume.service";
import { updateAvatar } from "@/services/profile.service";
import { toResumeForm, toResumeRecord } from "@/domain/resume";
import { validateResumeForm, type ResumeFormValues } from "@/domain/validation";
import { ROUTES } from "@/lib/constants";
import { errorMessage, successMessage, type FormMessage } from "@/types/ui";

const EMPTY_FORM: ResumeFormValues = {
  name: "",
  birth: "",
  phone: "",
  email: "",
  address: "",
  job_type: "",
  career_years: "0",
  skills: "",
  certifications: "",
  experience: "",
  education: "",
  is_public: true,
};

const REDIRECT_DELAY_MS = 1500;

/** 이력서 작성·수정: 기존 이력서 불러오기, 사진 업로드, 저장 */
export function useResumeForm() {
  const { user, profile, loading: sessionLoading } = useSession({ requireAuth: true });

  const [form, setForm] = useState<ResumeFormValues>(EMPTY_FORM);
  const [photoUrl, setPhotoUrl] = useState("");
  const [hasSafetyCert, setHasSafetyCert] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<FormMessage>(null);

  useEffect(() => {
    if (sessionLoading || !user) return;
    let cancelled = false;

    getMyResume(user.id).then((resume) => {
      if (cancelled) return;
      if (resume) {
        setForm(toResumeForm(resume));
        setPhotoUrl(resume.photo_url || "");
        setHasSafetyCert(resume.has_safety_cert ?? false);
      } else if (profile?.name) {
        // 이력서가 없으면 프로필 이름을 기본값으로 채운다.
        setForm((prev) => ({ ...prev, name: profile.name ?? "" }));
      }
      setFetching(false);
    });

    return () => {
      cancelled = true;
    };
  }, [sessionLoading, user, profile?.name]);

  const setField = <K extends keyof ResumeFormValues>(name: K, value: ResumeFormValues[K]) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    const nextValue = type === "checkbox" ? (event.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const uploadPhoto = async (file: File | undefined) => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const uploaded = await uploadResumePhoto(user.id, file);
      if (!uploaded.ok) {
        setMessage(errorMessage(uploaded.error));
        return;
      }
      setPhotoUrl(uploaded.data);

      const avatar = await updateAvatar(user.id, uploaded.data);
      if (!avatar.ok) {
        setMessage(errorMessage("사진은 업로드됐지만 프로필 반영에 실패했습니다: " + avatar.error));
        return;
      }
      setMessage(successMessage("사진 업로드 완료. 내정보 프로필에도 반영됩니다. 저장 버튼을 눌러주세요."));
    } catch {
      setMessage(errorMessage("업로드 오류가 발생했습니다."));
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    const invalid = validateResumeForm(form);
    if (invalid) {
      setMessage(errorMessage(invalid));
      return;
    }
    if (!user) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const result = await saveResume(toResumeRecord(form, { userId: user.id, photoUrl, hasSafetyCert }));
      if (!result.ok) {
        setMessage(errorMessage(result.error));
        return;
      }
      setMessage(successMessage("✅ 이력서가 저장됐습니다."));
      setTimeout(() => {
        window.location.href = ROUTES.mypage;
      }, REDIRECT_DELAY_MS);
    } catch {
      setMessage(errorMessage("오류가 발생했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    setField,
    handleChange,
    photoUrl,
    hasSafetyCert,
    setHasSafetyCert,
    uploadPhoto,
    uploading,
    submit,
    submitting,
    fetching: sessionLoading || fetching,
    message,
  };
}
