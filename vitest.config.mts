import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      // 서버 전용 표식 패키지는 테스트 환경에서 빈 모듈로 대체
      "server-only": fileURLToPath(new URL("./tests/support/empty-module.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/support/setup.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["domain/**", "services/**", "lib/**", "app/api/**", "components/**", "features/**", "hooks/**"],
    },
  },
});
