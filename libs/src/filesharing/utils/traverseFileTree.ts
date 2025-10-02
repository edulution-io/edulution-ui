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
import readAllEntries from './readAllEntries';

const traverseFileTree = async (entry: FileSystemEntry, path = ''): Promise<UploadFile[]> => {
  if (entry.isFile) {
    return new Promise<UploadFile[]>((resolve) => {
      (entry as FileSystemFileEntry).file((f) => {
        const clean = new File([f], f.name, { type: f.type, lastModified: f.lastModified }) as UploadFile;
        (clean as unknown as { relativePath: string }).relativePath = `${path}${f.name}`;
        resolve([clean]);
      });
    });
  }

  if (entry.isDirectory) {
    const dir = entry as FileSystemDirectoryEntry;
    const reader = dir.createReader();
    const entries = await readAllEntries(reader);

    const children = await Promise.all(entries.map((ent) => traverseFileTree(ent, `${path}${dir.name}/`)));

    return children.flat();
  }

  return [];
};
export default traverseFileTree;
