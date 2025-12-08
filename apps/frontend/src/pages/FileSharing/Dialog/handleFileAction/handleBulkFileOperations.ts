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

import { HttpMethods } from '@libs/common/types/http-methods';
import eduApi from '@/api/eduApi';
import FileActionType from '@libs/filesharing/types/fileActionType';
import PathChangeOrCreateDto from '@libs/filesharing/types/pathChangeOrCreateProps';
import { t } from 'i18next';
import { HttpStatusCode } from 'axios';

const handleBulkFileOperations = async (
  action: FileActionType,
  endpoint: string,
  httpMethod: HttpMethods,
  items: PathChangeOrCreateDto[],
  share: string | undefined,
  setResult: (success: boolean | undefined, message: string, statusCode: number) => void,
  handleDeleteItems: (items: PathChangeOrCreateDto[], endpoint: string, share: string | undefined) => Promise<void>,
) => {
  try {
    switch (action) {
      case FileActionType.DELETE_FILE_OR_FOLDER:
        await handleDeleteItems(items, endpoint, share);
        break;

      case FileActionType.MOVE_FILE_OR_FOLDER:
      case FileActionType.RENAME_FILE_OR_FOLDER:
      case FileActionType.COPY_FILE_OR_FOLDER:
        await eduApi[httpMethod](endpoint, items, { params: { share } });
        break;
      default:
    }

    const success = [FileActionType.RENAME_FILE_OR_FOLDER, FileActionType.COPY_FILE_OR_FOLDER].includes(action)
      ? true
      : undefined;

    setResult(success, t('fileOperationSuccessful'), HttpStatusCode.Ok);
  } catch (rawError: unknown) {
    setResult(false, t('unknownErrorOccurred'), HttpStatusCode.InternalServerError);
  }
};

export default handleBulkFileOperations;
