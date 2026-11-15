import type { Metadata } from "next";
import ManageContainer from "@/features/manage/ManageContainer";

export const metadata: Metadata = {
  title: "현장관리 | 현장공수잡",
  robots: { index: false },
};

export default function ManagePage() {
  return <ManageContainer />;
}
