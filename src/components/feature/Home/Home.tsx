import React from 'react';
import { useTranslation } from 'react-i18next';
import MyFavourites from './MyFavourites';
import MobileDataAccess from './MobileDataAccess';
import AccountInformation from './AccountInformation';
import Quota from './Quota';
import Groups from './Groups';

const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      {/* Content Area */}

      {/* Main Content */}
      <div>
        <h2 className="">{t('heading')}</h2>
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
                  <MobileDataAccess />
                </div>
              </div>
              <div>
                <Quota />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <MyFavourites />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
