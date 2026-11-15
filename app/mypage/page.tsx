import type { Metadata } from "next";
import MyPageContainer from "@/features/mypage/MyPageContainer";

export const metadata: Metadata = {
  title: "내정보 | 현장공수잡",
};

export default function MyPage() {
  return <MyPageContainer />;
}
