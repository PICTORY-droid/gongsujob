"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getCurrentUser, onAuthUserChange } from "@/services/auth.service";
import { getProfile } from "@/services/profile.service";
import { isEmployer } from "@/domain/profile";
import { ROUTES } from "@/lib/constants";
import type { Profile } from "@/types/domain";

type Options = {
  /** true면 비로그인 시 로그인 화면으로 보낸다. (서버 Proxy가 1차 방어, 이건 2차 방어) */
  requireAuth?: boolean;
  /** true면 로그인/로그아웃 변화를 실시간 반영 (홈 화면) */
  subscribe?: boolean;
};

export type SessionState = {
  user: User | null;
  profile: Profile | null;
  isEmployer: boolean;
  loading: boolean;
};

/** 현재 로그인 사용자와 프로필. 페이지마다 반복되던 getUser + profiles 조회를 하나로 통합 */
export function useSession({ requireAuth = false, subscribe = false }: Options = {}): SessionState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // 프로필까지 받은 뒤 사용자·프로필·로딩을 한 번에 바꾼다.
    // (사용자만 먼저 넣으면 잠깐 '로그인한 구직자'로 보여 구인자 화면에 구직자용 버튼이 깜빡였다)
    const load = async (nextUser: User | null) => {
      const nextProfile = nextUser ? await getProfile(nextUser.id) : null;
      if (cancelled) return;
      setUser(nextUser);
      setProfile(nextProfile);
      setLoading(false);
    };

    getCurrentUser().then((current) => {
      if (!current && requireAuth) {
        window.location.href = ROUTES.login;
        return;
      }
      void load(current);
    });

    const unsubscribe = subscribe ? onAuthUserChange((next) => void load(next)) : undefined;

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [requireAuth, subscribe]);

  return { user, profile, isEmployer: isEmployer(profile?.user_type), loading };
}
