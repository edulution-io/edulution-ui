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

import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';

function sortGroups<T>(data: (LmnApiSchoolClass | LmnApiProject)[]): T[] {
  return data.sort((a, b) => {
    const nameA = a.displayName || a.cn;
    const nameB = b.displayName || b.cn;

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    if (nameA === nameB) {
      if (a.cn < b.cn) {
        return -1;
      }
      if (a.cn > b.cn) {
        return 1;
      }
    }

    return 0;
  }) as T[];
}

export default sortGroups;
