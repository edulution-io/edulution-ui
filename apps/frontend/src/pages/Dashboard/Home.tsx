import React from 'react';
import { useTranslation } from 'react-i18next';
import useIsMobileView from '@/hooks/useIsMobileView';
import Feed from '@/pages/Dashboard/Feed/Feed';
import useNotifications from '@/pages/Dashboard/Feed/components/useNotifications';
import useUserStore from '@/store/UserStore/UserStore';
import MobileFileAccessCard from './MobileFileAccess/MobileFileAccessCard';
import AccountInformation from './AccountInformation';
import Quota from './Quota';
import Groups from './Groups';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const isMobileView = useIsMobileView();
  const { user } = useUserStore();

  useNotifications();

  return (
    <>
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

      <div className="my-10 md:my-20">
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
                <Quota />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <Feed />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
