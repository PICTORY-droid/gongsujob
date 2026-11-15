import type { Metadata } from "next";
import HomeContainer from "@/features/home/HomeContainer";

export const metadata: Metadata = {
  title: "현장공수잡 | 건설 현장 일용직 구인구직",
  description: "건설 현장 일자리와 인재를 직종별로 확인하고, 포지션 제안으로 연결하는 구인구직 서비스",
};

export default function HomePage() {
  return <HomeContainer />;
}
