import React, { useEffect, lazy, Suspense } from 'react';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const BulletinBoardPage = lazy(() => import('@/pages/BulletinBoard/BulletinBoardPage'));
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'));

const HomePage: React.FC = () => {
  const { bulletinsByCategories, getBulletinsByCategories, isLoading } = useBulletinBoardStore();

  useEffect(() => {
    void getBulletinsByCategories();
  }, []);

  if (isLoading) {
    return <LoadingIndicator isOpen />;
  }

  return (
    <Suspense fallback={<LoadingIndicator isOpen />}>
      {bulletinsByCategories && Object.keys(bulletinsByCategories).length ? <BulletinBoardPage /> : <DashboardPage />}
    </Suspense>
  );
};

export default HomePage;
