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

import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import isImageExtension from '@libs/filesharing/utils/isImageExtension';
import isMediaExtension from '@libs/filesharing/utils/isMediaExtension';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';

const isValidFileToPreview = (file: DirectoryFileDTO | null): boolean => {
  if (!file) {
    return false;
  }
  const extension = getFileExtension(file.filePath);
  return isOnlyOfficeDocument(file.filePath) || isImageExtension(extension) || isMediaExtension(extension);
};

export default isValidFileToPreview;
