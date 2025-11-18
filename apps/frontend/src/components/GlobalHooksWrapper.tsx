/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useCookies } from 'react-cookie';
import useSseStore from '@/store/useSseStore';
import isDev from '@libs/common/constants/isDev';
import ROOT_ROUTE from '@libs/common/constants/rootRoute';
import COOKIE_DESCRIPTORS from '@libs/common/constants/cookieDescriptors';
import useVersionChecker from '@/hooks/useVersionChecker';
import useUploadProgressToast from '@/hooks/useUploadProgressToast';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import EDULUTION_APP_AGENT_IDENTIFIER from '@libs/common/constants/edulutionAppAgentIdentifier';
import useInitialAppData from '@/hooks/useInitialAppData';
import useInitLmnApi from '@/hooks/useInitLmnApi';
import useUserStore from '../store/UserStore/useUserStore';
import useNotifications from '../hooks/useNotifications';
import useTokenEventListeners from '../hooks/useTokenEventListeners';

const GlobalHooksWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { isAuthenticated, eduApiToken, setEduApiToken } = useUserStore();
  const { eventSource, setEventSource } = useSseStore();
  const [, setCookie] = useCookies([COOKIE_DESCRIPTORS.AUTH_TOKEN]);
  const { setIsEdulutionApp } = usePlatformStore();

  useInitialAppData(isAuthenticated);

  useInitLmnApi();

  useUploadProgressToast();

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

  useTokenEventListeners();

  return children;
};

export default GlobalHooksWrapper;
