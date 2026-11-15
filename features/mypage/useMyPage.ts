"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/useToast";
import { signOut } from "@/services/auth.service";
import { deleteJob, listJobsByOwner } from "@/services/job.service";
import { listMyApplications } from "@/services/application.service";
import { getResumeContact } from "@/services/resume.service";
import { listOffersForUser, respondToOffer, sendOfferMessage, type OfferInbox } from "@/services/offer.service";
import { ROUTES } from "@/lib/constants";
import { errorMessage, successMessage, type FormMessage } from "@/types/ui";
import type { ApplicationWithJob, Job, OfferStatus, PositionOfferWithRelations, ResumeContact } from "@/types/domain";

const EMPTY_INBOX: OfferInbox = { offers: [], messagesByOffer: {} };

/**
 * 내정보 화면 로직.
 * - 구인자: 내 공고 관리, 보낸 제안 + 답변
 * - 구직자: 지원 현황, 받은 제안 수락/거절 + 질문
 */
export function useMyPage() {
  const { user, profile, isEmployer, loading: sessionLoading } = useSession({ requireAuth: true });
  const toast = useToast();

  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [inbox, setInbox] = useState<OfferInbox>(EMPTY_INBOX);
  const [dataLoading, setDataLoading] = useState(true);

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<FormMessage>(null);
  const [offersOpen, setOffersOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  const refreshInbox = useCallback(async () => {
    if (!user) return;
    setInbox(await listOffersForUser(user.id, isEmployer));
  }, [user, isEmployer]);

  useEffect(() => {
    if (sessionLoading || !user) return;
    let cancelled = false;

    Promise.all([listJobsByOwner(user.id), listMyApplications(user.id), listOffersForUser(user.id, isEmployer)]).then(
      ([jobs, apps, offers]) => {
        if (cancelled) return;
        setMyJobs(jobs);
        setApplications(apps);
        setInbox(offers);
        setDataLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [sessionLoading, user, isEmployer]);

  const selectedOffer: PositionOfferWithRelations | null = inbox.offers.find((offer) => offer.id === selectedOfferId) ?? null;

  /** 구인자가 수락된 제안을 열면 그때 연락처를 조회한다 */
  const [contacts, setContacts] = useState<Record<string, ResumeContact | null>>({});
  const contactResumeId = isEmployer && selectedOffer?.status === "accepted" ? selectedOffer.resume_id : null;

  useEffect(() => {
    if (!contactResumeId || contactResumeId in contacts) return;
    getResumeContact(contactResumeId).then((contact) => setContacts((prev) => ({ ...prev, [contactResumeId]: contact })));
  }, [contactResumeId, contacts]);

  const logout = async () => {
    await signOut();
    window.location.href = ROUTES.home;
  };

  const removeJob = async (jobId: string) => {
    if (!user || !confirm("이 공고를 삭제하시겠습니까?")) return;
    const result = await deleteJob(jobId, user.id);
    if (!result.ok) {
      setActionMessage(errorMessage(result.error));
      return;
    }
    setMyJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  /** 화면 즉시 반영용: 서버 재조회 전에 선택된 제안 상태를 먼저 바꿔 둔다 */
  const patchOfferStatus = (offerId: string, status: OfferStatus) =>
    setInbox((prev) => ({ ...prev, offers: prev.offers.map((offer) => (offer.id === offerId ? { ...offer, status } : offer)) }));

  const respond = async (offer: PositionOfferWithRelations, status: "accepted" | "rejected") => {
    if (!user) return;
    const result = await respondToOffer(offer, status);
    if (!result.ok) {
      setActionMessage(errorMessage(result.error));
      return;
    }
    patchOfferStatus(offer.id, status);
    setActionMessage(successMessage(status === "accepted" ? "제안을 수락했습니다." : "제안을 거절했습니다."));
    await refreshInbox();
  };

  const setDraft = (offerId: string, text: string) => setDrafts((prev) => ({ ...prev, [offerId]: text }));

  /** 구직자 질문 / 구인자 답변 전송 */
  const sendMessage = async (offer: PositionOfferWithRelations) => {
    if (!user) return;
    const kind = isEmployer ? "answer" : "question";
    const text = (drafts[offer.id] || "").trim();

    if (!text) {
      setActionMessage(errorMessage(kind === "question" ? "질문 내용을 입력해주세요." : "답변 내용을 입력해주세요."));
      return;
    }

    const result = await sendOfferMessage(offer, user.id, text, kind);
    if (!result.ok) {
      setActionMessage(errorMessage(result.error));
      return;
    }

    setInbox((prev) => ({
      offers: prev.offers.map((item) => (item.id === offer.id ? { ...item, status: kind === "question" ? "question" : "answered" } : item)),
      messagesByOffer: { ...prev.messagesByOffer, [offer.id]: [...(prev.messagesByOffer[offer.id] || []), result.data] },
    }));
    setDraft(offer.id, "");
    setActionMessage(null);
    toast.show(kind === "question" ? "질문을 보냈습니다." : "답변을 보냈습니다.");
    await refreshInbox();
  };

  return {
    user,
    profile,
    isEmployer,
    loading: sessionLoading || dataLoading,
    myJobs,
    applications,
    offers: inbox.offers,
    messagesByOffer: inbox.messagesByOffer,
    drafts,
    setDraft,
    actionMessage,
    toastMessage: toast.message,
    offersOpen,
    openOffers: () => setOffersOpen(true),
    closeOffers: () => {
      setOffersOpen(false);
      setSelectedOfferId(null);
    },
    selectedOffer,
    selectedContact: contactResumeId ? (contacts[contactResumeId] ?? null) : null,
    selectOffer: (offerId: string) => setSelectedOfferId(offerId),
    closeOfferDetail: () => setSelectedOfferId(null),
    logout,
    removeJob,
    respond,
    sendMessage,
  };
}

export type MyPageState = ReturnType<typeof useMyPage>;
