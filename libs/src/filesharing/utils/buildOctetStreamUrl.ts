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

import { UploadFile } from '@libs/filesharing/types/uploadFile';

const buildOctetStreamUrl = (baseUploadUrl: string, destinationPath: string, fileItem: UploadFile): string => {
  const query = new URLSearchParams();
  query.set('path', destinationPath);
  query.set('name', fileItem.name);
  query.set('isZippedFolder', String(!!fileItem.isZippedFolder));
  query.set('declaredSize', String(fileItem.size));
  return `${baseUploadUrl}?${query.toString()}`;
};

export default buildOctetStreamUrl;
