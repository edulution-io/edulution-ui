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

import { HTTP_HEADERS, HttpMethods, RequestResponseContentType } from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import eduApi from '@/api/eduApi';

const handleFileOrCreateFile = async (
  endpoint: string,
  httpMethod: HttpMethods,
  type: ContentType,
  originalFormData: FormData,
  webdavShare: string | undefined,
) => {
  const path = String(originalFormData.get('path') ?? '');

  const file = originalFormData.get('file') as File | null;
  if (!file) return;

  const filenameFromForm =
    (originalFormData.get('name') as string) || (originalFormData.get('filename') as string) || file?.name || '';

  if (!filenameFromForm) {
    return;
  }

  const originalFolderName = (originalFormData.get('originalFolderName') as string | null) || undefined;

  await eduApi[httpMethod](endpoint, file, {
    withCredentials: true,
    params: {
      share: webdavShare,
      type,
      path,
      name: filenameFromForm,
      isZippedFolder: false,
      ...(originalFolderName ? { originalFolderName } : {}),
      contentLength: file.size,
    },
    headers: {
      [HTTP_HEADERS.ContentType]: file.type || RequestResponseContentType.APPLICATION_OCTET_STREAM,
    },
  });
};

export default handleFileOrCreateFile;
