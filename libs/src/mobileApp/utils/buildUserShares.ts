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

import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import MobileUserFileShare from '@libs/mobileApp/types/mobileUserFileShare';
import normalizeSharePath from '@libs/filesharing/utils/normalizeSharePath';
import resolveSharePath from '@libs/mobileApp/utils/resolveSharePath';

const buildUserShares = (shares: WebdavShareDto[] | undefined, lmnInfo: LmnUserInfo) => {
  if (!shares) return [];

  return shares
    .map((share) => {
      const resolvedPath = resolveSharePath(share, lmnInfo);
      const finalPath = normalizeSharePath(resolvedPath);

      return {
        type: share.type,
        path: finalPath,
        displayName: `${lmnInfo.name} ${share.displayName}`,
        webdavShareId: share.webdavShareId,
      };
    })
    .filter((share): share is MobileUserFileShare => share !== null);
};

export default buildUserShares;
