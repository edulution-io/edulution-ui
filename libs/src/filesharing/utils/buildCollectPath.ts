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

import buildNewCollectFolderName from '@libs/filesharing/utils/buildNewCollectFolderName';
import LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import UserRoles from '@libs/user/constants/userRoles';
import FILE_PATHS from '../constants/file-paths';
import normalizeLdapHomeDirectory from './normalizeLdapHomeDirectory';

const buildCollectPath = (
  username: string,
  homePath: string,
  schoolClass: string,
  student: LmnUserInfo,
): CollectFileRequestDTO => {
  const newFolderName = buildNewCollectFolderName(schoolClass);

  const studentName = student.examMode ? `${student.cn}-exam` : student.cn;

  const studentOriginPath = student.examMode
    ? `/${UserRoles.EXAM_USER}/${studentName}`
    : normalizeLdapHomeDirectory(student?.homeDirectory);

  const destinationPath = `${homePath}/${FILE_PATHS.TRANSFER}/${FILE_PATHS.COLLECTED}/${newFolderName}/${studentName}/${FILE_PATHS.COLLECT}/`;
  const originPath = `${studentOriginPath}/${FILE_PATHS.TRANSFER}/${username}/${FILE_PATHS.COLLECT}/`;

  return {
    destinationPath,
    originPath,
    userName: studentName,
    newFolderName,
  };
};

export default buildCollectPath;
