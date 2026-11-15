import type { Metadata } from "next";
import ContractContainer from "@/features/manage/ContractContainer";

export const metadata: Metadata = {
  title: "근로계약서 | 현장공수잡",
  robots: { index: false },
};

type ContractPageProps = {
  params: Promise<{ offerId: string }>;
};

export default async function ContractPage({ params }: ContractPageProps) {
  const { offerId } = await params;
  return <ContractContainer offerId={offerId} />;
}
