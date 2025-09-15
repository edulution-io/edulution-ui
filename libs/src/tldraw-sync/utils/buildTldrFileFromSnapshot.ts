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

import { RequestResponseContentType } from '@libs/common/types/http-methods';

const buildTldrFileFromSnapshot = (snapshot: unknown, filename: string): File => {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: RequestResponseContentType.APPLICATION_JSON });
  return new File([blob], `${filename}.tldr`, { type: RequestResponseContentType.APPLICATION_JSON });
};

export default buildTldrFileFromSnapshot;
