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

import { create } from 'zustand';
import Keycloak from 'keycloak-js';
import EDU_BASE_URL from '@libs/common/constants/eduApiBaseUrl';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';

type AuthStore = {
  keycloak: Keycloak | null;
  initKeycloak: () => Promise<void>;
  logoutKeycloak: () => Promise<void>;
};

const useAuthStore = create<AuthStore>((set, get) => ({
  keycloak: null,

  initKeycloak: async () => {
    if (get().keycloak) return;

    if (typeof window === 'undefined') return;

    const kc = new Keycloak({
      url: `${EDU_BASE_URL}/${AUTH_PATHS.AUTH_ENDPOINT}`,
      realm: 'edulution',
      clientId: 'edu-ui',
    });

    await kc.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });

    set({ keycloak: kc });
  },

  logoutKeycloak: async () => {
    const kc = get().keycloak;
    if (!kc) throw new Error('Keycloak nicht initialisiert');
    await kc.logout();
  },
}));

export default useAuthStore;
