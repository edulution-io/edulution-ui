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

import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useCookies } from 'react-cookie';
import useUserStore from '@/store/UserStore/useUserStore';
import ROOT_ROUTE from '@libs/common/constants/rootRoute';
import COOKIE_DESCRIPTORS from '@libs/common/constants/cookieDescriptors';
import isDev from '@libs/common/constants/isDev';
import EDULUTION_APP_AGENT_IDENTIFIER from '@libs/common/constants/edulutionAppAgentIdentifier';

const useSilentLogin = () => {
  const auth = useAuth();
  const { isAuthenticated, setEduApiToken } = useUserStore();
  const [, setCookie] = useCookies([COOKIE_DESCRIPTORS.AUTH_TOKEN]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [silentLoginAttempted, setSilentLoginAttempted] = useState(false);

  useEffect(() => {
    const attemptSilentLogin = async () => {
      if (isAuthenticated || silentLoginAttempted || auth.isAuthenticated) {
        setIsCheckingAuth(false);
        return;
      }

      setSilentLoginAttempted(true);

      const { userAgent } = navigator;
      const isEdulutionApp = userAgent.includes(EDULUTION_APP_AGENT_IDENTIFIER);

      if (!isEdulutionApp) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        console.info('🔍 Checking for existing session (Edulution App)...');

        const user = await auth.signinSilent();

        if (!user?.access_token) {
          console.info('ℹ️ No session found');
          setIsCheckingAuth(false);
          return;
        }

        console.info('✅ Found existing session');

        setEduApiToken(user.access_token);

        setCookie(COOKIE_DESCRIPTORS.AUTH_TOKEN, user.access_token, {
          path: ROOT_ROUTE,
          domain: window.location.hostname,
          secure: !isDev,
          sameSite: isDev ? 'lax' : 'none',
        });
      } catch (error: unknown) {
        console.info('ℹ️ No valid session found');
        if (error instanceof Error) {
          console.info('Error details:', error.message);
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    void attemptSilentLogin();
  }, [isAuthenticated, silentLoginAttempted, auth.isAuthenticated, auth, setEduApiToken, setCookie]);

  return { isCheckingAuth };
};

export default useSilentLogin;
