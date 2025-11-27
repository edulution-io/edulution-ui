/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import MobileAppUserDto from '@libs/mobileApp/types/mobileAppUserDto';
import UserDto from '@libs/user/types/user.dto';
import GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import parseLmnGeneralizedTimeAttribute from '@libs/mobileApp/utils/parseLmnGeneralizedTimeAttribute';
import MobileUserFileShare from '@libs/mobileApp/types/mobileUserFileShare';

const getMobileAppUserDto = ({
  usernameFallback,
  globalSettings,
  user = null,
  lmn = null,
  userShares = [],
  totpCreatedAt = undefined,
}: {
  usernameFallback: string;
  user?: UserDto | null;
  lmn?: LmnUserInfo | null;
  globalSettings?: GlobalSettingsDto | null;
  userShares: MobileUserFileShare[];
  totpCreatedAt?: Date | undefined;
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
  organisationInfo: globalSettings?.organisationInfo || {},
  userShares,
  totpCreatedAt,
});

export default getMobileAppUserDto;
