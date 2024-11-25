import React from 'react';
import { useTranslation } from 'react-i18next';
import useIsMobileView from '@/hooks/useIsMobileView';
import useUserStore from '@/store/UserStore/UserStore';
import BullitinBoard from '@/pages/BullitinBoard/BullitinBoard';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const isMobileView = useIsMobileView();
  const { user } = useUserStore();

  return (
    <div className="flex w-full flex-col items-center justify-center md:pl-8">
      {isMobileView ? (
        <h2 className="mb-4 text-center">
          {t('heading', {
            givenName: user?.firstName || '-',
            familyName: user?.lastName || '-',
          })}
        </h2>
      ) : null}
      <h1 className="pb-6 text-center text-4xl font-bold text-white">Aktuelles</h1>
      <div className="flex h-[80vh] w-full rounded-xl bg-ciDarkGrey shadow-md">
        <div className="flex w-full max-w-full justify-center">
          <BullitinBoard />
        </div>
      </div>
    </div>
  );
};

export default Home;
