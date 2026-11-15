"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth.service";
import { getProfile, upsertProfile } from "@/services/profile.service";
import { formatPhoneInput } from "@/domain/format";
import { isProfileComplete } from "@/domain/profile";
import { validateOnboarding, type OnboardingValues } from "@/domain/validation";
import { ROUTES } from "@/lib/constants";
import type { UserType } from "@/types/domain";

const EMPTY: OnboardingValues = { userType: "", name: "", phone: "", address: "", region: "" };

/** 첫 설정(온보딩): 기존 프로필 불러오기 → 검증 → 저장 */
export function useOnboarding() {
  const [values, setValues] = useState<OnboardingValues>(EMPTY);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = ROUTES.login;
        return;
      }

      const profile = await getProfile(user.id);
      if (cancelled) return;

      if (isProfileComplete(profile)) {
        window.location.href = ROUTES.home;
        return;
      }

      setValues(
        profile
          ? {
              userType: profile.user_type || "",
              name: profile.name || "",
              phone: profile.phone || "",
              address: profile.address || "",
              region: profile.region || "",
            }
          : { ...EMPTY, name: user.user_metadata?.full_name || user.email?.split("@")[0] || "" },
      );
      setChecking(false);
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = <K extends keyof OnboardingValues>(key: K, value: OnboardingValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: key === "phone" ? formatPhoneInput(String(value)) : value }));

  const complete = async () => {
    const invalid = validateOnboarding(values);
    if (invalid) {
      setError(invalid);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = ROUTES.login;
        return;
      }

      const result = await upsertProfile({
        id: user.id,
        user_type: values.userType as UserType,
        name: values.name.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        region: values.region,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = ROUTES.home;
    } catch {
      setError("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return { values, setField, checking, saving, error, complete };
}
