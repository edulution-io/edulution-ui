import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import useAppConfigsStore from '@/store/appConfigsStoreOLD';
import useUserStore from '@/store/userStoreOLD';
import createRouter from '@/routes/CreateRouter';

interface AppRouterProps {}

const AppRouter: React.FC<AppRouterProps> = () => {
  const auth = useAuth();
  const { appConfig, getAppConfigs } = useAppConfigsStore();
  const { isAuthenticated, setIsLoggedInInEduApi } = useUserStore();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          await getAppConfigs(true);
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

  return <RouterProvider router={createRouter(isAuthenticated, appConfig)} />;
};

export default AppRouter;
