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
import AppRouter from '@/router/AppRouter';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import { CookiesProvider } from 'react-cookie';
import i18n from '@/i18n';
import eduApi from '@/api/eduApi';
import { HelmetProvider } from 'react-helmet-async';
import useUserStore from '@/store/UserStore/useUserStore';
import Toaster from '@/components/ui/Toaster';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import AUTH_PATHS from '@libs/auth/constants/auth-paths';
import { TooltipProvider } from '@/components/ui/Tooltip';
import useThemeColors from '@/hooks/useThemeColors';
import EDULUTION_APP_AGENT_IDENTIFIER from '@libs/common/constants/edulutionAppAgentIdentifier';
import GlobalHooksWrapper from './components/GlobalHooksWrapper';
import LazyErrorBoundary from './components/LazyErrorBoundary';
import usePlatformStore from './store/EduApiStore/usePlatformStore';
import SilentLoginWrapper from './components/SilentLoginWrapper';

const App = () => {
  const { eduApiToken } = useUserStore();
  const { user } = useUserStore();
  const { setIsEdulutionApp } = usePlatformStore();

  useThemeColors();

  eduApi.defaults.headers.Authorization = `Bearer ${eduApiToken}`;

  useEffect(() => {
    if (user?.language && user.language !== 'system') {
      i18n.changeLanguage(user.language).catch((e) => console.error('Change Language Error', e));
    } else {
      i18n.changeLanguage(navigator.language).catch((e) => console.error('Reset to System Language Error', e));
    }
  }, [user?.language]);

  useEffect(() => {
    const { userAgent } = navigator;
    const isEdulutionApp = userAgent.includes(EDULUTION_APP_AGENT_IDENTIFIER);
    setIsEdulutionApp(isEdulutionApp);
  }, []);

  const oidcConfig: AuthProviderProps = {
    authority: `${EDU_API_URL}/${AUTH_PATHS.AUTH_ENDPOINT}`,
    client_id: ' ',
    client_secret: ' ',
    redirect_uri: '',
    loadUserInfo: true,
    automaticSilentRenew: false,
    userStore: new WebStorageStateStore({
      store: localStorage,
    }),
  };

  return (
    <LazyErrorBoundary>
      <AuthProvider {...oidcConfig}>
        <CookiesProvider>
          <SilentLoginWrapper>
            <GlobalHooksWrapper>
              <HelmetProvider>
                <TooltipProvider>
                  <AppRouter />
                </TooltipProvider>
              </HelmetProvider>
              <Toaster />
            </GlobalHooksWrapper>
          </SilentLoginWrapper>
        </CookiesProvider>
      </AuthProvider>
    </LazyErrorBoundary>
  );
};

export default App;
