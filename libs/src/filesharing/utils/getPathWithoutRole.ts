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

import UserRoles from '@libs/user/constants/userRoles';

type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

const isEnumRole = (role: string): role is (typeof UserRoles)[keyof typeof UserRoles] => {
  const cleanedRole = role.at(role.length - 1) === 's' ? role.slice(0, -1) : role;
  return Object.values(UserRoles).includes(cleanedRole as UserRole);
};

const removeRoleFromPath = (path: string): string => {
  const pathSegments = path.split('/');

  const filteredSegments = pathSegments.map((segment) => {
    if (isEnumRole(segment)) {
      return '';
    }
    return segment;
  });

  const cleanedPath = filteredSegments.filter((segment) => segment).join('/');

  return cleanedPath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
};

export default removeRoleFromPath;
