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
