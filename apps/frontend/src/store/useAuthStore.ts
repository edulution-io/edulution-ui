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
  keycloak: Keycloak;
};

const useAuthStore = create<AuthStore>(() => ({
  keycloak: new Keycloak({
    url: `${EDU_BASE_URL}/${AUTH_PATHS.AUTH_ENDPOINT}`,
    realm: 'edulution',
    clientId: 'edu-ui',
  }),
}));

export default useAuthStore;
