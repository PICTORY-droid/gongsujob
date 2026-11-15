"use client";

import { useEffect, useState } from "react";
import { listActiveJobs } from "@/services/job.service";
import { listPublicResumes } from "@/services/resume.service";
import type { Job, PublicResume } from "@/types/domain";

/**
 * 직종(category)별 공고·인재 목록 조회 훅.
 * 응답 경합 방지: 직종을 빠르게 바꿀 때 늦게 도착한 이전 응답이 화면을 덮지 않도록 무시한다.
 * 조회 실패 시에는 기존 목록을 유지한다(기존 동작과 동일).
 */
function useCategoryList<T>(fetcher: (category: string) => Promise<T[] | null>, category: string, enabled: boolean) {
  const [state, setState] = useState<{ key: string | null; items: T[] }>({ key: null, items: [] });

  useEffect(() => {
    if (!enabled) return;
    let stale = false;
    fetcher(category).then((data) => {
      if (stale) return;
      setState((prev) => ({ key: category, items: data ?? prev.items }));
    });
    return () => {
      stale = true;
    };
  }, [fetcher, category, enabled]);

  return { items: state.items, loading: state.key !== category };
}

const fetchAllJobs = (category: string) => listActiveJobs({ category });
const fetchHomeJobs = (category: string) => listActiveJobs({ category, limit: 6 });

export function useJobList(category: string, { preview = false, enabled = true } = {}) {
  const { items, loading } = useCategoryList<Job>(preview ? fetchHomeJobs : fetchAllJobs, category, enabled);
  return { jobs: items, loading };
}

export function useResumeList(category: string, { enabled = true } = {}) {
  const { items, loading } = useCategoryList<PublicResume>(listPublicResumes, category, enabled);
  return { resumes: items, loading };
}
