import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * GongsuSans: Pretendard(SIL OFL 1.1)를 웹용으로 줄인 수정본. 예약 글꼴 이름 조항에 따라 이름을 바꿨다(app/fonts/LICENSE.txt).
 * 용량을 줄이기 위해 KS X 1001 완성형 한글 2,350자 + 라틴·기호만 남긴 가변 폰트를 사용한다(약 450KB).
 * 목록에 없는 글자는 시스템 한글 폰트로 자연스럽게 대체된다.
 */
const gongsuSans = localFont({
  src: "./fonts/GongsuSans-KS.woff2",
  variable: "--font-gongsu-sans",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "현장공수잡 GongsuJob",
  description: "건설 현장 일용직 구인구직 — 공고 확인, 이력서 등록, 포지션 제안까지 한곳에서",
};

export const viewport: Viewport = {
  themeColor: "#203C7F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${gongsuSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
