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

import { UploadItem } from '@libs/filesharing/types/uploadItem';
import shouldFilterFile from '@libs/filesharing/utils/shouldFilterFile';

const createFolderUploadItem = (folderName: string, allFiles: File[], id: string): UploadItem => {
  const getFileName = (file: File): string => file.webkitRelativePath?.split('/').pop() || file.name;

  const visibleFiles = allFiles.filter((file) => !shouldFilterFile(getFileName(file)));
  const hiddenFiles = allFiles.filter((file) => shouldFilterFile(getFileName(file)));

  return Object.assign(new File([], folderName, { type: 'application/x-directory' }), {
    id,
    isFolder: true,
    folderName,
    files: visibleFiles,
    visibleFiles,
    hiddenFiles,
    includeHidden: false,
  });
};

export default createFolderUploadItem;
