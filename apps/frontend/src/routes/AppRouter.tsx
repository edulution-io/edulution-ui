import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import createRouter from '@/routes/CreateRouter';
import useAppConfigsStore from '@/store/appConfigsStore';
import useUserStore from '@/store/UserStore/UserStore';

const AppRouter: React.FC = () => {
  const auth = useAuth();
  const { appConfigs, getAppConfigs } = useAppConfigsStore();
  const { isAuthenticated, setIsLoggedInInEduApi } = useUserStore();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          await getAppConfigs();
        } catch (e) {
          console.error('Error fetching data:', e);
        }
      };

      // eslint-disable-next-line no-void
      void fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      auth.events.addAccessTokenExpiring(() => {
        if (auth.user?.expired) {
          console.info('Session expired');
          auth.removeUser().catch((e) => console.error('Error fetching data:', e));
          setIsLoggedInInEduApi(false);
          sessionStorage.clear();
        }
      });
    }
  }, [auth.events, auth.isAuthenticated]);

  return <RouterProvider router={createRouter(isAuthenticated, appConfigs)} />;
};

export default AppRouter;
