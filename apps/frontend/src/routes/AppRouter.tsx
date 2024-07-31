import React, { useEffect, useState } from 'react';
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
  const { isAuthenticated } = useUserStore();
  const { t } = useTranslation();
  const [tokenIsExpiring, setTokenIsExpiring] = useState(false);
  const handleLogout = useLogout();

  useEffect(() => {
    const handleGetAppConfigs = async () => {
      const isApiResponding = await getAppConfigs();
      if (!isApiResponding) {
        void handleLogout();
        setTokenIsExpiring(false);
      }
    };

    if (isAuthenticated) {
      void handleGetAppConfigs();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const handleTokenExpired = () => {
        if (!tokenIsExpiring) {
          setTokenIsExpiring(true);
          toast.error(t('auth.errors.SessionExpiring'));
        }

        if (auth.user?.expired) {
          void handleLogout();
          setTokenIsExpiring(false);
          toast.error(t('auth.errors.TokenExpired'));
        }
      };

      auth.events.addAccessTokenExpiring(handleTokenExpired);

      return () => {
        auth.events.removeAccessTokenExpiring(handleTokenExpired);
      };
    }
    return () => {};
  }, [auth.events, isAuthenticated]);

  return <RouterProvider router={createRouter(isAuthenticated, appConfigs)} />;
};

export default AppRouter;
