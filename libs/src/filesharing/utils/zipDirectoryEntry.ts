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

import addEntryToZipFile from '@libs/filesharing/utils/addEntryToZipFile';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import { UploadFile } from '@libs/filesharing/types/uploadFile';
import toArrayBuffer from '@libs/common/utils/toArrayBuffer';

const zipDirectoryEntry = async (dirEntry: FileSystemDirectoryEntry): Promise<UploadFile> => {
  const bytes = await addEntryToZipFile(dirEntry);
  const blob = new Blob([toArrayBuffer(bytes)], { type: RequestResponseContentType.APPLICATION_ZIP });

  return Object.assign(new File([blob], `${dirEntry.name}.zip`, { type: RequestResponseContentType.APPLICATION_ZIP }), {
    isZippedFolder: true as const,
    originalFolderName: dirEntry.name,
  }) as UploadFile;
};

export default zipDirectoryEntry;
