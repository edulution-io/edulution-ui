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

const generateUniqueFilename = (baseName: string, extension: string, existingFiles: DirectoryFileDTO[]) => {
  const suffixPattern = /(.*)\((\d+)\)$/;
  let namePrefix = baseName;
  let sequenceNumber = 0;

  const existingFileNames = new Set(existingFiles.map((file) => file.basename));

  const original = `${baseName}${extension}`;
  if (!existingFileNames.has(original)) {
    return original;
  }

  if (existingFileNames.has(`${baseName}${extension}`)) {
    const match = baseName.match(suffixPattern);
    if (match) {
      namePrefix = match[1].trim();
      sequenceNumber = parseInt(match[2], 10);
    }
  }
  let uniqueFileName: string;
  do {
    sequenceNumber += 1;
    uniqueFileName = `${namePrefix}(${sequenceNumber})${extension}`;
  } while (existingFileNames.has(uniqueFileName));

  return uniqueFileName;
};

export default generateUniqueFilename;
