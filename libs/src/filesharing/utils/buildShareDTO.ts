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

import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import buildSharePath from '@libs/filesharing/utils/buildSharePath';

const buildShareDTO = (
  userName: string | undefined,
  students: UserLmnInfo[] | null,
  fileName: DirectoryFileDTO,
): DuplicateFileRequestDto | undefined => {
  if (!students) return undefined;

  const destinationFilePaths = students
    .map((student) => buildSharePath(userName || '', fileName.filePath, student))
    .filter(Boolean);

  return {
    originFilePath: getPathWithoutWebdav(fileName.filePath),
    destinationFilePaths,
  };
};

export default buildShareDTO;
