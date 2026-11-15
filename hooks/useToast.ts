"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TOAST_DURATION_MS } from "@/lib/constants";

/** 일정 시간 뒤 사라지는 토스트 메시지. 언마운트 시 타이머 정리 */
export function useToast(duration = TOAST_DURATION_MS) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(text);
      timer.current = setTimeout(() => setMessage(""), duration);
    },
    [duration],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return { message, show };
}
