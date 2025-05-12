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
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import eduApi from '@/api/eduApi';
import FileActionType from '@libs/filesharing/types/fileActionType';
import PathChangeOrCreateDto from '@libs/filesharing/types/pathChangeOrCreateProps';
import buildApiDeletePathUrl from '@libs/filesharing/utils/buildApiDeletePathUrl';
import DeleteTargetType from '@libs/filesharing/types/deleteTargetType';
import { t } from 'i18next';

async function handleDeleteItems(itemsToDelete: PathChangeOrCreateDto[], endpoint: string): Promise<void> {
  const cleanPaths = itemsToDelete.map((item) => getPathWithoutWebdav(item.path));
  const url = buildApiDeletePathUrl(endpoint, DeleteTargetType.FILE_SERVER);
  await eduApi.delete(url, { data: { paths: cleanPaths } });
}

export default async function handleBulkFileOperations(
  action: FileActionType,
  endpoint: string,
  httpMethod: HttpMethods,
  items: PathChangeOrCreateDto[],
  setResult: (success: boolean | undefined, message: string, statusCode: number) => void,
) {
  try {
    switch (action) {
      case FileActionType.DELETE_FILE_FOLDER:
        await handleDeleteItems(items, endpoint);
        break;

      case FileActionType.MOVE_FILE_FOLDER:
      case FileActionType.RENAME_FILE_FOLDER:
      case FileActionType.COPY_FILE_OR_FOLDER:
        await eduApi[httpMethod](endpoint, items);
        break;
      default:
    }

    const success = [FileActionType.RENAME_FILE_FOLDER, FileActionType.COPY_FILE_OR_FOLDER].includes(action)
      ? true
      : undefined;

    setResult(success, t('fileOperationSuccessful'), 200);
  } catch (rawError: unknown) {
    const err = rawError as { message?: string; statusCode?: number };

    const message = err.message ?? t('fileOperationFailed');
    const statusCode = err.statusCode ?? 500;

    setResult(false, message, statusCode);
  }
}
