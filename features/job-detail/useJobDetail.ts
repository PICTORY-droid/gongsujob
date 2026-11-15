"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { getJob } from "@/services/job.service";
import { applyToJob, hasApplied } from "@/services/application.service";
import { buildStaticMapUrl, fetchGeocode, fetchWeather } from "@/services/location.service";
import type { GeoPoint, Job, WeatherSummary } from "@/types/domain";

export function getJobAddress(job: Pick<Job, "detail_address" | "region"> | null): string {
  return job?.detail_address || job?.region || "";
}

/** 공고 상세: 공고·지원 여부·현장 날씨·지도 좌표를 불러오고 지원 동작을 제공 */
export function useJobDetail(jobId: string) {
  const { user, isEmployer } = useSession({ requireAuth: true });

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [mapPoint, setMapPoint] = useState<GeoPoint | null>(null);

  useEffect(() => {
    if (!user || !jobId) return;
    let cancelled = false;

    const load = async () => {
      const found = await getJob(jobId);
      if (cancelled) return;
      setJob(found);
      setLoading(false);

      setApplied(await hasApplied(jobId, user.id));

      const address = getJobAddress(found);
      if (!address) return;

      setWeatherLoading(true);
      const [weatherResult, point] = await Promise.all([fetchWeather(address), fetchGeocode(address)]);
      if (cancelled) return;
      setWeather(weatherResult);
      setWeatherLoading(false);
      setMapPoint(point);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [jobId, user]);

  const apply = async () => {
    if (applied || !user) return;
    setApplying(true);
    const result = await applyToJob(jobId, user.id);
    if (result.ok) {
      setApplied(true);
      setMessage("지원 완료!");
    } else {
      setMessage(result.error);
    }
    setApplying(false);
  };

  return {
    job,
    loading,
    isEmployer,
    applied,
    applying,
    message,
    apply,
    weather,
    weatherLoading,
    mapPoint,
    staticMapUrl: mapPoint ? buildStaticMapUrl(mapPoint) : null,
  };
}
