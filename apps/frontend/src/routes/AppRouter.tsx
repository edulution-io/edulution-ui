import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import createRouter from '@/routes/CreateRouter';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useUserStore from '@/store/UserStore/UserStore';
import cleanAllStores from '@/store/utilis/cleanAllStores';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const AppRouter: React.FC = () => {
  const auth = useAuth();
  const { appConfigs, getAppConfigs } = useAppConfigsStore();
  const { isAuthenticated, logout } = useUserStore();
  const { t } = useTranslation();
  const [tokenIsExpiring, setTokenIsExpiring] = useState(false);

  const handleLogout = async () => {
    await auth.removeUser();
    await logout();
    cleanAllStores();
    setTokenIsExpiring(false);
  };

  useEffect(() => {
    const handleGetAppConfigs = async () => {
      const isApiResponding = await getAppConfigs();
      if (!isApiResponding) {
        void handleLogout();
      }
    };

    if (isAuthenticated) {
      void handleGetAppConfigs();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated || auth.isAuthenticated) {
      const handleTokenExpired = () => {
        if (!tokenIsExpiring) {
          setTokenIsExpiring(true);
          toast.error(t('auth.errors.SessionExpiring'));
        }
        if (auth.user?.expired) {
          void handleLogout();
          toast.error(t('auth.errors.TokenExpired'));
        }
      };

      auth.events.addAccessTokenExpiring(handleTokenExpired);

      return () => {
        auth.events.removeAccessTokenExpiring(handleTokenExpired);
      };
    }
    return () => {};
  }, [auth.events, auth.isAuthenticated]);

  return <RouterProvider router={createRouter(isAuthenticated, appConfigs)} />;
};

export default AppRouter;
