import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import cn from '@/lib/utils';
import CircleLoader from '@/components/ui/CircleLoader';
import useUserStore from '@/store/UserStore/UserStore';
import useUsersLicenseStore from '@/pages/Licensing/CommunityLicense/useUsersLicenseStore';

const CommunityLicenseBanner = () => {
  const user = useUserStore();
  const { checkForActiveUserLicenses, isLoading, showBanner } = useUsersLicenseStore();

  const { pathname } = useLocation();
  const isMainPage = pathname === '/';

  const { t } = useTranslation();

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
    <div
      className={cn(
        'flex items-center bg-ciLightRed px-4 py-2 text-black md:right-[--sidebar-width]',
        { 'rounded-xl': !isMainPage },
        { 'rounded-t-xl rounded-br-xl': isMainPage },
      )}
    >
      <h4 className="text-ciRed">{t('licensing.communityLicenseDialog.title')}</h4>
      <p className="mx-auto">{t('licensing.communityLicenseDialog.description')}</p>
    </div>
  );
};

export default CommunityLicenseBanner;
