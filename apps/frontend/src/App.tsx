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
import AppRouter from '@/router/AppRouter';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import { CookiesProvider } from 'react-cookie';
import i18n from '@/i18n';
import eduApi from '@/api/eduApi';
import useLmnApiStore from '@/store/useLmnApiStore';
import { HelmetProvider } from 'react-helmet-async';
import lmnApi from '@/api/lmnApi';
import useUserStore from '@/store/UserStore/UserStore';
import Toaster from '@/components/ui/Toaster';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import GlobalHooksWrapper from './components/GlobalHooksWrapper';

const App = () => {
  const { eduApiToken } = useUserStore();
  const { lmnApiToken } = useLmnApiStore();
  const { user } = useUserStore();

  lmnApi.defaults.headers.common[HTTP_HEADERS.XApiKey] = lmnApiToken;
  eduApi.defaults.headers.Authorization = `Bearer ${eduApiToken}`;

  useEffect(() => {
    if (user?.language && user.language !== 'system') {
      i18n.changeLanguage(user.language).catch((e) => console.error('Change Language Error', e));
    } else {
      i18n.changeLanguage(navigator.language).catch((e) => console.error('Reset to System Language Error', e));
    }
  }, [user?.language]);

  const oidcConfig: AuthProviderProps = {
    authority: `${EDU_API_URL}/auth`,
    client_id: ' ',
    client_secret: ' ',
    redirect_uri: window.location.origin,
    silent_redirect_uri: `${window.location.origin}/authentication/silent_callback`,
    loadUserInfo: true,
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({
      store: localStorage,
    }),
    onSigninCallback: (_user) => window.history.replaceState({}, document.title, '/'),
  };

  return (
    <AuthProvider {...oidcConfig}>
      <CookiesProvider>
        <GlobalHooksWrapper>
          <HelmetProvider>
            <AppRouter />
          </HelmetProvider>
          <Toaster />
        </GlobalHooksWrapper>
      </CookiesProvider>
    </AuthProvider>
  );
};

export default App;
