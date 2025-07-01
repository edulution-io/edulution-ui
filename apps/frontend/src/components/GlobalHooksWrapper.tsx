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

import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useCookies } from 'react-cookie';
import useLmnApiStore from '@/store/useLmnApiStore';
import type UserDto from '@libs/user/types/user.dto';
import useSseStore from '@/store/useSseStore';
import useEduApiStore from '@/store/EduApiStore/useEduApiStore';
import isDev from '@libs/common/constants/isDev';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import useAppConfigsStore from '../pages/Settings/AppConfig/appConfigsStore';
import useUserStore from '../store/UserStore/UserStore';
import useLogout from '../hooks/useLogout';
import useNotifications from '../hooks/useNotifications';
import useTokenEventListeners from '../hooks/useTokenEventListeners';

const GlobalHooksWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { getAppConfigs } = useAppConfigsStore();
  const { getGlobalSettings } = useGlobalSettingsApiStore();
  const { getIsEduApiHealthy } = useEduApiStore();
  const { isAuthenticated, eduApiToken, setEduApiToken, user, getWebdavKey } = useUserStore();
  const { lmnApiToken, setLmnApiToken } = useLmnApiStore();
  const { eventSource, setEventSource } = useSseStore();
  const [, setCookie] = useCookies(['authToken']);

  const handleLogout = useLogout();

  useEffect(() => {
    if (auth.user?.access_token) {
      setEduApiToken(auth.user?.access_token);

      setCookie('authToken', auth.user?.access_token, {
        path: DASHBOARD_ROUTE,
        domain: window.location.hostname,
        secure: !isDev,
        sameSite: isDev ? 'lax' : 'none',
      });
    }
  }, [auth.user?.access_token]);

  useEffect(() => {
    if (eduApiToken) {
      if (!eventSource) {
        setEventSource(eduApiToken);
      }
    }
  }, [eduApiToken]);

  useNotifications();

  useEffect(() => {
    const getInitialAppData = async () => {
      const isApiResponding = await getIsEduApiHealthy();
      if (isApiResponding) {
        void getGlobalSettings();
        void getAppConfigs();
        return;
      }
      void handleLogout();
    };

    if (isAuthenticated) {
      void getInitialAppData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleGetLmnApiKey = async (usr: UserDto) => {
      const webdavKey = await getWebdavKey();
      await setLmnApiToken(usr.username, webdavKey);
    };

    if (isAuthenticated && !lmnApiToken && user) {
      void handleGetLmnApiKey(user);
    }
  }, [isAuthenticated]);

  useTokenEventListeners();

  return children;
};

export default GlobalHooksWrapper;
