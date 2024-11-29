import React from 'react';
import { DashboardPage } from '@/pages/Dashboard';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import { findAppConfigByName } from '@/utils/common';
import APPS from '@libs/appconfig/constants/apps';
import BulletinBoardPage from '@/pages/BulletinBoard/BulletinBoardPage';

const HomePage: React.FC = () => {
  const { appConfigs } = useAppConfigsStore();
  const bulletinBoardConfig = findAppConfigByName(appConfigs, APPS.BULLETIN_BOARD);
  console.log(`bulletinBoardConfig ${JSON.stringify(bulletinBoardConfig, null, 2)}`);

  if (bulletinBoardConfig) return <BulletinBoardPage />;

  return <DashboardPage />;
};

export default HomePage;
