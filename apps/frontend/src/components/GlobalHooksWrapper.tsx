/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import useAppConfigsStore from '../pages/Settings/AppConfig/appConfigsStore';
import useUserStore from '../store/UserStore/UserStore';
import useLogout from '../hooks/useLogout';
import useNotifications from '../hooks/useNotifications';

const GlobalHooksWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { getAppConfigs } = useAppConfigsStore();
  const { isAuthenticated, setEduApiToken } = useUserStore();
  const { t } = useTranslation();
  const handleLogout = useLogout();

  useNotifications();

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

  return children;
};

export default GlobalHooksWrapper;
