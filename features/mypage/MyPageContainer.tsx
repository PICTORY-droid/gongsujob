"use client";

import AppHeader from "@/components/layout/AppHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { LoadingScreen, Notice, Toast } from "@/components/ui/Feedback";
import { pageShell } from "@/components/ui/theme";
import { AccountSection, ApplicationsSection, MyJobsSection, PrivacyNotice, ProfileSummary, QuickMenu } from "@/features/mypage/MyPageSections";
import { OfferDetailModal, OffersListModal } from "@/features/mypage/OfferModals";
import { useMyPage } from "@/features/mypage/useMyPage";

/** 내정보 컨테이너: useMyPage(상태·동작) + 섹션 컴포넌트(표시) 조립 */
export default function MyPageContainer() {
  const page = useMyPage();

  if (page.loading) return <LoadingScreen />;

  return (
    <div style={pageShell()}>
      <Toast message={page.toastMessage} />
      <AppHeader />

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px" }}>
        <ProfileSummary user={page.user} profile={page.profile} employer={page.isEmployer} />
        <PrivacyNotice employer={page.isEmployer} />
        {page.actionMessage && <Notice message={page.actionMessage.text} tone={page.actionMessage.tone} />}
        <QuickMenu employer={page.isEmployer} onOpenOffers={page.openOffers} />

        {page.offersOpen && <OffersListModal page={page} />}
        {page.selectedOffer && <OfferDetailModal page={page} offer={page.selectedOffer} />}

        {page.isEmployer ? <MyJobsSection jobs={page.myJobs} onDelete={page.removeJob} /> : <ApplicationsSection applications={page.applications} />}
        <AccountSection onLogout={page.logout} />
      </div>
      <MobileBottomNav />
    </div>
  );
}
