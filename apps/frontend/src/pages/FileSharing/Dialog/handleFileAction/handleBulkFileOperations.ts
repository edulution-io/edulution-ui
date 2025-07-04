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
  setResult: (success: boolean | undefined, message: string, statusCode: number) => void,
  handleDeleteItems: (items: PathChangeOrCreateDto[], endpoint: string) => Promise<void>,
) => {
  try {
    switch (action) {
      case FileActionType.DELETE_FILE_OR_FOLDER:
        await handleDeleteItems(items, endpoint);
        break;

      case FileActionType.MOVE_FILE_OR_FOLDER:
      case FileActionType.RENAME_FILE_OR_FOLDER:
      case FileActionType.COPY_FILE_OR_FOLDER:
        await eduApi[httpMethod](endpoint, items);
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
