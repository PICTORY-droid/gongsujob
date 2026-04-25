import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://dapi.kakao.com https://t1.daumcdn.net blob:;",
          },
        ],
      },
    ];
  },
};
export default nextConfig;