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

import useUserStore from '@/store/UserStore/useUserStore';
import getTokenPayload from '@libs/common/utils/getTokenPayload';
import getIsAdmin from '@libs/user/utils/getIsAdmin';

const useLdapGroups = () => {
  const { isAuthenticated, eduApiToken } = useUserStore();

  if (!isAuthenticated || !eduApiToken) {
    return {
      isSuperAdmin: false,
      ldapGroups: [],
      isAuthReady: false,
    };
  }

  const payload = getTokenPayload(eduApiToken);
  const ldapGroups = payload.ldapGroups ?? [];
  const isSuperAdmin = getIsAdmin(ldapGroups);

  return {
    isSuperAdmin,
    ldapGroups,
    isAuthReady: true,
  };
};

export default useLdapGroups;
