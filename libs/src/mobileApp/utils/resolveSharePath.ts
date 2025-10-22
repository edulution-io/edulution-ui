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

const resolveSharePath = (share: WebdavShareDto, lmnInfo: LmnUserInfo): string => {
  if (!share.pathVariables || share.pathVariables.length === 0) {
    return share.sharePath || share.displayName || '';
  }

  return share.pathVariables
    .map((pathVariable) =>
      pathVariable.label in lmnInfo
        ? (lmnInfo[pathVariable.label as keyof LmnUserInfo] as string)
        : pathVariable.value || '',
    )
    .filter((val) => val !== '')
    .join('/');
};

export default resolveSharePath;
