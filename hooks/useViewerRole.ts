"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getCurrentUser, onAuthUserChange } from "@/services/auth.service";
import { getProfile } from "@/services/profile.service";
import { isEmployer } from "@/domain/profile";
import { toViewerRole, type ViewerRole } from "@/lib/navigation";

/**
 * 메뉴 표시용 사용자 역할(비로그인·구직자·구인자).
 * 헤더·하단 탭처럼 여러 곳에서 동시에 쓰여도 조회는 한 번만 하도록 모듈 단위로 공유한다.
 * 권한 판단용이 아니다 — 실제 권한은 서버(Proxy·RLS)가 검사한다.
 */

type RoleState = { role: ViewerRole; ready: boolean };

const INITIAL: RoleState = { role: "guest", ready: false };
let state: RoleState = INITIAL;
let started = false;
const listeners = new Set<() => void>();

function setState(next: RoleState) {
  state = next;
  listeners.forEach((listener) => listener());
}

async function resolve() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  setState({ role: toViewerRole(Boolean(user), isEmployer(profile?.user_type)), ready: true });
}

function start() {
  if (started) return;
  started = true;
  void resolve();
  onAuthUserChange(() => void resolve());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useViewerRole(): RoleState {
  useEffect(start, []);
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}
