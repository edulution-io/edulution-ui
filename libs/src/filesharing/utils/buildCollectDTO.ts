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
import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import WebdavShareDto from '../types/webdavShareDto';

const buildCollectDTO = (
  students: LmnUserInfo[] | null,
  currentUser: LmnUserInfo | null,
  currentGroupName: string,
  homePath: string,
  webdavShares: WebdavShareDto[],
): CollectFileRequestDTO[] | undefined => {
  if (!students || !currentUser) return undefined;

  const isEduFileProxy = webdavShares[0]?.type === WEBDAV_SHARE_TYPE.EDU_FILE_PROXY;

  return students.map((student) => {
    const baseDto = buildCollectPath(currentUser.cn, homePath, currentGroupName, student);

    if (!isEduFileProxy) return baseDto;

    return {
      ...baseDto,
      originPath: `${student.school}/${baseDto.originPath}`,
      destinationPath: `${student.school}/${baseDto.destinationPath}`,
    };
  });
};

export default buildCollectDTO;
