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
import MobileAppUserDto from '@libs/mobileApp/types/mobileAppUserDto';
import UserDto from '@libs/user/types/user.dto';
import GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import parseLmnGeneralizedTimeAttribute from '@libs/mobileApp/utils/parseLmnGeneralizedTimeAttribute';
import normalizeLdapHomeDirectory from '@libs/filesharing/utils/normalizeLdapHomeDirectory';

const getMobileAppUserDto = ({
  usernameFallback,
  globalSettings,
  user = null,
  lmn = null,
}: {
  usernameFallback: string;
  user?: UserDto | null;
  lmn?: LmnUserInfo | null;
  globalSettings?: GlobalSettingsDto | null;
}): MobileAppUserDto => ({
  username: user?.username || usernameFallback,
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  role: user?.ldapGroups.roles[0] || '',
  email: user?.email || '',
  birthDate: lmn?.sophomorixBirthdate || '',
  expirationDate:
    parseLmnGeneralizedTimeAttribute(lmn?.sophomorixDeactivationDate) ||
    parseLmnGeneralizedTimeAttribute(lmn?.sophomorixTolerationDate),
  school: lmn?.sophomorixSchoolname || '',
  classes: Array.isArray(lmn?.schoolclasses)
    ? lmn.schoolclasses.map((userClass) => userClass.match(/([^-]+)$/)?.at(1) || '')
    : [],
  userProfilePicture: lmn?.thumbnailPhoto || '',
  institutionLogo: `edu-api/public/branding/logo`,
  deploymentTarget: globalSettings?.general.deploymentTarget || '',
  homeDirectory: normalizeLdapHomeDirectory(lmn?.homeDirectory || ''),
  organisationInfo: {
    name: globalSettings?.organisationInfo?.name,
    street: globalSettings?.organisationInfo?.street,
    city: globalSettings?.organisationInfo?.city,
    postalCode: globalSettings?.organisationInfo?.postalCode,
    website: globalSettings?.organisationInfo?.website,
  },
});

export default getMobileAppUserDto;
