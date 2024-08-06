import React, { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import createRouter from '@/routes/CreateRouter';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useUserStore from '@/store/UserStore/UserStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import useLogout from '@/hooks/useLogout';

const AppRouter: React.FC = () => {
  const auth = useAuth();
  const { appConfigs, getAppConfigs } = useAppConfigsStore();
  const { isAuthenticated, setEduApiToken } = useUserStore();
  const { t } = useTranslation();
  const handleLogout = useLogout();

  const handleTokenExpired = useRef(() => {
    if (auth.user?.expired) {
      void handleLogout();
      toast.error(t('auth.errors.TokenExpired'));
    }
  });

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
    if (auth.user?.access_token) {
      setEduApiToken(auth.user?.access_token);
    }
  }, [auth.user?.access_token]);

  useEffect(() => {
    if (isAuthenticated) {
      auth.events.addSilentRenewError(handleLogout);
      auth.events.addAccessTokenExpiring(handleTokenExpired.current);

      return () => {
        auth.events.removeSilentRenewError(handleLogout);
        auth.events.removeAccessTokenExpiring(handleTokenExpired.current);
      };
    }
    return () => {};
  }, [auth.events, isAuthenticated]);

  return <RouterProvider router={createRouter(isAuthenticated, appConfigs)} />;
};

export default AppRouter;
