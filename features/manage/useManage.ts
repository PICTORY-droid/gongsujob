"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { listConfirmedWorkers } from "@/services/workforce.service";
import { buildLedger, groupWorkersBySite, safeFileName, type WorkerGroup } from "@/domain/workforce";
import { clampDays } from "@/domain/net-pay";
import type { ConfirmedWorker } from "@/types/domain";

/** 현장관리 화면 상태: 확정 인력 조회 · 근무일수 입력 · 노임대장 내려받기 */
export function useManage() {
  const { user, isEmployer, loading: sessionLoading } = useSession({ requireAuth: true });
  const [result, setResult] = useState<{ userId: string; workers: ConfirmedWorker[] | null } | null>(null);
  const [daysByWorker, setDaysByWorker] = useState<Record<string, number>>({});
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isEmployer) return;
    let stale = false;
    listConfirmedWorkers(user.id).then((workers) => {
      if (!stale) setResult({ userId: user.id, workers });
    });
    return () => {
      stale = true;
    };
  }, [user, isEmployer]);

  const workers = useMemo(() => (result?.userId === user?.id ? result?.workers : undefined), [result, user]);
  const groups = useMemo(() => groupWorkersBySite(workers ?? []), [workers]);

  const changeDays = (workerId: string, days: number) => setDaysByWorker((prev) => ({ ...prev, [workerId]: clampDays(days) }));

  const downloadLedger = async (group: WorkerGroup) => {
    setDownloading(group.key);
    setError(null);
    try {
      const { downloadWageLedger } = await import("@/lib/export/wage-ledger-xlsx");
      await downloadWageLedger({
        ledger: buildLedger(group.workers, daysByWorker),
        siteTitle: group.title,
        site: group.site,
        period: `${group.startDate} ~`,
        fileName: `노임대장_${safeFileName(group.title)}_${group.startDate}`,
      });
    } catch {
      setError("엑셀 파일을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDownloading(null);
    }
  };

  return {
    loading: sessionLoading || (isEmployer && workers === undefined),
    isEmployer,
    loadFailed: workers === null,
    groups,
    daysByWorker,
    changeDays,
    downloadLedger,
    downloading,
    error,
  };
}
