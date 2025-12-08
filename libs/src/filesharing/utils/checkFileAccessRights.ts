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
