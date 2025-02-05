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

const buildUserPath = (role: string | null, schoolClass: string, username?: string | null): string => {
  switch (role) {
    case UserRoles.GLOBAL_ADMIN: {
      return 'global';
    }

    case UserRoles.SCHOOL_ADMIN: {
      return schoolClass || '';
    }

    case UserRoles.TEACHER: {
      return username ? `${role}s/${username}` : `${role}s`;
    }

    default: {
      return username ? `${role}s/${schoolClass}/${username}` : `${role}s/${schoolClass}`;
    }
  }
};

export default buildUserPath;
