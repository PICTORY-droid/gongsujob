"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useResumeList } from "@/hooks/useListings";
import { useToast } from "@/hooks/useToast";
import { listJobsByOwner } from "@/services/job.service";
import { getResumeContact } from "@/services/resume.service";
import { createOffer, getLatestOfferForResume, recordContactView } from "@/services/offer.service";
import { isContactUnlocked } from "@/domain/offer";
import { filterResumes } from "@/domain/search";
import { validateOfferForm, type OfferFormValues } from "@/domain/validation";
import { ALL_CATEGORY } from "@/lib/constants";
import { errorMessage, successMessage, type FormMessage } from "@/types/ui";
import type { Job, PositionOffer, PublicResume, ResumeContact } from "@/types/domain";

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

/**
 * 인재 찾기 화면 로직.
 * - 구인자만 인재 상세를 열 수 있다.
 * - 연락처는 제안이 "수락"된 경우에만 별도로 조회한다(목록 응답에는 연락처가 없음).
 */
export function useTalentSearch() {
  const { user, profile, isEmployer } = useSession({ requireAuth: true });
  const toast = useToast(2000);

  const [category, setCategory] = useState<string>(ALL_CATEGORY);
  const [searchQuery, setSearchQuery] = useState("");
  const { resumes, loading } = useResumeList(category);
  const [myJobs, setMyJobs] = useState<Job[]>([]);

  const [selected, setSelected] = useState<PublicResume | null>(null);
  const [existingOffer, setExistingOffer] = useState<PositionOffer | null>(null);
  const [contact, setContact] = useState<ResumeContact | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [offerForm, setOfferForm] = useState<OfferFormValues>(emptyOfferForm);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [offerMessage, setOfferMessage] = useState<FormMessage>(null);

  useEffect(() => {
    if (!user) return;
    listJobsByOwner(user.id).then(setMyJobs);
  }, [user]);

  const openResume = async (resume: PublicResume) => {
    if (!isEmployer || !user) {
      toast.show("구인전용 메뉴입니다");
      return;
    }

    setSelected(resume);
    setComposerOpen(false);
    setSent(false);
    setOfferMessage(null);
    setContact(null);
    setExistingOffer(null);
    setOfferForm(emptyOfferForm());

    const offer = await getLatestOfferForResume(user.id, resume.id);
    setExistingOffer(offer);

    if (isContactUnlocked(offer)) {
      await recordContactView(user.id, resume.id);
      setContact(await getResumeContact(resume.id));
    }
  };

  const closeResume = () => setSelected(null);

  const updateOfferField = (key: keyof OfferFormValues, value: string) => setOfferForm((prev) => ({ ...prev, [key]: value }));

  const selectJob = (jobId: string) => setOfferForm((prev) => fillOfferFromJob(prev, myJobs.find((job) => job.id === jobId)));

  const sendOffer = async () => {
    if (!selected || !user) return;

    const invalid = validateOfferForm(offerForm);
    if (invalid) {
      setOfferMessage(errorMessage(invalid));
      return;
    }

    setSending(true);
    setOfferMessage(null);

    const result = await createOffer({
      employer_user_id: user.id,
      seeker_user_id: selected.user_id,
      resume_id: selected.id,
      job_id: offerForm.job_id || null,
      title: offerForm.title,
      job_type: offerForm.job_type,
      location: offerForm.location,
      start_date: offerForm.start_date,
      pay: Number(offerForm.pay),
      work_conditions: offerForm.work_conditions,
      message: offerForm.message,
      status: "pending",
    });

    setSending(false);
    if (!result.ok) {
      setOfferMessage(errorMessage(result.error));
      return;
    }

    setExistingOffer(result.data);
    setOfferMessage(successMessage("포지션 제안을 보냈습니다. 구직자가 수락하면 연락처를 확인할 수 있습니다."));
    setSent(true);
    setComposerOpen(false);
  };

  return {
    profile,
    isEmployer,
    toastMessage: toast.message,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    loading,
    resumes: filterResumes(resumes, searchQuery),
    myJobs,
    selected,
    openResume,
    closeResume,
    existingOffer,
    contact,
    contactAllowed: isContactUnlocked(existingOffer),
    composerOpen,
    setComposerOpen,
    offerForm,
    updateOfferField,
    selectJob,
    sendOffer,
    sending,
    sent,
    offerMessage,
  };
}

export type TalentSearch = ReturnType<typeof useTalentSearch>;
