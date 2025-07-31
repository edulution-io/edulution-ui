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
import UserRoles from '@libs/user/constants/userRoles';
import getStringFromArray from '@libs/common/utils/getStringFromArray';
import FILE_PATHS from '../constants/file-paths';

const buildSharePath = (userName: string, fileName: string, student: LmnUserInfo): string => {
  const file = fileName.split('/').pop();

  const studentPath = student.examMode
    ? `/${UserRoles.EXAM_USER}/${student.cn}-exam`
    : getStringFromArray(student?.sophomorixIntrinsic2);

  return `${studentPath}/${FILE_PATHS.TRANSFER}/${userName}/${file}`;
};

export default buildSharePath;
