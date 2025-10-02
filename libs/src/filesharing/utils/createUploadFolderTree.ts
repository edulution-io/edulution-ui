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
import UploadFolder from '@libs/filesharing/types/uploadFolder';

const createUploadFolderTree = (files: UploadFile[], getPath: (uploadFile: UploadFile) => string): UploadFolder => {
  const firstPath = getPath(files[0]);
  const rootName = firstPath.split('/')[0] || files[0].name;

  let root: UploadFolder = { id: rootName, name: rootName, path: rootName, files: [], subfolders: [] };

  const upsertDirs = (node: UploadFolder, dirs: string[], file: UploadFile, level: number): UploadFolder => {
    if (level >= dirs.length) {
      return { ...node, files: [...node.files, file] };
    }

    const nextName = dirs[level];
    const existing = node.subfolders.find((sf) => sf.name === nextName);
    const baseChild: UploadFolder = existing ?? {
      id: `${node.id}/${nextName}`,
      name: nextName,
      path: `${node.path}/${nextName}`,
      files: [],
      subfolders: [],
    };

    const updatedChild = upsertDirs(baseChild, dirs, file, level + 1);
    const updatedSubs = existing
      ? node.subfolders.map((sf) => (sf.name === nextName ? updatedChild : sf))
      : [...node.subfolders, updatedChild];

    return { ...node, subfolders: updatedSubs };
  };

  files.forEach((file) => {
    const parts = getPath(file).split('/').filter(Boolean);
    const dirSegments = parts.slice(1, -1);

    root =
      dirSegments.length === 0 ? { ...root, files: [...root.files, file] } : upsertDirs(root, dirSegments, file, 0);
  });

  return root;
};

export default createUploadFolderTree;
