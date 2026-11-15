import { afterEach } from "vitest";

// 컴포넌트 테스트(jsdom)에서만 DOM 정리
afterEach(async () => {
  if (typeof document !== "undefined") {
    const { cleanup } = await import("@testing-library/react");
    cleanup();
  }
});
