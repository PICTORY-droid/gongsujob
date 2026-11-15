import type { Metadata } from "next";
import HomeContainer from "@/features/home/HomeContainer";

export const metadata: Metadata = {
  title: "현장공수잡 | 현장·기술·물류·식당·공장 일용직 구인구직",
  description: "건설 현장부터 물류·이사·식당·공장까지, 일용직 일자리와 인재를 분야별로 찾고 포지션 제안으로 연결하는 구인구직 서비스",
};

export default function HomePage() {
  return <HomeContainer />;
}
