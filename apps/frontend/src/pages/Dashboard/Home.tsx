import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';

import useIsMobileView from '@/hooks/useIsMobileView';
import Feed from '@/pages/Dashboard/Feed/Feed';
import MobileFileAccessCard from './MobileFileAccess/MobileFileAccessCard';
import AccountInformation from './AccountInformation';
import Quota from './Quota';
import Groups from './Groups';
import useLmnApiStore from '@/store/lmnApiStore';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const isMobileView = useIsMobileView();
  const auth = useAuth();
  const { user, lmnApiToken, getOwnUser } = useLmnApiStore();

  useEffect(() => {
    if (lmnApiToken && !user) {
      void getOwnUser();
    }
  }, [lmnApiToken, user]);

  return (
    <>
      <div>
        {isMobileView ? (
          <h2>
            {t('heading', {
              givenName: auth?.user?.profile?.given_name ?? '',
              familyName: auth?.user?.profile?.family_name ?? '',
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
