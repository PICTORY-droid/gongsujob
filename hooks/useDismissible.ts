"use client";

import { useCallback, useEffect, useState } from "react";

/** 열림/닫힘 상태 + 바깥(문서) 클릭 시 자동 닫힘. 드롭다운 3곳의 중복 로직을 통합 */
export function useDismissible(initial = false) {
  const [open, setOpen] = useState(initial);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  return { open, toggle, close };
}
