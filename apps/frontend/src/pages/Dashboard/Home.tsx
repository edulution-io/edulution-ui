import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ACCOUNT_INFORMATION_ID,
  DASHBOARD_HEADER_ID,
  GROUPS_ID,
  MOBILE_DASHBOARD_HEADER_ID,
  MOBILE_FILE_ACCESS_ID,
  NOTIFICATION_ID,
  QUOTA_CARD_ID,
} from '@libs/dashboard/constants/pageElementIds';
import { FOOTER_ID } from '@libs/common/constants/pageElementIds';
import useUserStore from '@/store/UserStore/UserStore';
import useIsMobileView from '@/hooks/useIsMobileView';
import useElementHeight from '@/hooks/useElementHeight';
import Feed from '@/pages/Dashboard/Feed/Feed';
import MobileFileAccessCard from './MobileFileAccess/MobileFileAccessCard';
import AccountInformation from './AccountInformation';
import QuotaCard from './QuotaCard';
import Groups from './Groups';

const Home: React.FC = () => {
  const { t } = useTranslation();

  const isMobileView = useIsMobileView();

  const { user } = useUserStore();

  const pageBarsHeight = useElementHeight([DASHBOARD_HEADER_ID, MOBILE_DASHBOARD_HEADER_ID, FOOTER_ID]);

  const column1 = (
    <div
      id={ACCOUNT_INFORMATION_ID}
      className="basis-1/4"
    >
      <AccountInformation />
    </div>
  );

  const column2 = (
    <div className="basis-1/2">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <div
            id={GROUPS_ID}
            className="flex-1"
          >
            <Groups />
          </div>
          <div
            id={MOBILE_FILE_ACCESS_ID}
            className="flex-1"
          >
            <MobileFileAccessCard />
          </div>
        </div>
        <div id={QUOTA_CARD_ID}>
          <QuotaCard />
        </div>
      </div>
    </div>
  );

  const column3 = (
    <div
      id={NOTIFICATION_ID}
      className="basis-1/4"
    >
      <Feed />
    </div>
  );

  return (
    <div className="md:ml-4">
      <div id={MOBILE_DASHBOARD_HEADER_ID}>
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
        <div className={`flex flex-col-reverse gap-8 md:flex-row md:max-h-[${pageBarsHeight}px]`}>
          {column1}
          {column2}
          {column3}
        </div>
      </div>
    </div>
  );
};

export default Home;
