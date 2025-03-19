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
import i18n from '@/i18n';
import eduApi, { eduUrl } from '@/api/eduApi';
import useLmnApiStore from '@/store/useLmnApiStore';
import lmnApi from '@/api/lmnApi';
import useUserStore from '@/store/UserStore/UserStore';
import Toaster from '@/components/ui/Toaster';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
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
    authority: `${eduUrl}auth`,
    client_id: ' ',
    client_secret: ' ',
    redirect_uri: '',
    loadUserInfo: true,
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({
      store: localStorage,
    }),
  };

  return (
    <AuthProvider {...oidcConfig}>
      <GlobalHooksWrapper>
        <AppRouter />
        <Toaster />
      </GlobalHooksWrapper>
    </AuthProvider>
  );
};

export default App;
