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

import LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import buildCollectPath from '@libs/filesharing/utils/buildCollectPath';

const buildCollectDTO = (
  students: LmnUserInfo[] | null,
  currentUser: LmnUserInfo | null,
  currentGroupName: string,
  homePath: string,
): CollectFileRequestDTO[] | undefined => {
  if (!students || !currentUser) return undefined;

  return students.map((student) => buildCollectPath(currentUser.cn, homePath, currentGroupName, student));
};

export default buildCollectDTO;
