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

import LmnApiProjectQuota from '@libs/lmnApi/types/lmnApiProjectQuota';

/**
 * Input example: [
 *     "agy:500:---:",
 *     "brs:---:---:",
 *     "linuxmuster-global:300:---:"
 *   ]
 */
const parseSophomorixQuota = (quotaString?: string[]): string => {
  if (!quotaString?.length || (quotaString.length === 1 && quotaString[0] === '---')) return '[]';

  const result = quotaString
    .map((entry) => {
      const [share, quotaStr, comment] = entry.split(':');
      const quota = quotaStr !== '---' ? parseInt(quotaStr, 10) : undefined;

      if (quota !== undefined) {
        return comment ? { share, quota, comment } : { share, quota };
      }
      return null;
    })
    .filter(Boolean) as LmnApiProjectQuota[];

  return JSON.stringify(result);
};

export default parseSophomorixQuota;
