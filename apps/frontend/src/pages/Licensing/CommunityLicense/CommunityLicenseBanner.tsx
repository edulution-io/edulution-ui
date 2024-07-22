import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import CircleLoader from '@/components/ui/CircleLoader';
import useUserStore from '@/store/UserStore/UserStore';
import useUsersLicenseStore from '@/pages/Licensing/CommunityLicense/useUsersLicenseStore';

const CommunityLicenseBanner = () => {
  const { t } = useTranslation();
  const user = useUserStore();
  const { checkForActiveUserLicenses, isLoading, showBanner } = useUsersLicenseStore();

  useEffect(() => {
    void checkForActiveUserLicenses();
  }, []);

  if (!showBanner) {
    return null;
  }

  if (!user.isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <CircleLoader />;
  }

  return (
    <div className="mx-40 rounded-xl bg-ciLightRed p-2 text-black md:right-[--sidebar-width]">
      <h4 className="text-ciRed">{t('licensing.communityLicenseDialog.title')}</h4>
      <p>{t('licensing.communityLicenseDialog.description')}</p>
    </div>
  );
};

export default CommunityLicenseBanner;
