"use client";

import { useCallback, useSyncExternalStore } from "react";
import { parseSavedJobIds, toggleSavedJobId } from "@/domain/job-list";

/**
 * 찜한 공고 (이 브라우저에만 저장).
 * 서버 테이블 없이 구직자가 "나중에 볼 공고"를 표시하는 가벼운 기능이라 localStorage를 쓴다.
 * - 저장소 접근이 막힌 환경(사생활 보호 모드 등)에서는 조용히 메모리로만 동작한다.
 * - 같은 기기의 다른 탭과도 storage 이벤트로 동기화된다.
 */

const STORAGE_KEY = "gongsujob:saved-jobs";
const EMPTY: readonly string[] = Object.freeze([]);

let cache: { raw: string | null; ids: readonly string[] } = { raw: null, ids: EMPTY };
let memoryFallback: string | null = null;
const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryFallback;
  }
}

function writeRaw(value: string) {
  memoryFallback = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* 저장 불가 환경: 메모리 값만 유지 */
  }
}

function getSnapshot(): readonly string[] {
  const raw = readRaw();
  if (raw !== cache.raw) cache = { raw, ids: parseSavedJobIds(raw) };
  return cache.ids;
}

function getServerSnapshot(): readonly string[] {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSavedJobs() {
  const savedIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((jobId: string) => {
    writeRaw(JSON.stringify(toggleSavedJobId(getSnapshot(), jobId)));
    listeners.forEach((listener) => listener());
  }, []);

  const isSaved = useCallback((jobId: string) => savedIds.includes(jobId), [savedIds]);

  return { savedIds, isSaved, toggle };
}
