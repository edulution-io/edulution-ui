import React from 'react';
import { useTranslation } from 'react-i18next';
import { GROUPS_ID, DASHBOARD_DESCRIPTION_ID } from '@libs/dashboard/constants/pageElementIds';
import useUserStore from '@/store/UserStore/UserStore';
import useIsMobileView from '@/hooks/useIsMobileView';
import Feed from '@/pages/Dashboard/Feed/Feed';
import MobileFileAccessCard from './MobileFileAccess/MobileFileAccessCard';
import AccountInformation from './AccountInformation';
import QuotaCard from './QuotaCard';
import Groups from './Groups';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  const isMobileView = useIsMobileView();

  const { user } = useUserStore();

  const column1 = (
    <div className="basis-1/4">
      <AccountInformation />
    </div>
  );

  const column2 = (
    <div className="flex basis-1/2 flex-col gap-8">
      <div className="flex flex-col justify-between gap-8 md:flex-row">
        <div
          id={GROUPS_ID}
          className="flex-1"
        >
          <Groups />
        </div>
        <div className="flex-1">
          <MobileFileAccessCard />
        </div>
      </div>
      <QuotaCard />
    </div>
  );

  const column3 = (
    <div className="basis-1/4">
      <Feed />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-thin md:mx-4">
      <div id={DASHBOARD_DESCRIPTION_ID}>
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
        <div className="flex flex-col-reverse gap-8 md:flex-row">
          {column1}
          {column2}
          {column3}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
