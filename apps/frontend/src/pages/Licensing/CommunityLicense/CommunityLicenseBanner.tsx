import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import CircleLoader from '@/components/ui/CircleLoader';
import useUserStore from '@/store/UserStore/UserStore';
import useCommunityLicenseBannerStore from '@/pages/Licensing/CommunityLicense/Banner/useCommunityLicenseBannerStore';

const CommunityLicenseBanner = () => {
  const { t } = useTranslation();
  const user = useUserStore();
  const { checkForActiveUserLicenses, isOpen, isLoading } = useCommunityLicenseBannerStore();

  useEffect(() => {
    void checkForActiveUserLicenses();
  }, []);

  if (!isOpen) {
    return null;
  }

  if (!user.isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <CircleLoader />;
  }

  return (
    <div className="rounded-xl bg-ciLightRed p-4 text-black md:right-[--sidebar-width]">
      <h4 className="text-ciRed">{t('licensing.communityLicenseDialog.title')}</h4>
      <p>{t('licensing.communityLicenseDialog.description')}</p>
    </div>
  );
};

export default CommunityLicenseBanner;
