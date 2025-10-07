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

const STR_DISTINGUISHER = '_--_';

export const addUuidToFileName = (originalFileName: string): string => {
  const dotIndex = originalFileName.lastIndexOf('.');
  if (dotIndex === -1) {
    return originalFileName;
  }

  const name = originalFileName.slice(0, dotIndex);
  const ext = originalFileName.slice(dotIndex + 1);

  return `${name}${STR_DISTINGUISHER}${uuidv4()}.${ext}`;
};

export const removeUuidFromFileName = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1) {
    return fileName;
  }

  const name = fileName.slice(0, dotIndex);
  const ext = fileName.slice(dotIndex + 1);

  const distinguisherIndex = name.lastIndexOf(STR_DISTINGUISHER);
  if (distinguisherIndex === -1) {
    return fileName;
  }

  return `${name.slice(0, distinguisherIndex)}.${ext}`;
};
