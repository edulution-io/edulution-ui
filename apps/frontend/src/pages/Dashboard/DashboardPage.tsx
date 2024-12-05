import React from 'react';
import { useTranslation } from 'react-i18next';
import useIsMobileView from '@/hooks/useIsMobileView';
import Feed from '@/pages/Dashboard/Feed/Feed';
import useUserStore from '@/store/UserStore/UserStore';
import MobileFileAccessCard from './MobileFileAccess/MobileFileAccessCard';
import AccountInformation from './AccountInformation';
import QuotaCard from './QuotaCard';
import Groups from './Groups';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const isMobileView = useIsMobileView();
  const { user } = useUserStore();

  return (
    <div className="md:ml-4">
      <div>
        {isMobileView ? (
          <h2>
            {t('heading', {
              givenName: user?.firstName || '-',
              familyName: user?.lastName || '-',
            })}
          </h2>
        ) : null}
        <p className="mt-4">{t('content')}</p>
      </div>

      <div className="md:my-17 my-10">
        <div className="flex flex-col-reverse justify-between gap-8 md:flex-row">
          <div className="flex-1">
            <AccountInformation />
          </div>
          <div className="flex-2">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div className="flex-1">
                  <Groups />
                </div>
                <div className="flex-1">
                  <MobileFileAccessCard />
                </div>
              </div>
              <div>
                <QuotaCard />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <Feed />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
