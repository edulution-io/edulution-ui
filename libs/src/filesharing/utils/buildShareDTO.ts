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
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import buildSharePath from '@libs/filesharing/utils/buildSharePath';
import WebdavShareDto from '../types/webdavShareDto';
import WEBDAV_SHARE_TYPE from '../constants/webdavShareType';

const buildShareDTO = (
  userName: string | undefined,
  students: LmnUserInfo[] | null,
  fileName: DirectoryFileDTO,
  webdavShares: WebdavShareDto[],
): DuplicateFileRequestDto | undefined => {
  if (!students) return undefined;

  const originFilePath = getPathWithoutWebdav(fileName.filePath);
  const isEduFileProxy = webdavShares[0].type === WEBDAV_SHARE_TYPE.EDU_FILE_PROXY;

  const destinationFilePaths = students
    .map((student) => {
      const path = buildSharePath(userName || '', fileName.filePath, student);
      return isEduFileProxy ? `${student.school}/${path}` : path;
    })
    .filter(Boolean);

  return { originFilePath, destinationFilePaths };
};

export default buildShareDTO;
