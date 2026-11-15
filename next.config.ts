import type { NextConfig } from "next";

/**
 * 공통 보안 헤더
 * - 클릭재킹 방지(frame-ancestors), MIME 스니핑 방지, 리퍼러 최소화, 브라우저 권한 차단, HTTPS 강제
 * - 문의 페이지는 Tally 폼을 iframe으로 불러오므로 frame-src만 허용한다.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; frame-src 'self' https://tally.so; object-src 'none'; base-uri 'self'" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
