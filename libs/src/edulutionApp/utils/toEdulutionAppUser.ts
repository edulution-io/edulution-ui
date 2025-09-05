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

import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import EdulutionAppUserDto from '@libs/edulutionApp/types/edulutionAppUser.dto';
import UserDto from '@libs/user/types/user.dto';

const toEdulutionAppUser = ({
  usernameFallback,
  user = null,
  lmn = null,
}: {
  usernameFallback: string;
  user?: UserDto | null;
  lmn?: LmnUserInfo | null;
}): EdulutionAppUserDto => ({
  username: user?.username || usernameFallback,
  role: user?.ldapGroups.roles[0] || '',
  email: user?.email || '',
  birthDate: lmn?.sophomorixBirthdate || '',
  expirationDate: lmn?.sophomorixDeactivationDate || lmn?.sophomorixTolerationDate || '',
  school: user?.ldapGroups.schools[0] || '',
  classes: Array.isArray(lmn?.schoolclasses)
    ? lmn.schoolclasses.map((userClass) => userClass.match(/([^-]+)$/)?.at(1) || '')
    : [],
  street: '',
  schoolName: '',
  postalCode: '',
  city: '',
  userProfilePicture: lmn?.thumbnailPhoto || '',
  institutionLogo: '',
});

export default toEdulutionAppUser;
