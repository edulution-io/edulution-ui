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

import readAllFileEntries from '@libs/filesharing/utils/readAllFileEntries';
import { ZipEntries } from '@libs/filesharing/types/zipEntries';

export const collectEntries = async (entry: FileSystemEntry, parentPath = ''): Promise<ZipEntries> => {
  if (entry.isFile) {
    const file = await new Promise<File>((res) => {
      (entry as FileSystemFileEntry).file(res);
    });
    return { [`${parentPath}${file.name}`]: new Uint8Array(await file.arrayBuffer()) };
  }

  const dirPath = `${parentPath}${entry.name}/`;
  const reader = (entry as FileSystemDirectoryEntry).createReader();
  const children = await readAllFileEntries(reader);

  const aggregated: ZipEntries = {};
  await Promise.all(
    children.map(async (child) => {
      Object.assign(aggregated, await collectEntries(child, dirPath));
    }),
  );
  return aggregated;
};

export default collectEntries;
