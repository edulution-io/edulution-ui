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

import { Logger } from '@nestjs/common';
import parseWebDAVMultiStatus from '@libs/filesharing/utils/parseWebDAVMultiStatus';
import parseWebDAVResponse from './parseWebDAVResponse';

const mapToDirectoryFiles = (xmlData: string) => {
  try {
    const responses = parseWebDAVMultiStatus(xmlData);
    return responses.map(parseWebDAVResponse).filter((file) => file && file.filename !== '');
  } catch (error) {
    Logger.error('Error parsing XML data:', error);
    return [];
  }
};

export default mapToDirectoryFiles;
