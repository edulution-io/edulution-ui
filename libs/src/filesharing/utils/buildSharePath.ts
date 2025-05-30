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
import UserRoles from '@libs/user/constants/userRoles';
import FILE_PATHS from '../constants/file-paths';

const buildSharePath = (userName: string, fileName: string, student: UserLmnInfo): string => {
  const file = fileName.split('/').pop();

  const studentPath = student.examMode ? `/${UserRoles.EXAM_USER}/${student.cn}-exam` : student.sophomorixIntrinsic2[0];

  return `${studentPath}/${FILE_PATHS.TRANSFER}/${userName}/${file}`;
};

export default buildSharePath;
