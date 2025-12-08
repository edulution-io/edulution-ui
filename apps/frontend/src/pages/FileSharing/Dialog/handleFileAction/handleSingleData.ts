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

import FileActionType from '@libs/filesharing/types/fileActionType';
import { HttpMethods } from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import eduApi from '@/api/eduApi';
import buildApiFilePathUrl from '@libs/filesharing/utils/buildApiFilePathUrl';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';

const handleSingleData = async (
  action: FileActionType,
  endpoint: string,
  httpMethod: HttpMethods,
  type: ContentType,
  data: PathChangeOrCreateProps,
  webdavShare: string | undefined,
): Promise<void> => {
  if (action === FileActionType.CREATE_FOLDER) {
    await eduApi[httpMethod](endpoint, data, {
      params: {
        share: webdavShare,
        type,
        path: data.path,
      },
    });
  }
  if (action === FileActionType.MOVE_FILE_OR_FOLDER || action === FileActionType.RENAME_FILE_OR_FOLDER) {
    await eduApi[httpMethod](buildApiFilePathUrl(endpoint, data.path), data);
  }
};

export default handleSingleData;
