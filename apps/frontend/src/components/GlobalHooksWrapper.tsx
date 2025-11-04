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
import ROOT_ROUTE from '@libs/common/constants/rootRoute';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import COOKIE_DESCRIPTORS from '@libs/common/constants/cookieDescriptors';
import useVersionChecker from '@/hooks/useVersionChecker';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useUploadProgressToast from '@/hooks/useUploadProgressToast';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import EDULUTION_APP_AGENT_IDENTIFIER from '@libs/common/constants/edulutionAppAgentIdentifier';
import useSentryStore from '@/store/useSentryStore';
import useAppConfigsStore from '../pages/Settings/AppConfig/useAppConfigsStore';
import useUserStore from '../store/UserStore/useUserStore';
import useLogout from '../hooks/useLogout';
import useNotifications from '../hooks/useNotifications';
import useTokenEventListeners from '../hooks/useTokenEventListeners';

const GlobalHooksWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { getAppConfigs, getPublicAppConfigs } = useAppConfigsStore();
  const { getGlobalSettings } = useGlobalSettingsApiStore();
  const { getIsEduApiHealthy } = useEduApiStore();
  const { isAuthenticated, eduApiToken, setEduApiToken, user, getWebdavKey } = useUserStore();
  const { lmnApiToken, setLmnApiToken } = useLmnApiStore();
  const { eventSource, setEventSource } = useSseStore();
  const [, setCookie] = useCookies([COOKIE_DESCRIPTORS.AUTH_TOKEN]);
  const { fetchWebdavShares } = useFileSharingStore();
  const fetchAndInitSentry = useSentryStore((s) => s.fetchAndInitSentry);
  const { setIsEdulutionApp } = usePlatformStore();

  const handleLogout = useLogout();

  useUploadProgressToast();

  useEffect(() => {
    void getPublicAppConfigs();
  }, []);

  useEffect(() => {
    const { userAgent } = navigator;
    const isEdulutionApp = userAgent.includes(EDULUTION_APP_AGENT_IDENTIFIER);
    setIsEdulutionApp(isEdulutionApp);
  }, []);

  useEffect(() => {
    if (auth.user?.access_token) {
      setEduApiToken(auth.user?.access_token);

      setCookie(COOKIE_DESCRIPTORS.AUTH_TOKEN, auth.user?.access_token, {
        path: ROOT_ROUTE,
        domain: window.location.hostname,
        secure: !isDev,
        sameSite: isDev ? 'lax' : 'none',
      });
    }
  }, [auth.user?.access_token]);

  useEffect(() => {
    if (eduApiToken) {
      if (!eventSource) {
        setEventSource();
      }
    }
  }, [eduApiToken]);

  useNotifications();

  useVersionChecker();

  useEffect(() => {
    const getInitialAppData = async () => {
      const isApiResponding = await getIsEduApiHealthy();
      if (isApiResponding) {
        void getGlobalSettings();
        void getAppConfigs();
        void fetchWebdavShares();
        void fetchAndInitSentry();

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
