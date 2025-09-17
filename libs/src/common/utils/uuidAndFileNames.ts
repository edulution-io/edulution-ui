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

import { v4 as uuidv4 } from 'uuid';

export const STR_DISTINGUISHER = '_--_';

export const addUuidToFileName = (originalFileName: string): string => {
  if (!originalFileName.includes('.')) {
    return originalFileName;
  }
  const fileNameParts = originalFileName.split('.');
  if (fileNameParts.length <= 1) {
    return originalFileName;
  }
  const fileExtension = fileNameParts.pop();
  if (!fileExtension) {
    return originalFileName;
  }
  const fileName = fileNameParts.join('.');
  return `${fileName}${STR_DISTINGUISHER}${uuidv4()}.${fileExtension}`;
};

export const removeUuidFromFileName = (fileName: string): string => {
  if (!fileName.includes(STR_DISTINGUISHER)) {
    return fileName;
  }

  const fileNameParts = fileName.split('.');
  const fileExtension = fileNameParts.pop();
  if (!fileExtension) {
    return fileName;
  }

  const fileNameDistinguishedParts = fileName.split(STR_DISTINGUISHER);
  if (fileNameDistinguishedParts.length <= 1) {
    return fileName;
  }
  fileNameDistinguishedParts.pop();

  const originalFileName = fileNameDistinguishedParts.join(STR_DISTINGUISHER);
  return `${originalFileName}.${fileExtension}`;
};
