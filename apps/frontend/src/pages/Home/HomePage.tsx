import React, { useEffect } from 'react';
import { DashboardPage } from '@/pages/Dashboard';
import BulletinBoardPage from '@/pages/BulletinBoard/BulletinBoardPage';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const HomePage: React.FC = () => {
  const { bulletinsByCategories, getBulletinsByCategories, isLoading } = useBulletinBoardStore();

  useEffect(() => {
    void getBulletinsByCategories();
  }, []);

  if (isLoading) {
    return <LoadingIndicator isOpen />;
  }

  if (bulletinsByCategories && Object.keys(bulletinsByCategories).length) return <BulletinBoardPage />;

  return <DashboardPage />;
};

export default HomePage;
