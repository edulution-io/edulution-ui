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

import { useAuth } from 'react-oidc-context';
import GroupRoles from '@libs/groups/types/group-roles.enum';

const useLdapGroups = () => {
  const auth = useAuth();
  const ldapGroups = (auth.user?.profile.ldapGroups as string[]) || [];
  const isAuthReady = !!auth.user;
  const isSuperAdmin = ldapGroups.includes(GroupRoles.SUPER_ADMIN);

  return { isSuperAdmin, ldapGroups, isAuthReady };
};

export default useLdapGroups;
