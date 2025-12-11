/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import readAllFileEntries from '@libs/filesharing/utils/readAllFileEntries';

const readFileFromEntry = (entry: FileSystemFileEntry, path: string): Promise<File> =>
  new Promise((resolve) => {
    entry.file((file) => {
      const fileWithPath = new File([file], file.name, { type: file.type });
      Object.defineProperty(fileWithPath, 'webkitRelativePath', {
        value: path,
        writable: false,
      });
      resolve(fileWithPath);
    });
  });

const traverseDirectoryEntry = async (entry: FileSystemEntry, path: string = ''): Promise<File[]> => {
  const currentPath = path ? `${path}/${entry.name}` : entry.name;

  if (entry.isFile) {
    const file = await readFileFromEntry(entry as FileSystemFileEntry, currentPath);
    return [file];
  }

  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const entries = await readAllFileEntries(reader);
    const results = await Promise.all(entries.map((e) => traverseDirectoryEntry(e, currentPath)));
    return results.flat();
  }

  return [];
};

export default traverseDirectoryEntry;
