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

import JwtUser from '@libs/user/types/jwt/jwtUser';
import FILE_ACCESS_RESULT from '@libs/filesharing/constants/fileAccessResult';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { FileAccessResultType } from '@libs/filesharing/types/fileAccessResultType';
import AttendeeDto from '@libs/user/types/attendee.dto';

const checkFileAccessRights = (
  invitedAttendees: AttendeeDto[] = [],
  invitedGroups: MultipleSelectorGroup[] = [],
  jwtUser?: JwtUser | null,
): FileAccessResultType => {
  if (invitedAttendees.length === 0 && invitedGroups.length === 0) {
    return FILE_ACCESS_RESULT.PUBLIC;
  }

  if (!jwtUser) return FILE_ACCESS_RESULT.NO_TOKEN;

  const userMatch = invitedAttendees.some((user) => user.username === jwtUser.preferred_username);
  if (userMatch) return FILE_ACCESS_RESULT.USER_MATCH;

  const groupSet = new Set(jwtUser.ldapGroups ?? []);
  const groupMatch = invitedGroups.some((g) => groupSet.has(g.path));

  return groupMatch ? FILE_ACCESS_RESULT.GROUP_MATCH : FILE_ACCESS_RESULT.DENIED;
};

export default checkFileAccessRights;
