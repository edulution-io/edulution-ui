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

import { UploadFile } from '@libs/filesharing/types/uploadFile';

const extractAllDirectories = (folder: UploadFile, basePath: string): string[] => {
  if (!folder.files) return [];

  const directories = new Set<string>();

  folder.files.forEach((file) => {
    const relativePath = file.webkitRelativePath || '';
    if (!relativePath) return;

    const parts = relativePath.split('/');
    for (let i = 0; i < parts.length - 1; i += 1) {
      const dirPath = parts.slice(0, i + 1).join('/');
      directories.add(`${basePath}/${dirPath}`);
    }
  });

  return Array.from(directories).sort();
};

export default extractAllDirectories;
